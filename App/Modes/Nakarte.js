const puppeteer = require( 'puppeteer' )
const geoTools = require( '../Service/GeoTools' )

async function makeTile( x, y, z, scriptName, delayTime, userAgent, browserPromise) {

  const browser = await browserPromise
	const page = await browser.newPage()
  await page.setViewport( { width: 660, height: 400 } )
  await page.setUserAgent(userAgent)
  //await page.waitFor( delayTime )

  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const centerCoordinates = `${z}/${coordinates.center.lat}/${coordinates.center.lon}&l=`
  const pageUrl = 'https://nakarte.me/#m=' + centerCoordinates + scriptName

  try {
  	await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 30000} )

    const cropOptions = {
      fullPage: false,
      clip: {x: 202, y: 72, width: 256, height: 256}
    }

    // const screenshot = await page.screenshot()
    const screenshot = await page.screenshot( cropOptions )

    await page.close()
    return screenshot

  } catch ( error ) {
    await page.close()
    throw new Error( error.message )
  }
}


module.exports.makeTile = makeTile
