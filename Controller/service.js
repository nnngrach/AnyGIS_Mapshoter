const { workerData, parentPort } = require('worker_threads')

// Тут, асинхронно, не блокируя главный поток,
// можно выполнять тяжёлые вычисления.

const puppeteer = require( 'puppeteer' )

async function doAsyncCode( ) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto( "https://www.google.ru/", { waitUntil: 'networkidle0', timeout: 30000} )
  const screen = await page.screenshot()
  await browser.close()
  return screen
}


doAsyncCode()
.then((imageBuffer) => { parentPort.postMessage(imageBuffer) })







// puppeteer.launch()
// .then((browser) => { return browser.newPage() })
// .then((page) => { page.goto( "https://www.google.ru/", { waitUntil: 'networkidle0', timeout: 30000} ); return page })
// .then((page) => { return page.screenshot() })
// //.then((screenshot) => { return Buffer.from( screenshot, 'base64' ) })
// .then((imageBuffer) => { parentPort.postMessage(imageBuffer) })



// parentPort.postMessage({ hello: workerData })
//parentPort.postMessage({ hello: buf })
// parentPort.postMessage({ hello: doSomethingAsync })
