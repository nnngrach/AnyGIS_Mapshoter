const { parentPort, workerData } = require("worker_threads");
const puppeteer = require( 'puppeteer' )
const requestHandler = require( './RequestHandler' )

var browser = "empty"

async function prepareEnviroment( ) {
  if (browser === "empty") {
    const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
    browser = await puppeteer.launch(herokuDeploymentParams)
  }
}

async function doMyAsyncCode(params) {
  await prepareEnviroment()
  const result = await requestHandler.makeRequest(params, browser)
  return result
}


// Этот метод забускается при получении новой задачи
// Код будет выполняться ассинхронно, не блокируя основной поток
parentPort.on("message", (param) => {
  doMyAsyncCode(param)
  .then((result) => { parentPort.postMessage(result) })
})
