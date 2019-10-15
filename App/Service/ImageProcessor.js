const sharp = require('sharp')


module.exports.crop = async function crop(imageBuffer, xOffset, yOffset) {

  return await sharp(Buffer.from( imageBuffer.value, 'base64' ))
		.png()
		.extract({ left: xOffset, top: yOffset, width: 256, height: 256 })
		.toBuffer()
}
