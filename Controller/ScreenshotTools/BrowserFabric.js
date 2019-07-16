const puppeteer = require('puppeteer');

async function create() {
  const herokuDeploymentParams = {'args' : ['--no-sandbox', '--disable-setuid-sandbox']}
  const browser = await puppeteer.launch(herokuDeploymentParams)
  return browser
}

module.exports.create = create
