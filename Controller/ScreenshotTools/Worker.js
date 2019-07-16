const { parentPort, workerData } = require("worker_threads");

console.log("starting")

// Тут, асинхронно, не блокируя главный поток,
// можно выполнять тяжёлые вычисления.

const puppeteer = require( 'puppeteer' )
const requestHandler = require( './RequestHandlerTread' )

var browser = "empty"
var page = "empty"


async function prepareEnviroment( ) {
  if (browser === "empty") {
    const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
    browser = await puppeteer.launch(herokuDeploymentParams)
    //page = await browser.newPage()
  }
}


async function doAsyncCode(params) {
  await prepareEnviroment()

  const result = await requestHandler.makeRequest(params, browser)

  return result
  // await page.goto( "https://www.google.ru/", { waitUntil: 'networkidle0', timeout: 30000} )
  // const screen = await page.screenshot()
  // return screen
}



parentPort.on("message", (param) => {
  console.log("message")

  doAsyncCode(param)
  .then((result) => { parentPort.postMessage(result) })
});
