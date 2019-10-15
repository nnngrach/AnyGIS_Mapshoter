const express = require( 'express' )
const requestHandler = require( './Service/RequestHandler' )
const bigTilesHandler = require( './Service/BigTilesHandler' )
const queue = require( './Service/BigTilesQueue' )
const cache = require( './Service/CacheHandler' )
const imageProcessor = require( './Service/ImageProcessor' )


// Настроить многопоточного режима
// Памяти Heroku хватит примерно на запуск трех браузеров
const { StaticPool } = require("node-worker-threads-pool")
const workerPreset = "./App/Service/WorkerPreset.js"
const workersPool = new StaticPool({
  size: 1,
  task: workerPreset,
  workerData: "no"
})



// Запуск сервера
const PORT = process.env.PORT || 5000
const app = express()

app.listen( PORT, () => {
  console.log( 'Listening on port ', PORT )
})




app.get( '/', async ( req, res, next ) => {
  res.writeHead( 200, {'Content-Type': 'text/plain'})
  res.end( 'AnyGIS Mapshooter. Load vector online-map. Take screenshot. Return PNG tile.' )
})




// Основной метод Mapshooter

app.get( '/:mode/:x/:y/:z/:minZ', async ( req, res, next ) => {

  const x = req.params.x
  const y = req.params.y
  const z = req.params.z
  const minZ = req.params.minZ
  const mode = req.params.mode
  const scriptName = req.query.script

  var moduleName, defaultUrl, maxZ, params, jsonResult, imageBuffer

  if ( !isInt( x )) return next( error( 400, 'X must must be Intager' ))
  if ( !isInt( y )) return next( error( 400, 'Y must must be Intager' ))
  if ( !isInt( z )) return next( error( 400, 'Z must must be Intager' ))
  if ( !isInt( minZ )) return next( error( 400, 'MinimalZoom must must be Intager' ))
  if ( !scriptName ) return next( error( 400, 'No script paramerer' ) )
  if ( !bigTilesHandler.isZoomCorrect( z )) return next( error( 400, 'Zoom level too small' ))


  const bigTileName = bigTilesHandler.getBigTileQueueName(x, y, z, mode, scriptName)

  // если супер-тайл еще не загружается, то поставить его на закачку.
  if (!queue.isTaskInQueue(bigTileName)) {
    queue.addTask(bigTileName)
    const topLeftTile = bigTilesHandler.getTopLeftTileNumbers(x, y)
    const bigTileImage = await downloadBigTile(topLeftTile.x, topLeftTile.y, z, minZ, mode, scriptName, res, next)
    await cropAndCache(bigTileImage, bigTileName)
    queue.setTaskStatus(bigTileName, true)
  }

  // проверять каждые 100мс и ждать, пока не скачается супер-тайл
  while (true) {
    if ( queue.checkTaskStatus(bigTileName)) { break }

    var promise = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve('waiting done')
      }, 100)
    })

    await promise
  }

  // если скачалось, то вернуть пользователю сохраненный и обрезанный мини-тайл
  const cacheTileName = bigTilesHandler.getBigTileCacheName(bigTileName, x, y)
  const cachedSmallTile = await cache.load(cacheTileName)
  sendResponse( {status: "Screenshot", value: cachedSmallTile.data}, res )
})




// Выбираем режим обработки карты
async function downloadBigTile(x, y, z, minZ, mode, scriptName, res, next) {

  switch ( mode ) {

    case 'overpass':
      maxZ = 18
      patchToModule = '../Modes/Overpass'
      params = { x: x, y: y, z: z, minZ: minZ, maxZ: maxZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
      //sendResponse(jsonResult, res)
      return jsonResult
      break

    case 'nakarte':
      console.log("case", x,y,z)
      maxZ = 18
      patchToModule = '../Modes/Nakarte'
      params = { x: x, y: y, z: z, minZ: minZ, maxZ: maxZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
      //sendResponse(jsonResult, res)
      return jsonResult
      break

    case 'waze':
      maxZ = 18
      patchToModule = '../Modes/Waze'
      params = { x: x, y: y, z: z, minZ: minZ, maxZ: maxZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
      //sendResponse(jsonResult, res)
      return jsonResult
      break

    case 'yandex':
      maxZ = 18
      patchToModule = '../Modes/Yandex'
      params = { x: x, y: y, z: z, minZ: minZ, maxZ: maxZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
      //sendResponse(jsonResult, res)
      return jsonResult
      break

    default:
      next( error( 400, 'Unknown mode value' ) )
      break
  }
}


// разрезать супер-тайл 4х4 на кусочки и сохранить их в кэш
async function cropAndCache(bigTileImage, bigTileName) {

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {

      const offsetX = j * 256
      const offsetY = i * 256
      const croppedTile = await imageProcessor.crop(bigTileImage, offsetX, offsetY)
      const cacheName = bigTilesHandler.getBigTileCacheName(bigTileName, j, i)
      cache.save(cacheName, croppedTile)
    }
  }
}






// Вспомогательные функции

function sendResponse(jsonResult, res) {
    switch ( jsonResult.status ) {

      case 'Screenshot':
        imageBuffer = Buffer.from( jsonResult.value, 'base64' )
        res.writeHead( 200, {
          'Content-Type': 'image/png',
          'Content-Length': imageBuffer.length
        })
        res.end( imageBuffer )
        break

      case 'Redirect':
        res.redirect(jsonResult.value)
        break

      case 'Error':
        res.writeHead( 200, {'Content-Type': 'text/plain'})
        res.end( jsonResult.value )
        break

      default:
        next( error( 501, 'Unknown jsonResult status' ) )
        break
      }
}


function isInt( value ) {
  var x = parseFloat( value )
  return !isNaN( value ) && ( x | 0 ) === x
}


function error( status, msg ) {
  var err = new Error( msg )
  err.status = status
  return err
}
