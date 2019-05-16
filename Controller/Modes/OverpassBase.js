const puppeteer = require('puppeteer');


async function makeTile(url, x, y, z) {

    const browser = await puppeteer.launch({
      'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox'
      ]
    });


    const currentUrl = 'http://overpass-turbo.eu/s/IXl';

    // Загрузить страницу
    const page = await browser.newPage();
    //await page.goto(currentUrl);
    await page.goto(currentUrl, {waitUntil: 'networkidle2'});

    // Получить координаты краев и центра тайла


    // Сгенерировать запрос для Оверпасса
    const overpassCode = '(node(50.746,7.154,50.748,7.157););out;>;out skel qt;';


    // Вставить текст
    const searchSelector = '#search';
    const codeEditorSelector = '#editor > div.CodeMirror.CodeMirror-wrap > div:nth-child(1) > textarea';
    await page.type(codeEditorSelector, overpassCode+' //');
    // await page.focus(searchSelector);
    // await page.keyboard.type(text);






    // Нажать на кнопку загрузки

    await page.evaluate(()=>document
        .querySelector('#navs > div > div.buttons > div:nth-child(1) > a:nth-child(1)')
        .click()
      );

    // Дождаться результатов и загрузить cookie
      await page.waitForNavigation();


    // Призумить

    //await page.waitFor(100);



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
