const puppeteer = require( 'puppeteer' )
const geoTools = require( '../Service/GeoTools' )


async function makeTile( x, y, z, scriptName, delayTime, userAgent, browserPromise ) {

  // Константы
  const defaultZoomLevel = 15
  const directionButonSelector = '#gtm-poi-card-get-directions > i'
  const deletePinButonSelector = '#map > div.wm-cards > div.wm-card.is-routing > div > div.wm-routing__top > div.wm-routing__search > div > div.wm-route-search__to > div > div.wm-search__clear-icon > div'
  const searchFieldXPath = '//*[@id="map"]/div[2]/div[2]/div[1]/div/div/input'
  const zoomPlusXPath = '//*[@id="map"]/div[2]/div[2]/div[4]/div[1]/a[1]'
  const zoomMinusXPath = '//*[@id="map"]/div[2]/div[2]/div[4]/div[1]/a[2]'

  // Рассчитать координаты краев и центра области для загрузки (тайла)
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const centerCoordinates = `lat=${coordinates.center.lat} lng=${coordinates.center.lon}`

  // Запустить и настроить страницу браузера
  const browser = await browserPromise
  const page = await browser.newPage()
  await page.setViewport( { width: 1100, height: 450 } )
  await page.setUserAgent(userAgent);


  try {
    //await page.waitFor( delayTime )

    // Загрузить страницу с картой
    const pageUrl = 'https://www.waze.com/en/livemap?utm_campaign=waze_website'
    await page.goto( pageUrl, { waitUntil: 'networkidle2', timeout: 10000} )

    // Навести карту на центр тайла
    await click(searchFieldXPath, page)
    await page.keyboard.type( centerCoordinates )
    page.keyboard.press('Enter');
    await page.waitFor( 500 )

    // Подогнать масштаб
    while(z > await fetchCurrentZoom(page)) {
      await click(zoomPlusXPath, page)
      await page.waitFor( 300 )
    }

    while(z < await fetchCurrentZoom(page)) {
      await click(zoomMinusXPath, page)
      await page.waitFor( 300 )
    }

    // Удалить появившийся по центру экрана маркер
    await page.click ( directionButonSelector )
    await page.waitFor( 100 )
    await page.click ( deletePinButonSelector )
    await page.waitFor( 100 )

    // Сделать кадрированный скриншот
    const cropOptions = {
      fullPage: false,
      clip: {x: 422, y: 97, width: 256, height: 256}
    }

    //const screenshot = await page.screenshot()
    const screenshot = await page.screenshot( cropOptions )

    // Завершение работы
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


async function fetchCurrentZoom(page) {
  const xPathSelector = '//*[@id="map"]/div[2]'

  await page.waitForXPath(xPathSelector);
  const elems = await page.$x(xPathSelector);

  const elementParams = await page.evaluate((...elems) => {
    return elems.map(e => e.className);
  }, ...elems);

  const zoom = elementParams[0].split('--zoom-').pop()
  return zoom
}


module.exports.makeTile = makeTile
