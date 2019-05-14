const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/times', (req, res) => res.send(showTimes()))
  .get('/times/:x', (req, res) => res.send(showTimes2(req, res)))
  .get('/pupp', (req, res) => res.send(pupp(req, res)))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


  function showTimes() {
    return "Show Times";
  }

  showTimes2 = (req, res) => {
    return req.params.x;
  }



  pupp = (req, res) => {
    return req.params.x;
  }
