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


  // Рассчитать координаты краев и центра области для загрузки (тайла)
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const centerCoordinates = `${z}/${coordinates.center.lat}/${coordinates.center.lon}&l=`

  // Запустить и настроить браузер
  const pageUrl = 'https://nakarte.me/#m=' + centerCoordinates + scriptName
  //const pageUrl = 'https://nakarte.me/'
  console.log(pageUrl)

  const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
  //const browser = await puppeteer.launch(herokuDeploymentParams)
  const browser = await puppeteer.launch()

  const page = await browser.newPage()
  await page.setViewport( { width: 850, height: 450 } )


  try {

    //await page.waitFor( delayTime )

    //await page.goto( pageUrl, { waitUntil: 'networkidle2', timeout: 30000} )
    //await page.goto( 'https://nakarte.me/#m=16/55.63134/37.55772&l=O/Gc', { waitUntil: 'networkidle0'} )
    //await page.goto( 'https://nakarte.me/#m=16/55.63134/37.55772&l=O/Gc' )

    //const pageUrlTest = 'https://nakarte.me/#m=16/55.63134/37.55772&l=Ocm'
    //const pageUrlTest = 'https://nakarte.me'
    const pageUrlTest = 'https://nakarte.me/#m=10/55.75185/37.61856&l=O'
    const pageUrlTest2 =  'https://nakarte.me/#m=17/55.61481345414472/37.547149658203125&l=Otm/Gc'

    // try {
    //   console.log( new Date().getTime() / 1000, ' goto')
    //   await page.goto( pageUrlTest, { waitUntil: 'networkidle0', timeout: 20000} )
    // } catch {
    //   console.log( new Date().getTime() / 1000, ' goto catch')
    //   await page.waitFor( 100 )
    // }

    //await page.goto( 'https://www.waze.com/ru/livemap?utm_campaign=waze_website' )
    await page.goto( 'https://pereval.online/' )
    //await page.goto( 'https://nakarte.me', { waitUntil: 'networkidle2', timeout: 40000} )
    //await page.goto( pageUrlTest, { waitUntil: 'networkidle0', timeout: 40000} )



    console.log( new Date().getTime() / 1000, ' next')

    await page.waitFor( 1000 )

    console.log( new Date().getTime() / 1000, ' next2')
    //await page.waitForNavigation();

    //await page.waitFor( 1000 )


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
      //await page.waitForSelector( mapViewSelector, { visible : true, timeout: 10000  } )
      try {
        await page.waitForSelector( loadingSelector, { visible : false, timeout: 10000 } )
        await page.waitFor( 1000 )
      } catch {
        await page.waitFor( 500 )
      }
    }

    */



    // Сделать кадрированный скриншот
    /*
    const options = {
      fullPage: false,
      clip: {x: 489, y: 123, width: 256, height: 256}
    }
    */

    console.log( new Date().getTime() / 1000, ' opt')

    const screenshot = await page.screenshot()
    // const screenshot = await page.screenshot( options )

    console.log( new Date().getTime() / 1000, ' screen')

    let imageBufferData = Buffer.from( screenshot, 'base64' )

    console.log( new Date().getTime() / 1000, ' buffer')


    // Завершение работы
    await browser.close()
    console.log( new Date().getTime() / 1000, ' browser close')
    return imageBufferData



  } catch ( error ) {
    await browser.close()
    throw new Error( error.message )
  }
}



module.exports.makeTile = makeTile
