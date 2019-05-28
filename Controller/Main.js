const puppeteer = require( 'puppeteer' )
const express = require( 'express' )
const path = require( 'path' )

const worker = require( './Modes/OverpassBase' )

const PORT = process.env.PORT || 5000
const app = express()

app.listen( PORT, () => {
  console.log( 'Listening on port ', PORT )
})


app.get( '/', async ( req, res, next ) => {
  res.writeHead( 200, {
    'Content-Type': 'text/plain'
  })
  res.end( 'Puppeteer utility for AnyGIS' )
})



app.get( '/:mode/:x/:y/:z', async ( req, res, next ) => {

  //console.log('==============================')
  //console.log(new Date().getTime() / 1000, ' - R app get')

  if ( !isInt( req.params.x )) return next( error( 400, 'X must must be Intager' ))
  if ( !isInt( req.params.y )) return next( error( 400, 'Y must must be Intager' ))
  if ( !isInt( req.params.z )) return next( error( 400, 'Z must must be Intager' ))


  switch ( req.params.mode ) {

    case 'overpass':

      const scriptName = req.query.script
      if ( !scriptName ) return next( error( 400, 'No script paramerer' ) )

      try {

          const screenshot = await worker.makeTile( Number( req.params.x ),
                                                    Number( req.params.y ),
                                                    Number( req.params.z ),
                                                    scriptName )

          res.writeHead( 200, {
            'Content-Type': 'image/png',
            'Content-Length': screenshot.length
          })

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
