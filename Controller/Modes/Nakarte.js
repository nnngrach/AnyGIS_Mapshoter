const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )

async function makeTile( x, y, z, scriptName, delayTime ) {

  const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}

	const browser = await puppeteer.launch(herokuDeploymentParams)
	const page = await browser.newPage()
  await page.setViewport( { width: 650, height: 400 } )

  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const centerCoordinates = `${z}/${coordinates.center.lat}/${coordinates.center.lon}&l=`

  const pageUrl = 'https://nakarte.me/#m=' + centerCoordinates + scriptName
	await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 30000} )

  const options = {
    fullPage: false,
    clip: {x: 197, y: 72, width: 256, height: 256}
  }

  //const screenshot = await page.screenshot()
  const screenshot = await page.screenshot( options )
	let imageBufferData = Buffer.from( screenshot, 'base64' )

	await browser.close()
	return imageBufferData
}


module.exports.makeTile = makeTile
