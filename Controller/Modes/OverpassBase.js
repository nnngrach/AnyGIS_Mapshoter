const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )


async function makeTile( x, y, z, scriptName ) {

  // Константы
  const searchFieldSelector = '#search'
  const searchPopUpMenuSelector = '#ui-id-1'
  const zoomPlusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in'
  const zoomMinusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out'
  const runButtonSelector = '#navs > div > div.buttons > div:nth-child(1) > a:nth-child(1)'
  const codeEditorSelector = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea'
  const mapViewSelector = '#map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-overlay-pane > svg'
  const mapIsEmptyMessageSelector = '#map_blank'


  // Рассчитать координаты краев и центра области для загрузки (тайла)
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const bBox = `[bbox:${coordinates.bBox.latMin}, ${coordinates.bBox.lonMin}, ${coordinates.bBox.latMax}, ${coordinates.bBox.lonMax}];`;
  //const centerCoordinates = `${coordinates.center.lat} ${coordinates.center.lon}`
  const centerCoordinates = `${coordinates.center.lat};${coordinates.center.lon};${z}`

  // Запустить и настроить браузер
  const pageUrl = 'http://overpass-turbo.eu/' + scriptName
  const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}

  const browser = await puppeteer.launch(herokuDeploymentParams)
  const page = await browser.newPage()
  await page.setViewport( { width: 850, height: 450 } )


  try {

    //await page.waitFor( 1000 )


    // Призумить к нужному месту
    await page.goto( `http://overpass-turbo.eu/?C=${centerCoordinates}`, { waitUntil: 'networkidle2', timeout: 5000001} )

    // Загрузить требуемую веб страницу
    await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 5000002} )



    /*
    // Чтобы показать на экране запрашиваемую область, введем в окошко поиска координаты ее центра
    await page.focus( searchFieldSelector )
    await page.keyboard.type( centerCoordinates )


    // Дождаться, пока появится всплывающее меню и кликнем на первый предложенный адрес
    await page.waitForSelector( searchPopUpMenuSelector , { visible : true, timeout: 50000 } )
    await page.keyboard.press( 'Enter' )
    await page.waitFor( 1000 )
    */

    /*
    // После каждого поиска уровень зума сбрасывается на 18
    const zoomLevelAfterSearch = 18


    // Теперь можно приблизить или отдалить карту, если это требуется
    if ( z < zoomLevelAfterSearch ) {
      const count = zoomLevelAfterSearch - z
      for ( var i = 0; i < count; i++ ) {
        await page.click( zoomMinusButtonSelector )
        await page.waitFor( 300 )
        //await page.waitForSelector( '#map > div.leaflet-map-pane > div.leaflet-tile-pane > div > div.leaflet-tile-container.leaflet-zoom-animated > img:nth-child(1)' )
        //await page.waitForSelector( '#map > div.leaflet-map-pane > div.leaflet-tile-pane > div > div:nth-child(2)' )
      }

    } else if ( z > zoomLevelAfterSearch ) {
      const count = z - zoomLevelAfterSearch
      for ( var i = 0; i < count; i++ ) {
        await page.click( zoomPlusButtonSelector )
        await page.waitFor( 300 )
      }
    }
    */


    // Оригинал - дождаться загрузки всех картинок
    // await page.evaluate(async () => {
    // const selectors = Array.from(document.querySelectorAll("img"));
    // await Promise.all(selectors.map(img => {
    //   if (img.complete) return;
    //   return new Promise((resolve, reject) => {
    //     img.addEventListener('load', resolve);
    //     img.addEventListener('error', reject);
    //     });
    //   }));
    // })


//=================================

/*


    // Вставить нужные строки в окно редактора кода и дождаемся, когда IDE распознает их синтаксис
    await page.focus( codeEditorSelector )
    await page.keyboard.type( bBox + ' //' )
    await page.waitFor( 100 )




    // Нажать на кнопку загрузки гео-данных
    await page.click( runButtonSelector )

    // Дождаться, когда окно просмотра карты обновится
    try {
      await page.waitForSelector( mapIsEmptyMessageSelector, { visible : true, timeout: 1000  } )
    } catch {
      await page.waitForSelector( mapViewSelector, { visible : true, timeout: 1200000  } )
      //await page.waitForSelector( 'body')
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
    throw new Error( error.message )
  }
}



module.exports.makeTile = makeTile
