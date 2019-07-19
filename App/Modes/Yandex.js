const puppeteer = require( 'puppeteer' )
const geoTools = require( '../Service/GeoTools' )

async function makeTile( x, y, z, scriptName, delayTime, userAgent, browserPromise) {

  const browser = await browserPromise
	const page = await browser.newPage()
  await page.setViewport( { width: 800, height: 450 } )
  await page.setUserAgent(userAgent)
  //await page.setExtraHTTPHeaders({'referer': 'https://yandex.ru/'})

  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const centerCoordinates = `${coordinates.center.lon}%2C${coordinates.center.lat}&z=${z}`

  var displayMode

  switch (scriptName) {
    case 'map':
      displayMode = '?ll='
      break
    case 'satellite':
      displayMode = '?l=sat&ll='
      break
    case 'hybrid':
      displayMode = '?l=sat%2Cskl&ll='
      break
    case 'traffic':
      displayMode = '?l=trf%2Ctrfe&ll='
      break
    default:
      throw new Error( 'Unknown yandex map script parameter' )
  }

  const pageUrl ='https://yandex.ru/maps/' + displayMode + centerCoordinates



  try {
    //await page.waitFor( delayTime )
    await page.goto( pageUrl, { waitUntil: 'networkidle2', timeout: 20000} )
  	//await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 30000, referer: 'https://yandex.ru/'} )


    const busBannerCloseButton = 'body > div.popup._type_tooltip._position_bottom > div.popup__content > div > div.close-button._color_white'
    const cookieBannerCloseButton = 'body > div:nth-child(10) > div > div.lg-cc__controls > button.lg-cc__button.lg-cc__button_type_action'
    await clickIfExist(cookieBannerCloseButton, page)
    await clickIfExist(busBannerCloseButton, page)


    const cropOptions = {
      fullPage: false,
      clip: {x: 451, y: 109, width: 256, height: 256}
    }

    //const screenshot = await page.screenshot()
    const screenshot = await page.screenshot( cropOptions )


    await page.close()
  	return screenshot

  } catch ( error ) {
    await page.close()
    throw new Error( error )
  }
}


async function clickIfExist(selector, page) {
  try {
    await page.waitForSelector(selector, { timeout: 250 })
    //await page.waitFor(100) //???
    await page.click(selector)
  } catch {}
}

module.exports.makeTile = makeTile
