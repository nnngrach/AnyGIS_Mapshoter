// НЕ РАБОТАЕТ !
// То ли глючит Puppeteer, то ли сам сайт Nakarte.me.
// Часть метотодов никак не могут загрузить страницу - грузят пока не настает таймаут.
// У части это удается. Но уже следующее действие - снимок скриншота - снимает от 30 до 150 сек.
// И при этом он снимает только фоновый слой с тайлами. А слой с маркерами Westra или Geokashing - на снимок не попадает.


const puppeteer = require( 'puppeteer' )
const geoTools = require( '../../ModelOfLogic/GeoTools' )


async function makeTile( x, y, z, scriptName, delayTime ) {

  // Константы

  // Рассчитать координаты краев и центра области для загрузки (тайла)
  // const coordinates = geoTools.getAllCoordinates( x, y, z )
  // const centerCoordinates = `${z}/${coordinates.center.lat}/${coordinates.center.lon}&l=`

  // Запустить и настроить браузер
  //const pageUrl = 'https://nakarte.me/#m=' + centerCoordinates + scriptName

  console.log( new Date().getTime() / 1000, ' browser starting ...')

  //const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
  //const browser = await puppeteer.launch(herokuDeploymentParams)
  //const browser = await puppeteer.launch()

 //  const browser = await puppeteer.launch({
 //   headless: false,
 //   args: ['--headless'],
 // })

 // const browser = await puppeteer.launch({
 //    args: ['--enable-features=NetworkService'],
 //    ignoreHTTPSErrors: true
 //  })

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: ['--enable-features=NetworkService']
  });




  const page = await browser.newPage()
  //await page.setViewport( { width: 850, height: 450 } )
  //await page.setViewport({width: 1000, height: 500});
  //await page.setViewport( { width: 400, height: 200 } )
  //await page.setViewport( { width: 1000, height: 2000 } )

  console.log( new Date().getTime() / 1000, ' browser done')



  // await page.setRequestInterception(true)
  // page.on('request', interceptedRequest => {
  //   interceptedRequest.continue()
  // })

  // await page.setRequestInterception(true)
  // page.on("request", (request) => {
  //   if (request.resourceType === "Image")
  //     request.abort();
  //   else
  //     request.continue();
  // });
  //
  // await page.waitFor( 2000 )




  console.log( new Date().getTime() / 1000, ' goto starting...')

  //await page.goto( 'https://nakarte.me' )
  //await page.goto( 'https://nakarte.me/#m=17/55.76114/37.64742&l=Ocm' )
  // await page.goto( 'https://nakarte.me/#m=13/43.18245/42.49750&l=Otm/Wp' )
  //await page.goto('https://nakarte.me/#m=13/43.18245/42.49750&l=Otm/Wp', {"waitUntil" : "networkidle0", "timeout": 0});
  // await page.goto('https://nakarte.me/#m=13/43.18245/42.49750&l=Otm/Wp', {"waitUntil" : "networkidle2", "timeout": 0});
  //await page.goto('https://nakarte.me/#m=17/55.76114/37.64742&l=Ocm', { waitUntil: "domcontentloaded" });
  //await page.goto('https://nakarte.me/#m=13/43.18245/42.49750&l=Otm/Wp', { waitUntil: "domcontentloaded" });
  //await page.goto('https://leafletjs.com/', { waitUntil: "domcontentloaded" });
  //await page.goto('https://leafletjs.com/');


  await page.goto('https://nakarte.me/#m=13/43.18245/42.49750&l=Otm/Wp', { timeout: 15000, waitUntil: "load" })
  //await page.goto('https://nakarte.me/#m=13/43.18245/42.49750&l=Otm/Wp', {"waitUntil" : "networkidle2", "timeout": 0});
  console.log( new Date().getTime() / 1000, ' goto done')




  console.log( new Date().getTime() / 1000, ' content waiting...')
  // Иммитация ожидания полной загрузки страницы
  // Если ее активировать, то снять скриншот уже не удастся
  //await page.waitFor( 5000 )
  console.log( new Date().getTime() / 1000, ' content loaded')


  // await page.content()
  // const selector = '#map'
  // await page.waitForSelector( selector, { visible : true, timeout: 1000  } )




  console.log( new Date().getTime() / 1000, ' screenshot starting...')

  const screenshot = await page.screenshot()
  //const screenshot = await page.screenshot().catch(error => console.log("!!! My screenshot error: ", error));
  // const screenshot = await page.screenshot( options )

  console.log( new Date().getTime() / 1000, ' screenshot done')


  console.log( new Date().getTime() / 1000, ' buffer starting...')
  let imageBufferData = Buffer.from( screenshot, 'base64' )
  console.log( new Date().getTime() / 1000, ' buffer done')



  // Завершение работы
  await browser.close()
  console.log( new Date().getTime() / 1000, ' browser close')
  return imageBufferData
}



module.exports.makeTile = makeTile
