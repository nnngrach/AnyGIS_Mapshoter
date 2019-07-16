const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )

async function makeTile( x, y, z, scriptName, delayTime, browserPromise) {

  const browser = await browserPromise
  // const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
	// const browser = await puppeteer.launch(herokuDeploymentParams)

  // const page = await pagePromise

  // await page.waitFor( 100 )

	const page = await browser.newPage()
  await page.setViewport( { width: 650, height: 400 } )

  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const centerCoordinates = `${z}/${coordinates.center.lat}/${coordinates.center.lon}&l=`

  const pageUrl = 'https://nakarte.me/#m=' + centerCoordinates + scriptName
	await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 30000} )

  // await page.goto( pageUrl )
  // await Promise.race([
  //   page.waitForNavigation({waitUntil: 'load'}),
  //   page.waitForNavigation({waitUntil: 'networkidle0'})
  // ]);


//   await page.evaluate(async () => {
//   const selectors = Array.from(document.querySelectorAll("img"));
//   await Promise.all(selectors.map(img => {
//     if (img.complete) return;
//     return new Promise((resolve, reject) => {
//       img.addEventListener('load', resolve);
//       img.addEventListener('error', reject);
//     });
//   }));
// })


//canvas class = leaflet-tile leaflet-tile-loaded
//#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tile-pane > div > div > img:nth-child(1)
//#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-rasterMarker-pane > div > div > canvas:nth-child(1)
//*[@id="map"]/div[1]/div[1]/div/div/img[1]
//*[@id="map"]/div[1]/div[9]/div/div/canvas[1]

//*[@id="map"]/div[1]/div[9]/div/div/canvas[1]
//*[@id="map"]/div[1]/div[9]/div/div/canvas[2]
//*[@id="map"]/div[1]/div[9]/div/div/canvas[18]

//await page.waitForSelector( '#map' )
// await page.waitForXPath('//*[@id="map"]/div[1]/div[1]/div/div/img[1]')
// await page.waitForXPath('//*[@id="map"]/div[1]/div[1]/div/div/img[2]')
// await page.waitForXPath('//*[@id="map"]/div[1]/div[1]/div/div/img[3]')
// await page.waitForXPath('//*[@id="map"]/div[1]/div[1]/div/div/img[4]')
// await page.waitForXPath('//*[@id="map"]/div[1]/div[9]/div/div/canvas[1]')
// await page.waitForXPath('//*[@id="map"]/div[1]/div[9]/div/div/canvas[2]')
// await page.waitForXPath('//*[@id="map"]/div[1]/div[9]/div/div/canvas[3]')
// await page.waitForXPath('//*[@id="map"]/div[1]/div[9]/div/div/canvas[4]')
// await page.waitFor( 100 )
// await page.waitFor( 1000 )


  const options = {
    fullPage: false,
    clip: {x: 197, y: 72, width: 256, height: 256}
  }

  //const screenshot = await page.screenshot()
  const screenshot = await page.screenshot( options )
	let imageBufferData = Buffer.from( screenshot, 'base64' )

  await page.close()
	//await browser.close()
	return imageBufferData
}


module.exports.makeTile = makeTile
