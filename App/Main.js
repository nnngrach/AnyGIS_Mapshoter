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



// Стартовое сообщение (index)
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

  if ( !isInt( x )) return next( error( 400, 'X must must be Intager' ))
  if ( !isInt( y )) return next( error( 400, 'Y must must be Intager' ))
  if ( !isInt( z )) return next( error( 400, 'Z must must be Intager' ))
  if ( !isInt( minZ )) return next( error( 400, 'MinimalZoom must must be Intager' ))
  if ( !scriptName ) return next( error( 400, 'No script paramerer' ) )


  // Отсеиваем слишком мелкие уровни зума
  if ( !bigTilesHandler.isZoomCorrect(z)) return redirectToDefaultMap(x,y,z,mode,res)
  if ( parseInt(z) < parseInt(minZ) ) return redirectToDefaultMap(x,y,z,mode,res)

  // Получаем имя супер-тайла для сохранения в очередь
  const bigTileName = bigTilesHandler.getBigTileQueueName(x, y, z, mode, scriptName)

  // если супер-тайл еще не загружается, то поставить его на закачку.
  if (!queue.isTaskInQueue(bigTileName)) {
    downloadBigTileToCache(x, y, z, minZ, mode, scriptName, bigTileName, res, next)
  }

  // ждать, пока не скачается супер-тайл
  const status = await waitForSuperTileInCache(bigTileName)
  if (!status.isDone) return next( error( 400, 'Timeout for caching' ) )

  // если скачалось, то вернуть пользователю сохраненный и обрезанный мини-тайл
  const cacheTileName = bigTilesHandler.getBigTileCacheName(bigTileName, x, y)
  const cachedSmallTile = await cache.load(cacheTileName)
  return showTile(cachedSmallTile.data, res)
})



// Варианты ответа пользователю

function showTile(tile, res) {
  imageBuffer = Buffer.from( tile, 'base64' )
  res.writeHead( 200, {
    'Content-Type': 'image/png',
    'Content-Length': imageBuffer.length
  })
  res.end( imageBuffer )
}


function redirectToDefaultMap(x, y, z, mode, res) {
  const defaultUrls = {
    "nakarte" : `http://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    "overpass" : `http://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    "waze" : `https://worldtiles1.waze.com/tiles/${z}/${x}/${y}.png`,
    "yandex" : `http://tiles.maps.sputnik.ru/tiles/kmt2/${z}/${x}/${y}.png`
  }
  return res.redirect(defaultUrls[mode])
}


function showErrorMessage(errorMessage, res) {
  res.writeHead( 200, {'Content-Type': 'text/plain'})
  res.end( errorMessage)
}



// Скачивание от обработка супер-тайла
async function downloadBigTileToCache(x, y, z, minZ, mode, scriptName, bigTileName, res, next) {

  queue.addTask(bigTileName)
  const topLeftTile = bigTilesHandler.getTopLeftTileNumbers(x, y)
  const bigTileImage = await takeBigTileImage(topLeftTile.x, topLeftTile.y, z, minZ, mode, scriptName, res, next)

  if (bigTileImage.status != "Error") {
    await cropAndCache(bigTileImage, bigTileName)
    queue.setTaskStatus(bigTileName, true)
  } else {
    console.log(bigTileImage.value)
    return showErrorMessage(bigTileImage.value)
  }
}


// Скачивание супер-тайла в зависимости от типа карты
async function takeBigTileImage(x, y, z, minZ, mode, scriptName, res, next) {

  switch ( mode ) {

    case 'overpass':
      patchToModule = '../Modes/Overpass'
      params = { x: x, y: y, z: z, minZ: minZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
      return jsonResult
      break

    case 'nakarte':
      patchToModule = '../Modes/Nakarte'
      params = { x: x, y: y, z: z, minZ: minZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
      return jsonResult
      break

    case 'waze':
      patchToModule = '../Modes/Waze'
      params = { x: x, y: y, z: z, minZ: minZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
      //return showTile(jsonResult.value, res)
      return jsonResult
      break

    case 'yandex':
      patchToModule = '../Modes/Yandex'
      params = { x: x, y: y, z: z, minZ: minZ, scriptName: scriptName, patchToModule: patchToModule}
      jsonResult = await workersPool.exec(params)
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


// проверять каждые 250мс и ждать, не появилась ли отметка, что супер-тайл скачан
async function waitForSuperTileInCache(bigTileName) {

  const timeout = 60000
  const waitingInterval = 250
  const iterationsCount = timeout / waitingInterval

  for (var i = 0; i < iterationsCount; i++) {

    if ( queue.checkTaskStatus(bigTileName)) { return {isDone: true} }

    var promise = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve('waiting done')
      }, waitingInterval)
    })

    await promise
  }

  return {isDone: false}
}





// Вспомогательные функции

function isInt( value ) {
  var x = parseFloat( value )
  return !isNaN( value ) && ( x | 0 ) === x
}


function error( status, msg ) {
  var err = new Error( msg )
  err.status = status
  return err
}
