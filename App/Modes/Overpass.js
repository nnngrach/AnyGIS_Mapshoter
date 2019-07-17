const puppeteer = require( 'puppeteer' )
const geoTools = require( '../Service/GeoTools' )


async function makeTile( x, y, z, scriptName, delayTime, userAgent, browserPromise ) {

  // Селекторы
  const runButtonSelector = '#navs > div > div.buttons > div:nth-child(1) > a:nth-child(1)'
  const codeEditorSelector = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea'

  // Рассчитать координаты краев и центра области для загрузки (тайла)
  const coordinates = geoTools.getAllCoordinates( x, y, z )
  const bBox = `[bbox:${coordinates.bBox.latMin}, ${coordinates.bBox.lonMin}, ${coordinates.bBox.latMax}, ${coordinates.bBox.lonMax}];`
  const centerCoordinates = `${coordinates.center.lat};${coordinates.center.lon};${z}`

  // Запустить и настроить страницк браузера
  const browser = await browserPromise
  const page = await browser.newPage()
  await page.setViewport( { width: 850, height: 450 } )
  await page.setUserAgent(userAgent)


  try {
    // Чтобы не забанили, запросы должны приходилить немного вразнобой
    await page.waitFor( delayTime )

    // Призумить к нужному месту
    // (так быстрее, чем вбивать текст в окно редактора кода)
    await page.goto( `http://overpass-turbo.eu/?C=${centerCoordinates}`, { waitUntil: 'networkidle2', timeout: 10000} )

    // Загрузить требуемую веб страницу
    const pageUrl = 'http://overpass-turbo.eu/' + scriptName
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

    // Сделать кадрированный скриншот
    const cropOptions = {
      fullPage: false,
      clip: {x: 489, y: 123, width: 256, height: 256}
    }

    // const screenshot = await page.screenshot()
    const screenshot = await page.screenshot( cropOptions )

    // Завершение работы
    await page.close()
    return screenshot


  } catch ( error ) {
    await page.close()
    throw new Error( error.message )
  }
}


module.exports.makeTile = makeTile
