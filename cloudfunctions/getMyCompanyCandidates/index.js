// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-t2od1'
})
const db = cloud.database()
const _ = db.command
const MaxResume = 10


/* payload =
{
  "openid": "testuser0",
  "fields": {
    "basic_info": true,
    "photos": true
  }
}
*/
exports.main = async(event) => {

  let openid = event.openid
  let fields = event.fields

  // get users' nexus
  let res = await db.collection("nexus").field({
    _openid: true,
    company: true
  }).where({
    _openid: openid
  }).get()
  console.log('get nexus', res)
  if (res.data.length === 0) {
    return [];
  }
  let userNexus = res.data[0]
  if (userNexus.company == "") {
    return [];
  }

  // get employees 
  res = await db.collection("nexus").field({
    _openid: true
  }).where({
    company: _.eq(userNexus.company),
    _openid: _.neq(userNexus._openid)
  }).get()
  console.log('get employees', res)
  if (res.data.length === 0) {
    return []
  }
  let openids = res.data.map(n => n._openid)
  openids = [...new Set(openids)]
  openids = getRandomArrayElements(openids, MaxResume)

  // ger userInfo
  res = await db.collection('users').field(fields).where({
    _openid: _.in(openids)
  }).get()
  console.log('get userInfo', res)

  return res.data
}

function getRandomArrayElements(arr, count) {
  return arr.sort(function () { return 0.5 - Math.random() }).slice(0, count)
}