const { parse } = require('url');
const { getInt, getUrlFromPath, isValidUrl } = require('../ModelOfLogic/UrlValidator');

module.exports = async function (req, res) {
    try {
        const { pathname = '/', query = {} } = parse(req.url, true);
        const { x, y, z } = query;

        // process.stdout.write("patchname: ");

        var url;
        var worker;

        switch (pathname) {
          case '/v1/google':
            url = 'https://www.google.ru/';
            worker = require('./Modes/OverpassBase');
            break;
          case '/v1/yandex':
            url = 'https://yandex.ru/';
            worker = require('./Modes/OverpassBase');
            break;
          default:
            url = 'https://www.yahoo.com/';
            worker = require('./Modes/OverpassBase');
            break;
        }

        const resultTile = await worker.makeTile(url, 0, 0, 0);

        res.statusCode = 200;
        res.setHeader('Content-Type', `image/png`);
        res.end(resultTile);

    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Server Error</h1><p>Sorry, there was a problem</p>');
        console.error(e.message);
    }

};
