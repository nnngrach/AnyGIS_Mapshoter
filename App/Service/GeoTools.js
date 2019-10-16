
function getAllCoordinates( x, y, z ) {
  const topLeft = getCoordinates( x, y, z )
  const bottomRight = getCoordinates( x+1, y+1, z )
  const center = getCenter( topLeft.lat, bottomRight.lat, topLeft.lon, bottomRight.lon )
  const bBox = { latMin: bottomRight.lat, lonMin:  topLeft.lon, latMax:  topLeft.lat, lonMax:  bottomRight.lon }
  return { bBox: bBox, center: center }
}

function getAllBigTileCoordinates( x, y, z ) {
  const topLeft = getCoordinates( x, y, z )
  const bottomRight = getCoordinates( x+4, y+4, z )
  const center = getCenter( topLeft.lat, bottomRight.lat, topLeft.lon, bottomRight.lon )
  const bBox = { latMin: bottomRight.lat, lonMin:  topLeft.lon, latMax:  topLeft.lat, lonMax:  bottomRight.lon }
  return { bBox: bBox, center: center }
}


function getCoordinates( x, y, z ) {
  const n = Math.pow( 2, z )
  const lon = x / n * 360.0 - 180.0
  const lat = 180.0 * ( Math.atan( Math.sinh( Math.PI * ( 1 - 2 * y / n) ) ) ) / Math.PI
  return { lat: lat, lon: lon }
}


function getCenter( left, rigth, top, bottom ) {
  let lat = ( left + rigth ) / 2
  let lon = ( top + bottom ) / 2
  return { lat: lat, lon: lon }
}


module.exports.getAllCoordinates = getAllCoordinates
module.exports.getAllBigTileCoordinates = getAllBigTileCoordinates
