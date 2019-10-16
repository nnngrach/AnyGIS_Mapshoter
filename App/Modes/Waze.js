const puppeteer = require( 'puppeteer' )
const geoTools = require( '../Service/GeoTools' )


async function makeTile( x, y, z, scriptName, delayTime, userAgent, browserPromise ) {

  // Константы
  const defaultZoomLevel = 15
  const searchFieldXPath = '//*[@id="map"]/div[1]/div[1]/div/input'
  const zoomPlusXPath = '//*[@id="map"]/div[2]/div[2]/div[4]/div[1]/a[1]'
  const zoomMinusXPath = '//*[@id="map"]/div[2]/div[2]/div[4]/div[1]/a[2]'
  const directionButonXPath = '//*[@id="gtm-poi-card-get-directions"]'
  const deletePinButonXPatch = '//*[@id="map"]/div[1]/div/div/div/div[2]/div[2]/div/div[4]'


  // Рассчитать координаты краев и центра области для загрузки (тайла)
  const coordinates = geoTools.getAllBigTileCoordinates( x, y, z )
  //const coordinates = geoTools.getAllBigTileCoordinates( x, y, z )
  const centerCoordinates = `lat=${coordinates.center.lat} lng=${coordinates.center.lon}`

  // Запустить и настроить страницу браузера
  const browser = await browserPromise
  const page = await browser.newPage()
  await page.setViewport( { width: 1800, height: 1300 } )
  await page.setUserAgent(userAgent);


  try {
    //await page.waitFor( delayTime )

    // Загрузить страницу с картой
    const pageUrl = 'https://www.waze.com/en/livemap?utm_campaign=waze_website'
    await page.goto( pageUrl, { waitUntil: 'networkidle2', timeout: 10000} )

    // Кликнуть на поле поиска, чтобы в нем появился курсор
    await click( searchFieldXPath, page )

    // Напечатать в поле поиска координаты центра тайла
    await page.keyboard.type( centerCoordinates )

    // Нажать Enter для начала поиска
    page.keyboard.press( 'Enter' );

    // Подождать 500 милисекунд для обновления страницы
    await page.waitFor( 500 )

    // Удалить появившийся по центру экрана маркер
    // Для этого нужно закрыть меню поиска
    await click( directionButonXPath, page )
    await page.waitFor( 100 )

    await click( deletePinButonXPatch, page )
    await page.waitFor( 100 )

    // Кликать на кнопки увеличения или уменьшения
    // пока текущий зум не станет соответствовать требуемому
    while( z > await fetchCurrentZoom( page )) {
      await click( zoomPlusXPath, page )
      await page.waitFor( 300 )
    }

    while( z < await fetchCurrentZoom( page )) {
      await click( zoomMinusXPath, page )
      await page.waitFor( 300 )
    }

    await page.waitFor( 300 )

    // Сделать кадрированный скриншот
    const cropOptions = {
      fullPage: false,
      clip: {x: 414, y: 135, width: 1024, height: 1024}
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
