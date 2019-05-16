const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');


async function getScreenshot(url, cropSettings) {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });

    // const options = {
    //   fullPage: false,
    //   clip: {x: 300, y: 200, width: 500, height: 400}
    // }

    //const clip = {x: 300, y: 200, width: 500, height: 400};

    const page = await browser.newPage();
    await page.goto(url);
    const file = await page.screenshot();
    //const file = await page.screenshot({ type,  quality, fullPage });
    //const file = await page.screenshot({ type,  quality, fullPage, clip: clip });
    await browser.close();
    return file;
}





async function getScreenshotOld(url, type, quality, fullPage) {
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });

    // const options = {
    //   fullPage: false,
    //   clip: {x: 300, y: 200, width: 500, height: 400}
    // }

    const clip = {x: 300, y: 200, width: 500, height: 400};

    const page = await browser.newPage();
    await page.goto(url);
    const file = await page.screenshot({ type,  quality, fullPage });
    //const file = await page.screenshot({ type,  quality, fullPage, clip: clip });
    await browser.close();
    return file;
}


// async function getScreenshot(url, type, quality, fullPage) {
//     const browser = await puppeteer.launch({
//         args: chrome.args,
//         executablePath: await chrome.executablePath,
//         headless: chrome.headless,
//     });
//
//     const page = await browser.newPage();
//     await page.goto(url);
//     const file = await page.screenshot({ type,  quality, fullPage });
//     await browser.close();
//     return file;
// }

module.exports = { getScreenshot };
