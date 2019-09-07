// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
   env: 'test-t2od1'
})
const db = cloud.database()
const MaxResume = 10
const _ = db.command

/*
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



async function getAllEmployees(userNexus) {
  if (userNexus.company == "") {
    return Promise.resolve(null)
  } else {
    console.log(userNexus)
    let allEmployeeInfo = await db.collection("nexus").where({
      company: _.neq(""),
      gendor: _.neq(userNexus.gendor)
    }).get()

    if (allEmployeeInfo.data.length < 10) {
      return allEmployeeInfo.data
    } else {
      return getRandomArrayElements(allEmployeeInfo.data, MaxResume)
    }
  }
}

async function getUserNexus(openid) {
  console.log("HEHEHE getUserNexus!!!")

  let res = await db.collection("nexus").where({
    _openid: openid
  }).get()

  return res.data[0]

  //return userInfo.date[0]
}

exports.main = async(event) => {
  console.log("HAHAHA started!!!")
  let openid = event.openid
  let userNexus = await getUserNexus(openid)
  let employees = await getAllEmployees(userNexus)
  return employees

}
*/


exports.main = async (event) => {

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
    company: _.neq(userNexus.company),
    _openid: _.neq(userNexus._openid)
  }).get()
  console.log('get employees', res)
  if (res.data.length === 0) {
    return []
  }
  let openids = res.data.map(n => n._openid)
  openids = [...new Set(openids)]

  // ger userInfo
  res = await db.collection('users').field(fields).where({
    _openid: _.in(openids)
  }).limit(MaxResume).get()
  console.log('get userInfo', res)

  return res.data
}