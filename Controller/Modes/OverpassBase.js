const puppeteer = require('puppeteer');
const geoTools = require('../../ModelOfLogic/GeoTools');


async function makeTile(url, x, y, z) {

    const browser = await puppeteer.launch({
      'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox'
      ]
    });


    //const currentUrl = 'http://overpass-turbo.eu/s/IXl';
    const currentUrl = 'http://overpass-turbo.eu/s/J4Q';

    // Загрузить страницу
    const page = await browser.newPage();
    //await page.goto(currentUrl);
    await page.goto(currentUrl, {waitUntil: 'networkidle2'});



    // Получить координаты краев и центра тайла
    const coordinates = geoTools.getAllCoordinates(x, y, z);
    //console.log(coordinates);



    // Сгенерировать запрос для Оверпасса
    //const overpassCode = '(node(50.746,7.154,50.748,7.157););out;>;out skel qt;';
    var overpassCode = '(node({$0},{$1},{$2},{$3}););out;>;out skel qt;';
    overpassCode = overpassCode.replace('{$0}', coordinates["bBox"]["latMin"]);
    overpassCode = overpassCode.replace('{$1}', coordinates["bBox"]["lonMin"]);
    overpassCode = overpassCode.replace('{$2}', coordinates["bBox"]["latMax"]);
    overpassCode = overpassCode.replace('{$3}', coordinates["bBox"]["lonMax"]);
    //console.log(overpassCode)

    // Вставить текст
    const searchSelector = '#search';
    const codeEditorSelector = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea';

    await page.focus( codeEditorSelector );
    await page.keyboard.press( 'End' );
    await page.keyboard.press( 'Backspace' );
    await page.keyboard.press( 'Backspace' );
    await page.keyboard.type( overpassCode );

    await page.waitFor(100);
    //await page.waitForSelector( '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1)' , { visible : true } );


/*
    // Нажать на кнопку загрузки

    await page.evaluate(()=>document
        .querySelector('#navs > div > div.buttons > div:nth-child(1) > a:nth-child(1)')
        .click()
      );

    // Дождаться, когда окно просмотра обновится
      await page.waitForSelector( '#map > div.leaflet-map-pane > div.leaflet-objects-pane > div.leaflet-overlay-pane > svg', { visible : true } );
      //await page.waitFor(1000);
*/

    // Призумить





    // Сделать кадрированный скриншот

    const screenshot = await page.screenshot();

    // const options = {
    //   fullPage: false,
    //   clip: {x: 300, y: 200, width: 500, height: 400}
    // }

    //const clip = {x: 300, y: 200, width: 500, height: 400};

    //const file = await page.screenshot({ type,  quality, fullPage });
    //const file = await page.screenshot({ type,  quality, fullPage, clip: clip });


    await browser.close();
    return screenshot;
}



module.exports.makeTile = makeTile;
