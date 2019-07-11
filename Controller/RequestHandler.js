async function makeRequest(x, y, z, minZ, maxZ, scriptName, patchToModule, defaultUrl, res ) {

  //const worker = require( './Modes/OverpassBase' )
  const worker = require( patchToModule )

  const startTime = new Date().getTime()
  console.log(startTime / 1000, ' - R app get', z, x, y)

  // Чтобы не перегружать Overpass не будем делать запросы для слишком больших территорий.
  // Просто покажем пустую карту для этих масштабов.
  if ( Number( z ) < minZ ) {
    return res.redirect(defaultUrl)

  } else if ( Number( z ) > maxZ )  {

    const message = 'This zoom level not exist'
    res.writeHead( 404, {
      'Content-Type': 'text/plain',
      'Content-Length': message.length
    })
    return res.end( message )
  }

  const delayTime = randomInt(0, 1000)

  // Делать все новые и новые попытки, пока тайл не загрузится
  const maxTryCount = 2

  var screenshot
  var isSucces = false
  var counter = 0

  while (!isSucces && counter < maxTryCount) {
    counter += 1

    try {
      console.log( new Date().getTime() / 1000, ' - R try',  z, x, y)
      screenshot = await worker.makeTile( Number( x ), Number( y ), Number( z ), scriptName, delayTime )
      isSucces = true
    } catch (errorMessage) {
      console.log( new Date().getTime() / 1000, ' -- Error',  z, x, y)
      console.log( errorMessage)
    }
  }


  // Отправить пользователю результат
  const endTime = new Date().getTime() - startTime
  if (isSucces) {
      console.log(new Date().getTime() / 1000, endTime, ' ---- R app res', z, x, y)
      res.writeHead( 200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshot.length
      })
  } else {
      console.log(new Date().getTime() / 1000, endTime, ' ---- FAIL', z, x, y)
      screenshot = 'Fetch tile count limit'
      res.writeHead( 501, {
        'Content-Type': 'text/plain',
        'Content-Length': screenshot.length
      })
  }

  return res.end( screenshot )
}




function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low)
}


module.exports.makeRequest = makeRequest
