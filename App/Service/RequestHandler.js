async function makeRequest( param, browserPromise ) {

  const puppeteerScript = require( param.patchToModule )
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'

  const startTime = new Date().getTime()
  console.log(startTime / 1000, ' - R app get', param.z, param.x, param.y)

  // Чтобы не перегружать Overpass не будем делать запросы для слишком больших территорий.
  // Просто покажем пустую карту для этих масштабов.
  if ( Number( param.z ) < param.minZ ) {
    const defaultUrl = `http://tile.openstreetmap.org/${param.z}/${param.x}/${param.y}.png`
    return {status: "Redirect", value: defaultUrl}

  } else if ( Number( param.z ) > param.maxZ )  {
    return {status: "Error", value: 'This zoom level not exist'}
  }

  // Если одновнеменно послать сразу много запросов, то могут забанить.
  // Сделаем, чтобы они стартовали немного в разное время.
  const delayTime = randomInt(0, 1000)

  // Делать все новые и новые попытки, пока тайл не загрузится
  const maxTryCount = 1 // Нет, не делать
  // const maxTryCount = 2


  var screenshot
  var isSucces = false
  var counter = 0
  var errorMessage

  while (!isSucces && counter < maxTryCount) {
    counter += 1

    try {
      //console.log( new Date().getTime() / 1000, ' - R try',  param.z, param.x, param.y)
      screenshot = await puppeteerScript.makeTile( Number( param.x ), Number( param.y ), Number( param.z ), param.scriptName, delayTime, userAgent, browserPromise)
      isSucces = true

    } catch ( error ) {
      console.log( new Date().getTime() / 1000, ' -- Error',  param.z, param.x, param.y)
      console.log( error )
      errorMessage = error.message
    }
  }


  // Отправить пользователю результат
  const endTime = new Date().getTime() - startTime

  if (isSucces) {
      console.log(new Date().getTime() / 1000, endTime, ' ---- R app res', param.z, param.x, param.y)
      return {status: "Screenshot", value: screenshot}
  } else {
      console.log(new Date().getTime() / 1000, endTime, ' ---- FAIL', param.z, param.x, param.y)
      return {status: "Error", value: errorMessage}
      //return {status: "Error", value: 'Fetch tile count limit'}
  }
}


function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low)
}

module.exports.makeRequest = makeRequest
