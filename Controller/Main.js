const puppeteer = require( 'puppeteer' )
const express = require( 'express' )
const path = require( 'path' )

worker = require( './Modes/OverpassBase' )

const PORT = process.env.PORT || 5000
const app = express()

app.listen( PORT, () => {
  console.log( 'Listening on port ', PORT )
})


app.get('/', async ( req, res, next ) => {
  res.writeHead( 200, {
    'Content-Type': 'text/plain'
  })
  res.end( 'Hello world' )
})



app.get('/api', async ( req, res, next ) => {
  //let screenshot = await worker.makeTile( 'https://google.com', 68141, 44025, 17 )
  //let screenshot = await worker.makeTile( 'https://google.com', 34070, 22012, 16 )
  let screenshot = await worker.makeTile( 'https://google.com', 17034, 11007, 15 )

  let img = Buffer.from( screenshot, 'base64' )
  res.writeHead( 200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  })
  res.end( img )
})


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
