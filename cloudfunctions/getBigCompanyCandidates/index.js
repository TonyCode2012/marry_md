// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
   env: 'test-t2od1'
})
const db = cloud.database()
const maxResume = 10
const _ = db.command


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
      return getRandomArrayElements(allEmployeeInfo.data, maxResume)
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
