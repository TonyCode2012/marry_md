// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-t2od1'
})
const db = cloud.database()
const MaxResume = 10
const MaxLevel = 3
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

let candidates = [];
async function getNetworkCandidates(userNexus, level, gendor, starter, chain) {
  if (level >= MaxLevel) {
    return Promise.resolve(null)
  } else {
    let promises = [];
    var friends = userNexus.friends
    for (var i of friends) {
      if (i._openid == starter || i._openid == userNexus._openid){
        continue
      }
      let friendNexus = await getUserNexus(i._openid)
      if (friendNexus.gendor != gendor && friendNexus.single == true){

        candidates.push(friendNexus)
      }
      await getNetworkCandidates(friendNexus, level + 1, gendor, starter);
       
    }

  }
}

async function getUserNexus(openid) {
  let res = await db.collection("nexus").where({
    _openid: openid
  }).get()
  return res.data[0]

}

exports.main = async (event) => {
  let openid = event.openid
  let userNexus = await getUserNexus(openid)
  let chain = []
  let employees = await getNetworkCandidates(userNexus, 0, userNexus.gendor, openid, chain)

  //console.log('candidates', candidates)
  return candidates

}
