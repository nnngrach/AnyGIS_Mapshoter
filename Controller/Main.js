const puppeteer = require( 'puppeteer' )
const express = require( 'express' )
const path = require( 'path' )
var timeout = require('connect-timeout')


const worker = require( './Modes/OverpassBase' )

const PORT = process.env.PORT || 5000
const app = express()
app.use(timeout('29s'))


app.listen( PORT, () => {
  console.log( 'Listening on port ', PORT )
})


app.get( '/', async ( req, res, next ) => {
  res.writeHead( 200, {
    'Content-Type': 'text/plain'
  })
  res.end( 'Puppeteer utility for AnyGIS' )
})



// Для перенаправления на одно из свободных зеркал
app.get( '/:x/:y/:z', async ( req, res, next ) => {

  if ( !req.params.x ) return next( error( 400, 'No X paramerer' ))
  if ( !req.params.y ) return next( error( 400, 'No Y paramerer' ))
  if ( !req.params.z ) return next( error( 400, 'No Z paramerer' ))
  if ( !req.query.script ) return next( error( 400, 'No script paramerer' ) )

  const randomValue = randomInt( 1, 10 )
  //console.log(`https://mapshoter${randomValue}.herokuapp.com/overpass/${req.params.x}/${req.params.y}/${req.params.z}?script=${req.query.script}`)
  res.redirect(`https://mapshoter${randomValue}.herokuapp.com/overpass/${req.params.x}/${req.params.y}/${req.params.z}?script=${req.query.script}`)
})





// Для непосредственной загрузки тайла
app.get( '/:mode/:x/:y/:z', async ( req, res, next ) => {

  console.log('==============================')
  //console.log(new Date().getTime() / 1000, ' - R app get')

  if ( !isInt( req.params.x )) return next( error( 400, 'X must must be Intager' ))
  if ( !isInt( req.params.y )) return next( error( 400, 'Y must must be Intager' ))
  if ( !isInt( req.params.z )) return next( error( 400, 'Z must must be Intager' ))


  switch ( req.params.mode ) {

    case 'overpass':

      const scriptName = req.query.script
      if ( !scriptName ) return next( error( 400, 'No script paramerer' ) )
      if ( Number( req.params.z ) < 15 ) return next( error( 400, 'Zoom level < 15' ) )

      try {

          const screenshot = await worker.makeTile( Number( req.params.x ),
                                                    Number( req.params.y ),
                                                    Number( req.params.z ),
                                                    scriptName )

          res.writeHead( 200, {
            'Content-Type': 'image/png',
            'Content-Length': screenshot.length
          })

          console.log( req.params.x, req.params.y, req.params.z )
          res.end( screenshot )

      } catch ( errorMessage ) {
          console.log( errorMessage )
          return next( errorMessage )
      }

      break


    default:
      return next( error( 400, 'Unknown mode value' ) )
  }

})



function isInt( value ) {
  var x = parseFloat( value )
  return !isNaN( value ) && ( x | 0 ) === x
}


function error( status, msg ) {
  var err = new Error( msg )
  err.status = status
  return err
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low)
}
