async function makeRequest( param, browserPromise ) {

  const puppeteerScript = require( param.patchToModule )

  const startTime = new Date().getTime()
  console.log(startTime / 1000, ' - R app get', param.z, param.x, param.y)

  // Чтобы не перегружать Overpass не будем делать запросы для слишком больших территорий.
  // Просто покажем пустую карту для этих масштабов.
  if ( Number( param.z ) < param.minZ ) {
    return {status: "Redirect", value: param.defaultUrl}

  } else if ( Number( param.z ) > param.maxZ )  {
    return {status: "Error", value: 'This zoom level not exist'}
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
      console.log( new Date().getTime() / 1000, ' - R try',  param.z, param.x, param.y)
      screenshot = await puppeteerScript.makeTile( Number( param.x ), Number( param.y ), Number( param.z ), param.scriptName, delayTime, browserPromise)
      //screenshot = "screenshot ok"
      isSucces = true

    } catch (errorMessage) {
      console.log( new Date().getTime() / 1000, ' -- Error',  param.z, param.x, param.y)
      console.log( errorMessage)
    }
  }


  // Отправить пользователю результат
  const endTime = new Date().getTime() - startTime

  if (!isSucces) {
      console.log(new Date().getTime() / 1000, endTime, ' ---- FAIL', param.z, param.x, param.y)
      return {status: "Error", value: 'Fetch tile count limit'}
  }
  console.log(new Date().getTime() / 1000, endTime, ' ---- R app res', param.z, param.x, param.y)
  return {status: "Ok", value: screenshot}
}




function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low)
}


module.exports.makeRequest = makeRequest
