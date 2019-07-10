const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )


async function makeTile( x, y, z, scriptName, delayTime ) {

  // Константы
  const searchFieldSelector = '#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-medium.wm-map--zoom-14 > div.leaflet-control-container > div.leaflet-top.leaflet-left > div > div > input'
  const zoomSelectorPrefixHi = '#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-close.wm-map--zoom-'
  const zoomSelectorPrefixMid = '#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-medium.wm-map--zoom-'
  const zoomSelectorPrefixLow = '#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-far.wm-map--zoom-'
  //#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-medium.wm-map--zoom-13 > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out
  //#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-medium.wm-map--zoom-12 > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out
  //#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-far.wm-map--zoom-11 > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out
  //#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-far.wm-map--zoom-10 > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out
  //#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-far.wm-map--zoom-9 > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out
  //#map > div.wm-map__leaflet.wm-map.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom.wm-map--zoom-far.wm-map--zoom-8 > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out
  const zoomPlusSelector = ' > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in'
  const zoomMinusSelector = ' > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out'
  const directionButonSelector = '#gtm-poi-card-get-directions > i'
  const deletePinButonSelector = '#map > div.wm-cards > div.wm-card.is-routing > div > div.wm-routing__top > div.wm-routing__search > div > div.wm-route-search__to > div > div.wm-search__clear-icon > div'
  const defaultZoomLevel = 15


  // Рассчитать координаты краев и центра области для загрузки (тайла)
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const centerCoordinates = `lat=${coordinates.center.lat} lng=${coordinates.center.lon}`


  // Запустить и настроить браузер
  const pageUrl = 'https://www.waze.com/en/livemap?utm_campaign=waze_website'

  const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
  const browser = await puppeteer.launch(herokuDeploymentParams)

  const page = await browser.newPage()
  await page.setViewport( { width: 1100, height: 450 } )


  try {
    await page.waitFor( delayTime )
    await page.goto( pageUrl, { waitUntil: 'networkidle2', timeout: 10000} )


    // Навести карту на центр тайла
    await page.click ( searchFieldSelector )
    await page.keyboard.type( centerCoordinates )
    page.keyboard.press('Enter');
    await page.waitFor( 500 )



    // Подогнать масштаб
    if (z > defaultZoomLevel) {
      for (var i = 0; i < z-defaultZoomLevel; i++) {
        const currentZoom = defaultZoomLevel + i
        const selector = zoomSelectorPrefixHi + currentZoom + zoomPlusSelector
        await page.click(selector)
        await page.waitFor( 300 )
      }
    } else if (z < defaultZoomLevel) {

      for (var i = 0; i < defaultZoomLevel-z; i++) {

        //Адрес кнопок зума меняется в зависимости от текущего зума
        var currentPrefix
        if (i < 1) {
          currentPrefix = zoomSelectorPrefixHi
        } else if (i < 4) {
          currentPrefix = zoomSelectorPrefixMid
        } else {
          currentPrefix = zoomSelectorPrefixLow
        }

        const currentZoom = defaultZoomLevel - i
        const selector = currentPrefix + currentZoom + zoomMinusSelector
        await page.click(selector)
        await page.waitFor( 300 )
      }
    }



    // Удалить появившийся по центру карты указатель
    await page.click ( directionButonSelector )
    await page.waitFor( 100 )
    await page.click ( deletePinButonSelector )
    await page.waitFor( 100 )



    // Сделать кадрированный скриншот
    const options = {
      fullPage: false,
      clip: {x: 422, y: 97, width: 256, height: 256}
    }



    //const screenshot = await page.screenshot()
    const screenshot = await page.screenshot( options )
    let imageBufferData = Buffer.from( screenshot, 'base64' )


    // Завершение работы
    await browser.close()
    return imageBufferData



  } catch ( error ) {
    await browser.close()
    throw new Error( error.message )
  }
}



module.exports.makeTile = makeTile
