var crypto = require('crypto')

function WXBizDataCrypt(appid, sessionKey) {
  this.appid = appid
  this.sessionKey = sessionKey
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  // base64 decode
  var sessionKey = new Buffer(this.sessionKey, 'base64')
  encryptedData = new Buffer(encryptedData, 'base64')
  iv = new Buffer(iv, 'base64')

  try {
    // 解密
    var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true)
    var decoded = decipher.update(encryptedData, 'binary', 'utf8')
    decoded += decipher.final('utf8')

    decoded = JSON.parse(decoded)

  } catch (err) {
    console.log('try err', err)
    throw new Error('Illegal Buffer1')
  }

  if (decoded.watermark.appid !== this.appid) {
    throw new Error('appid unmatch')
  }

  return decoded
}

module.exports = WXBizDataCrypt