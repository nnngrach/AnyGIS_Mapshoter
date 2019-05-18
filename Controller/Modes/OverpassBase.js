const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )


async function makeTile( url, x, y, z ) {

  //const currentUrl = 'http://overpass-turbo.eu/s/IXl';
  const currentUrl = 'http://overpass-turbo.eu/s/J4Q'

  const searchFieldSelector = '#search'
  const searchPopUpMenuSelector = '#ui-id-1'
  const zoomPlusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-in'
  const zoomMinusButtonSelector = '#map > div.leaflet-control-container > div.leaflet-top.leaflet-left > div.leaflet-control-zoom.leaflet-bar.leaflet-control > a.leaflet-control-zoom-out'
  const runButtonSelector = '#navs > div > div.buttons > div:nth-child(1) > a:nth-child(1)'
  const codeEditorSelector = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea'
  const mapViewSelector = '#map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-overlay-pane > svg'

  const defaultZoom = 18



  const browser = await puppeteer.launch({
    'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
  })




  // Загрузить страницу
  const page = await browser.newPage()
  //await page.goto(currentUrl);
  await page.goto( currentUrl, { waitUntil: 'networkidle2' } )



  // Получить координаты краев и центра тайла
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const bBox = `(${coordinates.bBox.latMin}, ${coordinates.bBox.lonMin}, ${coordinates.bBox.latMax}, ${coordinates.bBox.lonMax})`;
  const centerCoordinates = `${coordinates.center.lat} ${coordinates.center.lon}`
  //console.log(centerCoordinates)



  // Сгенерировать запрос для Оверпасса
  //const overpassCode = '(node(50.746,7.154,50.748,7.157););out;>;out skel qt;';
  var overpassCode = '(node;);out;>;out skel qt;'
  overpassCode = overpassCode.replace( 'node', 'node' + bBox )
  overpassCode = overpassCode.replace( 'way', 'way' + bBox )
  overpassCode = overpassCode.replace( 'rel', 'rel' + bBox )
  //console.log(overpassCode)



  //Призумиться на центр искомого тайла
  await page.focus( searchFieldSelector )
  await page.keyboard.type( centerCoordinates )
  await page.waitForSelector( searchPopUpMenuSelector , { visible : true } );
  await page.keyboard.press( 'Enter' )
  await page.waitFor( 1000 )


  //Подогнать под запрашиваемый зум
  if (z < defaultZoom) {
    const count = defaultZoom - z
    for (var i = 0; i < count; i++) {
      console.log("click")
      await page.click( zoomMinusButtonSelector )
      await page.waitFor( 300 )
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
  await page.keyboard.press( 'End' )
  await page.keyboard.press( 'Backspace' )
  await page.keyboard.press( 'Backspace' )
  await page.keyboard.type( overpassCode )

  await page.waitFor( 100 )
  //await page.waitForSelector( '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1)' , { visible : true } );






  // Нажать на кнопку загрузки
  await page.click( runButtonSelector )



  // Дождаться, когда окно просмотра обновится
  await page.waitForSelector( mapViewSelector, { visible : true } )
    //await page.waitFor(1000);








  // Сделать кадрированный скриншот

  const screenshot = await page.screenshot()

  // const options = {
  //   fullPage: false,
  //   clip: {x: 300, y: 200, width: 500, height: 400}
  // }

  //const clip = {x: 300, y: 200, width: 500, height: 400};

  //const file = await page.screenshot({ type,  quality, fullPage });
  //const file = await page.screenshot({ type,  quality, fullPage, clip: clip });


  await browser.close()
  return screenshot
}



module.exports.makeTile = makeTile
