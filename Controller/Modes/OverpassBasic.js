const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )


async function makeTile( x, y, z, scriptName, delayTime ) {

  // Константы
  const searchFieldSelector = '#search'
  const searchPopUpMenuSelector = '#ui-id-1'
  const zoomPlusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in'
  const zoomMinusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out'
  const runButtonSelector = '#navs > div > div.buttons > div:nth-child(1) > a:nth-child(1)'
  const codeEditorSelector = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea'
  const mapViewSelector = '#map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-overlay-pane > svg'
  const mapIsEmptyMessageSelector = '#map_blank'
  const loadingSelector ='body > div.modal > div > ul'
  const loadedDataIndicatorSelector = '#data_stats'
  const loadingScreenTableSelector = 'body > div.modal > div > ul > li:nth-child(1)'


  // Рассчитать координаты краев и центра области для загрузки (тайла)
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const bBox = `[bbox:${coordinates.bBox.latMin}, ${coordinates.bBox.lonMin}, ${coordinates.bBox.latMax}, ${coordinates.bBox.lonMax}];`;
  const centerCoordinates = `${coordinates.center.lat};${coordinates.center.lon};${z}`

  // Запустить и настроить браузер
  const pageUrl = 'http://overpass-turbo.eu/' + scriptName

  const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
  const browser = await puppeteer.launch(herokuDeploymentParams)

  const page = await browser.newPage()
  await page.setViewport( { width: 850, height: 450 } )


  try {

    await page.waitFor( delayTime )

    // Призумить к нужному месту
    await page.goto( `http://overpass-turbo.eu/?C=${centerCoordinates}`, { waitUntil: 'networkidle2', timeout: 10000} )

    // Загрузить требуемую веб страницу
    //await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 10000} )
    await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 20000} )



    // Вставить нужные строки в окно редактора кода и дождаемся, когда IDE распознает их синтаксис
    await page.focus( codeEditorSelector )
    await page.keyboard.type( bBox + ' //' )
    await page.waitFor( 100 )




    // Нажать на кнопку загрузки гео-данных
    await page.click( runButtonSelector )

    // Дождаться, когда скроется окно с индикатором загрузки
    await page.waitForFunction(() => !document.querySelector('body > div.modal > div > ul > li:nth-child(1)'), {polling: 'mutation'});
    await page.waitFor( 1000 )


/*
    // Дождаться, когда окно просмотра карты обновится
    try {
      console.log( 'mapIsEmptyMessageSelector')
      await page.waitForSelector( mapIsEmptyMessageSelector, { visible : true, timeout: 500  } )
    } catch {
      //await page.waitForSelector( mapViewSelector, { visible : true, timeout: 10000  } )
      try {
        console.log( 'loadingSelector')
        await page.waitForSelector( '#data_stats' )
      } catch {
        console.log( 'catch')
        await page.waitFor( 500 )
      }
    }
*/





    // Сделать кадрированный скриншот
    const options = {
      fullPage: false,
      clip: {x: 489, y: 123, width: 256, height: 256}
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