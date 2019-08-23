// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = wx.cloud.database()
const nexus = db.collection('nexus')
const maxResume = 10
const {
  ENV,
  OPENID,
  APPID
} = cloud.getWXContext()
// 云函数入口函数

function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0),
    i = arr.length,
    min = i - count,
    temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

var getAllCompany = function(userNexus) {
  if (userNexus.company == "") {
    return Promise.resolve(null);
  } else {
    return nexus.where({
        company: _neq(""),
        gendor: _neq(userNexus.gendor)
      })
      .get()
      .then(res => {
        if (res.data.length < 10) {
          return res.data
        } else {
          return getRandomArrayElements(res.data, maxResume)
        }
      })
  }
}

var getUserNexus = function(openId) {
  return nexus.where({
      _openid: OPENID
    })
    .get()
    .then(res => {
      return res.data[0];
    })
}

exports.main = async(event, context) => {

  let employees = await getUserNexus(OPENID).then(res => {
    return getAllCompany(res).then(res => {
      return res
    })
  })

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    employees: employees
  }
}