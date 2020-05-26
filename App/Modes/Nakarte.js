const puppeteer = require( 'puppeteer' )
const geoTools = require( '../Service/GeoTools' )


async function makeTile( x, y, z, scriptName, delayTime, userAgent, browserPromise) {

  const hideMenuXPathSelector = "//*[@id=\"map\"]/div[2]/div[2]/div[2]/div[2]/div/div[1]/div/div[1]"


  const browser = await browserPromise
	const page = await browser.newPage()
  await page.setViewport( { width: 1400, height: 1400 } )
  await page.setUserAgent(userAgent)
  //await page.waitFor( delayTime )

  const coordinates = geoTools.getAllBigTileCoordinates( x, y, z )
  const centerCoordinates = `${z}/${coordinates.center.lat}/${coordinates.center.lon}&l=`
  const pageUrl = 'https://nakarte.me/#m=' + centerCoordinates + scriptName



  try {
  	await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 30000} )

    await click( hideMenuXPathSelector, page )

    const cropOptions = {
      fullPage: false,
      clip: {x: 188, y: 188, width: 1024, height: 1024}
    }

    //const screenshot = await page.screenshot()
    const screenshot = await page.screenshot( cropOptions )

    await page.close()
    return screenshot

  } catch ( error ) {
    await page.close()
    throw new Error( error.message )
  }
}


async function click( xPathSelector, page ) {
  await page.waitForXPath(xPathSelector)
  const foundedElements = await page.$x(xPathSelector)

  if (foundedElements.length > 0) {
    await foundedElements[0].click()
  } else {
    throw new Error("XPath element not found: ", xPathSelector)
  }
}

module.exports.makeTile = makeTile
