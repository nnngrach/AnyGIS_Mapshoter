const puppeteer = require( 'puppeteer' )
const express = require( 'express' )
const path = require( 'path' )

const worker = require( './Modes/OverpassBase' )

const PORT = process.env.PORT || 5000
const app = express()

app.listen( PORT, () => {
  console.log( 'Listening on port ', PORT )
})


app.get('/', async ( req, res, next ) => {
  res.writeHead( 200, {
    'Content-Type': 'text/plain'
  })
  res.end( 'Puppeteer utility for AnyGIS' )
})



app.get('/:mode/:x/:y/:z', async ( req, res, next ) => {

  if (!isInt(req.params.x)) return next(error(400, 'X must must be Intager'))
  if (!isInt(req.params.y)) return next(error(400, 'Y must must be Intager'))
  if (!isInt(req.params.z)) return next(error(400, 'Z must must be Intager'))

  switch (req.params.mode) {

    case 'overpass':

      const script = req.query.script
      if (!script) return next(error(400, 'No script paramerer'))

      const screenshot = await worker.makeTile( Number(req.params.x), Number(req.params.y), Number(req.params.z) )
      //const screenshot = await worker.makeTile( 68141, 44025, 17 )

      res.writeHead( 200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshot.length
      })
      res.end( screenshot )
      break

    default:
      return next(error(400, 'Unknown mode value'))
  }

/*
  let screenshot = await worker.makeTile( 'https://google.com', 68141, 44025, 17 )
  //let screenshot = await worker.makeTile( 'https://google.com', 34070, 22012, 16 )
  //let screenshot = await worker.makeTile( 'https://google.com', 17034, 11007, 15 )
*/
})



function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}


/*
app.get('/text/:inputText', async (req, res, next) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end(req.params["inputText"]);
});
*/






/*
const generateScreenshot = async (url) => {
  try {
    const browser = await puppeteer.launch({
      'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox'
      ]
    })

    const page = await browser.newPage()
    await page.goto(url)
    await page.setViewport({width: 1920, height: 1080})
    const image = await page.screenshot({encoding: 'base64'})
    browser.close()
    return image
  } catch (err) {
    console.error(err.response)
  }
}
*/
