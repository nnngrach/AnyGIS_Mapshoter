const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )


async function makeTile( x, y, z ) {

    console.log(new Date().getTime() / 1000, ' - start MakeTile func')

  const currentUrl = 'http://overpass-turbo.eu/s/Jph' // for test bbox
  const defaultZoom = 18

  const searchFieldSelector = '#search'
  const searchPopUpMenuSelector = '#ui-id-1'
  const zoomPlusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in'
  const zoomMinusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out'
  const runButtonSelector = '#navs > div > div.buttons > div:nth-child(1) > a:nth-child(1)'
  const codeEditorSelector = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea'
  const mapViewSelector = '#map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-overlay-pane > svg'




  const browser = await puppeteer.launch({
    'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
  })

    console.log(new Date().getTime() / 1000, ' - P make browser')




  // Загрузить страницу
  const page = await browser.newPage()
  await page.setViewport({ width: 850, height: 400 })
  await page.goto( currentUrl, { waitUntil: 'networkidle2' } )


    console.log(new Date().getTime() / 1000, ' - P goto page')




  // Получить координаты краев и центра тайла
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const bBox = `[bbox:${coordinates.bBox.latMin}, ${coordinates.bBox.lonMin}, ${coordinates.bBox.latMax}, ${coordinates.bBox.lonMax}];`;
  const centerCoordinates = `${coordinates.center.lat} ${coordinates.center.lon}`

    console.log(new Date().getTime() / 1000, ' - P get coordinates')









  //Призумиться на центр искомого тайла
  console.log(new Date().getTime() / 1000, ' - S focus search field')
  await page.focus( searchFieldSelector )
  await page.keyboard.type( centerCoordinates )

  console.log(new Date().getTime() / 1000, ' - S typing')








  //await page.waitFor( 1000 )
  await page.waitForSelector( searchPopUpMenuSelector , { visible : true } );
    console.log(new Date().getTime() / 1000, ' - S wait for popup menu')
  await page.keyboard.press( 'Enter' )
    console.log(new Date().getTime() / 1000, ' - S press enter')

  //await page.waitFor( 1000 )
  //await page.waitForSelector( mapViewSelector, { visible : true } )
  page.waitForNavigation
    console.log(new Date().getTime() / 1000, ' - S wait 1000')





  //Подогнать под запрашиваемый зум
  if (z < defaultZoom) {
    const count = defaultZoom - z

    //await input.click({ clickCount: 3 })

    for (var i = 0; i < count; i++) {
      await page.click( zoomMinusButtonSelector )
        console.log(new Date().getTime() / 1000, ' - Z zomm click')
      await page.waitFor( 300 )
        console.log(new Date().getTime() / 1000, ' - Z zoom wait 300')
    }

  } else if (z > defaultZoom) {
    const count = z - defaultZoom
    for (var i = 0; i < count; i++) {
      await page.click( zoomPlusButtonSelector )
      await page.waitFor( 300 )
    }
  }







  // Вставить текст и дождаться, когда IDE распознает синтаксис

  await page.focus( codeEditorSelector )
  await page.keyboard.type( bBox + ' //' )
    console.log(new Date().getTime() / 1000, ' - E typing')
  await page.waitFor( 100 )
    console.log(new Date().getTime() / 1000, ' - E wait 100')







  // Нажать на кнопку загрузки
  await page.click( runButtonSelector )

    console.log(new Date().getTime() / 1000, ' - E click Run')



  // Дождаться, когда окно просмотра обновится
  await page.waitForSelector( mapViewSelector, { visible : true } )
  //await page.waitFor(1000);

    console.log(new Date().getTime() / 1000, ' - E wait map viewer')






  // Сделать кадрированный скриншот
  const options = {
    fullPage: false,
    clip: {x: 489, y: 98, width: 256, height: 256}
  }

  const screenshot = await page.screenshot(options);
  //const screenshot = await page.screenshot()

    console.log(new Date().getTime() / 1000, ' - I screenshot')

  let imgageBuffer = Buffer.from( screenshot, 'base64' )

    console.log(new Date().getTime() / 1000, ' - I convert to buffer')

  // Завершение
  await browser.close()
  return imgageBuffer
}



module.exports.makeTile = makeTile
