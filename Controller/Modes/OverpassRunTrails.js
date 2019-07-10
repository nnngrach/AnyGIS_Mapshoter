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

  const emptyPageScript = 's/KBn'
  scriptName = emptyPageScript

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

    await page.waitFor( delayTime )

    // Призумить к нужному месту
    await page.goto( `http://overpass-turbo.eu/?C=${centerCoordinates}`, { waitUntil: 'networkidle2', timeout: 10000} )

    // Загрузить требуемую веб страницу
    //await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 10000} )
    await page.goto( pageUrl, { waitUntil: 'networkidle0', timeout: 50000} )




    // async function copyPageUrl() {
    //   try {
    //     await navigator.clipboard.writeText('Hello, World!');
    //     console.log('Page URL copied to clipboard');
    //   } catch (err) {
    //     console.error('Failed to copy: ', err);
    //   }
    // }
    //
    // await page.focus( codeEditorSelector )
    //
    // async function getClipboardContents() {
    //   try {
    //     const text = await navigator.clipboard.readText();
    //     console.log('Pasted content: ', text);
    //   } catch (err) {
    //     console.error('Failed to read clipboard contents: ', err);
    //   }
    // }


//await document.querySelector(codeEditorSelector).value = 'Hello';

// const textContent = await page.evaluate(() => {
//   console.log('-!')
//   const sel = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea'
//   console.log('-!')
//   console.log(document.querySelector(sel))
//   console.log('!-')
//   document.querySelector(sel).textContent = '123'
//   return document.querySelector(sel);
// });



const variableInNODEJS = '#editor > div.CodeMirror.CodeMirror-wrap > div.CodeMirror-scroll.cm-s-default > div > div > div.CodeMirror-lines > div > div:nth-child(5) > pre:nth-child(1)';

const html = await page.evaluate(variableInBROWSER => {
  //document.querySelector(variableInBROWSER).innerHTML = 'Hello world'
  document.querySelector(variableInBROWSER).innerHTML = '[bbox:{{bbox}}];(node;);out;>;out skel qt;'
  return document.querySelector(variableInBROWSER).innerHTML;
}, variableInNODEJS);
console.log(html)

await page.focus( codeEditorSelector )
await page.keyboard.type( ' ' )
await page.waitFor( 1000 )


//============================================================

    /*
    // Вставить нужные строки в окно редактора кода и дождаемся, когда IDE распознает их синтаксис
    await page.focus( codeEditorSelector )
    await page.keyboard.type( bBox + ' //' )
    await page.waitFor( 100 )
    */


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




    // Сделать кадрированный скриншот
    const options = {
      fullPage: false,
      clip: {x: 489, y: 123, width: 256, height: 256}
    }

    const screenshot = await page.screenshot()
    //const screenshot = await page.screenshot( options )
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
