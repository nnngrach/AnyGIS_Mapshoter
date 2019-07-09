const express = require( 'express' )
const queue = require('express-queue')
const requestHandler = require( './RequestHandler' )

const PORT = process.env.PORT || 5000
const app = express()


server = require('http').createServer(app),
server.maxConnections = 20

server.listen( PORT )
console.log( 'Listening on port ', PORT )


// app.listen( PORT, () => {
//   console.log( 'Listening on port ', PORT )
// })


app.use(queue({ activeLimit: 2, queuedLimit: -1 }));


app.get( '/', async ( req, res, next ) => {
  res.writeHead( 200, {'Content-Type': 'text/plain'})
  res.end( 'Puppeteer utility for AnyGIS' )
})



// // Для перенаправления пользователя на одно из свободных зеркал
// app.get( '/:x/:y/:z', async ( req, res, next ) => {
//   if ( !req.params.x ) return next( error( 400, 'No X paramerer' ))
//   if ( !req.params.y ) return next( error( 400, 'No Y paramerer' ))
//   if ( !req.params.z ) return next( error( 400, 'No Z paramerer' ))
//   if ( !req.query.script ) return next( error( 400, 'No script paramerer' ) )
//
//   const randomValue = randomInt( 1, 31 )
//   res.redirect(`https://mapshoter${randomValue}.herokuapp.com/overpass/${req.params.x}/${req.params.y}/${req.params.z}?script=${req.query.script}`)
//   console.log(`https://mapshoter${randomValue}.herokuapp.com/overpass/${req.params.x}/${req.params.y}/${req.params.z}?script=${req.query.script}`)
//   })




// Для непосредственной загрузки тайла
app.get( '/:mode/:x/:y/:z/:minZ', async ( req, res, next ) => {

  const x = req.params.x
  const y = req.params.y
  const z = req.params.z
  const minZ = req.params.minZ
  const scriptName = req.query.script

  var moduleName, defaultUrl

  if ( !isInt( x )) return next( error( 400, 'X must must be Intager' ))
  if ( !isInt( y )) return next( error( 400, 'Y must must be Intager' ))
  if ( !isInt( z )) return next( error( 400, 'Z must must be Intager' ))
  if ( !isInt( minZ )) return next( error( 400, 'MinimalZoom must must be Intager' ))
  if ( !scriptName ) return next( error( 400, 'No script paramerer' ) )


  // Выбираем режим обработки карты
  switch ( req.params.mode ) {

    // API для растеризации карты с сайта OverpassTurbo.eu
    case 'overpass':
      moduleName = './Modes/OverpassBasic'
      defaultUrl = 'http://tile.openstreetmap.org/${z}/${x}/${y}.png'
      return requestHandler.makeRequest(x, y, z, minZ, scriptName, moduleName, defaultUrl, res)
      break

    case 'overpassRunTrails':
      moduleName = './Modes/OverpassRunTrails'
      defaultUrl = 'http://tile.openstreetmap.org/${z}/${x}/${y}.png'
      return requestHandler.makeRequest(x, y, z, minZ, scriptName, moduleName, defaultUrl, res)
      break


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
