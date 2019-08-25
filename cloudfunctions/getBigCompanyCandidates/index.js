// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = wx.cloud.database()
//const nexus = db.collection('nexus')
const maxResume = 10

/*
const {
  ENV,
  OPENID,
  APPID
} = cloud.getWXContext()
// 云函数入口函数
*/

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



var getAllEmployees = function (userNexus) {
  if (userNexus.company == "") {
    return Promise.resolve(null)
  } else {
    let allEmployeeInfo = await nexus.where({
      company: _neq(""),
      gendor: _neq(userNexus.gendor)
    }).get()

    if (allEmployeeInfo.data.length < 10) {
      console.log("Here we got all employees, numbers:")
      console.log(allEmployeeInfo.data)

      return allEmployeeInfo.data
    } else {
      return getRandomArrayElements(res.data, maxResume)
    }
  }
}
*/
async function getUserNexus(openid) {
  console.log("HEHEHE getUserNexus!!!")

  let userInfo = await db.collection("nexus").where({
    _openid: openid
  }).get()

  return userInfo.date[0]
}

exports.main = async(event) => {
  console.log("HAHAHA started!!!")
  let openid = event.openid
  console.log(openid)
  let userNexus = await getUserNexus(openid)
  console.log(userNexus)
  //let employees = await getAllEmployees(userNexus)
  return userNexus

}
