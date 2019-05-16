const express = require('express')
const path = require('path')
const puppeteer = require('puppeteer');
const PORT = process.env.PORT || 5000

/*
express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/times', (req, res) => res.send(showTimes()))
  .get('/times/:x', (req, res) => res.send(showTimes2(req, res)))
  .get('/getPic', (req, res) => res.send(getPic(req, res)))
  .get('/getPic2', (req, res) => res.send(getPic2(req, res)))
  .get('/getPic3', (req, res) => res.send(generateScreenshot()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/

const app = express()

app.get('/', async (req, res, next) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end('Hello world');
});


app.get('/api', async (req, res, next) => {
  let screenshot = await generateScreenshot('https://google.com');
  let img = Buffer.from(screenshot, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.end(img);
});


app.listen(PORT, () => {
  console.log('Listening on port ', PORT);
});




const generateScreenshot = async (url) => {
  try {
    //const url = 'https://google.com'

    //const browser = await puppeteer.launch()
    const browser = await puppeteer.launch({
      'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox'
      ]
    });
    const page = await browser.newPage()
    await page.goto(url)
    await page.setViewport({width: 1920, height: 1080})
    const image = await page.screenshot({encoding: 'base64'})
    browser.close()
    return image
  } catch (err) {
    console.error(err.response)
  }
}


function showTimes() {
  return "Show Times";
}

showTimes2 = (req, res) => {
  return req.params.x;
}




async function getPic(req, res) {
  //const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
});
  const page = await browser.newPage();
  await page.goto('https://google.com');
  //const img = await page.screenshot({path: 'google.png'});
  const img = await page.screenshot();


  var res2 = res
  await browser.close();
  res2.statusCode = 200;
  res2.setHeader('Content-Type', `image/png`);
  return res2.end(img)
}


async function getPic2(req, res) {
  //const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  await page.goto('https://google.com');
  //const img = await page.screenshot({path: 'google.png'});
  const img = await page.screenshot();

  // var res2 = res
  // await browser.close();
  // res2.statusCode = 200;
  // res2.setHeader('Content-Type', `image/png`);
  //return img
  return res.end(img)
}
