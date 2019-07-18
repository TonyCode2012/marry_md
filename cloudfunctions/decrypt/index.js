// 云函数入口文件
const cloud = require('wx-server-sdk')
const request = require("request")
const WXBizDataCrypt = require('./WXBizDataCrypt')


cloud.init()

const requestSync = async(url) =>
  new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })

exports.main = async(event, context) => {

  console.log("event:", JSON.stringify(event))

  const js_code = event.code
  const appid = event.userInfo.appId
  const openId = event.userInfo.openId
  const encryptedData = event.encryptedData
  const iv = event.iv

  const secret = '41a74c95796ea2f25c359370ccac4c7c'
  const url = {
    url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + js_code + '&grant_type=authorization_code'
  }
  const req = await requestSync(url)
  const session = JSON.parse(req)
  console.log("session:", session)
  const sessionKey = session.session_key
  const decipher = new WXBizDataCrypt(appid, sessionKey)
  const data = decipher.decryptData(encryptedData, iv)

  return { ...data,
    openId
  }

}