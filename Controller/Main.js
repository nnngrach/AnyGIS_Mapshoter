const express = require( 'express' )
const queue = require('express-queue')
const requestHandlerOverpass = require( './ScreenshotTools/RequestHandlerOverpass' )
const requestHandler = require( './ScreenshotTools/RequestHandler' )
const browserFabric = require( './ScreenshotTools/BrowserFabric' )

const PORT = process.env.PORT || 5000
const app = express()


server = require('http').createServer(app),
server.maxConnections = 40

server.listen( PORT )
console.log( 'Listening on port ', PORT )



//=======================================
// Зона экспериментов

/*
const { Worker } = require('worker_threads')

function runService(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./Controller/service.js', { workerData });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  })
}
*/

const { StaticPool } = require("node-worker-threads-pool");
const filePath = "./Controller/ScreenshotTools/Worker.js";
const pool = new StaticPool({
  size: 4,
  task: filePath,
  workerData: "no"
});

//=======================================



// app.listen( PORT, () => {
//   console.log( 'Listening on port ', PORT )
// })

const browserPromise = browserFabric.create()

//app.use(queue({ activeLimit: 2, queuedLimit: -1 }))
// app.use(queue({ activeLimit: 10, queuedLimit: -1 }))



app.get( '/', async ( req, res, next ) => {
  res.writeHead( 200, {'Content-Type': 'text/plain'})
  res.end( 'Puppeteer utility for AnyGIS' )
})


// Для перенаправления пользователя на одно из свободных зеркал
// app.get( '/:x/:y/:z', async ( req, res, next ) => {
//   const randomValue = randomInt( 1, 31 )
//   res.redirect(`https://mapshoter${randomValue}.herokuapp.com/overpass/${req.params.x}/${req.params.y}/${req.params.z}?script=${req.query.script}`)
//   })




// Для непосредственной загрузки тайла
app.get( '/:mode/:x/:y/:z/:minZ', async ( req, res, next ) => {

  const x = req.params.x
  const y = req.params.y
  const z = req.params.z
  const minZ = req.params.minZ
  const scriptName = req.query.script

  var moduleName, defaultUrl, maxZ, screenshot, imageBuffer

  if ( !isInt( x )) return next( error( 400, 'X must must be Intager' ))
  if ( !isInt( y )) return next( error( 400, 'Y must must be Intager' ))
  if ( !isInt( z )) return next( error( 400, 'Z must must be Intager' ))
  if ( !isInt( minZ )) return next( error( 400, 'MinimalZoom must must be Intager' ))
  if ( !scriptName ) return next( error( 400, 'No script paramerer' ) )


  // Выбираем режим обработки карты
  switch ( req.params.mode ) {

    // OverpassTurbo.eu
    case 'overpass':
      maxZ = 19
      moduleName = '../Modes/OverpassBasic'
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      return requestHandler.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise)
      break

    case 'overpass2':
      maxZ = 19
      moduleName = '../Modes/OverpassBasic2'
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      return requestHandlerOverpass.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise, isBrowserBusyForOverpass)
      break

    // Waze.com
    case 'waze':
      maxZ = 17
      moduleName = '../Modes/Waze'
      defaultUrl = `https://worldtiles1.waze.com/tiles/${z}/${x}/${y}.png`
      return requestHandler.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise)
      break

    // Nakarte.me
    case 'nakarte':
      maxZ = 18
      moduleName = '../Modes/Nakarte'
      //defaultUrl = `https://tile.opentopomap.org/${z}/${x}/${y}.png`
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      return requestHandler.makeRequest(x, y, z, minZ, maxZ, scriptName, moduleName, defaultUrl, res, browserPromise)
      break



    // For testing purposes
    // case 'test0':
    //   const screenshot = await runService('world').catch(err => console.error(err))
    //   const imageBuffer = Buffer.from( screenshot, 'base64' )
    //   res.writeHead( 200, {
    //     'Content-Type': 'image/png',
    //     'Content-Length': imageBuffer.length
    //   })
    //   return res.end( imageBuffer )
    //   break


    case 'test1':
      //const screenshot = await runService('world').catch(err => console.error(err))
      maxZ = 18
      patchToModule = '../Modes/NakarteTest'
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      var params = { x: x, y: y, z: z, minZ: minZ, maxZ: maxZ, scriptName: scriptName, patchToModule: patchToModule, defaultUrl: defaultUrl}
      screenshot = await pool.exec(params);
      imageBuffer = Buffer.from( screenshot.value, 'base64' )
      res.writeHead( 200, {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length
      })
      return res.end( imageBuffer )
      break


    case 'test2':
      maxZ = 18
      patchToModule = '../Modes/OverpassTest'
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      var params = { x: x, y: y, z: z, minZ: minZ, maxZ: maxZ, scriptName: scriptName, patchToModule: patchToModule, defaultUrl: defaultUrl}
      screenshot = await pool.exec(params);
      imageBuffer = Buffer.from( screenshot.value, 'base64' )
      res.writeHead( 200, {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length
      })
      return res.end( imageBuffer )
      break

    case 'test3':
      maxZ = 18
      patchToModule = '../Modes/WazeTest'
      defaultUrl = `http://tile.openstreetmap.org/${z}/${x}/${y}.png`
      var params = { x: x, y: y, z: z, minZ: minZ, maxZ: maxZ, scriptName: scriptName, patchToModule: patchToModule, defaultUrl: defaultUrl}
      screenshot = await pool.exec(params);
      imageBuffer = Buffer.from( screenshot.value, 'base64' )
      res.writeHead( 200, {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length
      })
      return res.end( imageBuffer )
      break


    // case 'test3':
    //   const puppeteer = require( 'puppeteer' )
    //   const browser = await puppeteer.launch()
    //   const page = await browser.newPage()
    //   await page.goto( "https://www.google.ru/", { waitUntil: 'networkidle0', timeout: 30000} )
    //   screenshot = await page.screenshot()
    //   imageBuffer = Buffer.from( screenshot, 'base64' )
    //   await browser.close()
    //
    //   res.writeHead( 200, {
    //     'Content-Type': 'image/png',
    //     'Content-Length': imageBuffer.length
    //   })
    //   return res.end( imageBuffer )
    //   break



    default:
      return next( error( 400, 'Unknown mode value' ) )
  }
})





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


// async function wait(ms) {
//   return new Promise(resolve => {
//     setTimeout(resolve, ms);
//   });
// }
