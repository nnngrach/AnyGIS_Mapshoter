
// Первый уровень зума, где есть 4х4 тайлов
function isZoomCorrect(zoomLevel) {
  return parseInt(zoomLevel) >= 2
}

// Номер супер-тайла
function getBigTileNumbers(x, y) {
  const bigX = Math.floor( x / 4 )
  const bigY = Math.floor( y / 4 )
  return {x: bigX, y: bigY}
}

// Относительный номер мини-тайла на супер-тайле
function getRelativeTileNublers(x, y) {
  const relativeX = x % 4
  const relativeY = y % 4
  return {x: relativeX, y: relativeY}
}

// Номер мини-тайла у левого-вергнего угла супер-тайла
function getTopLeftTileNumbers(x, y) {
  const cleanX = x - (x%4)
  const cleanY = y - (y%4)
  //console.log(cleanX, cleanY)
  return {x: cleanX, y: cleanY}
}

// Имя супер-тайла для сохранения в очередь
function getBigTileQueueName(x, y, z, mode, scriptName) {
  const bigTileNumbers = getBigTileNumbers(x, y)

  return String(z) + "/" + String(bigTileNumbers.x) + "/"
  + String(bigTileNumbers.y) + "/" + mode + "/" + scriptName
}

// Относительное имя мини-тайла для сохранения в кэш
function getBigTileCacheName(prefix, x, y) {
  const relativeNumbers = getRelativeTileNublers(x, y)

  return prefix + "/" + String(relativeNumbers.x) + "/"
  + String(relativeNumbers.y)
}

module.exports.isZoomCorrect = isZoomCorrect
module.exports.getBigTileNumbers = getBigTileNumbers
module.exports.getBigTileQueueName = getBigTileQueueName
module.exports.getBigTileCacheName = getBigTileCacheName
module.exports.getTopLeftTileNumbers = getTopLeftTileNumbers
