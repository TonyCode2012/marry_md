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

async function getUserNexus(openid) {
  let res = await db.collection("nexus").where({
    _openid: openid
  }).get()
  return res.data[0]

}


async function getUserInfo(openid) {
  let res = await db.collection("users").where({
    _openid: openid
  }).get()
  let info
  if (res.data.length > 0) {
    let data = res.data[0]
    info = {
      basic_info: data.basic_info,
      love_info: data.love_info,
      photos: data.photos,
      wechat_info: data.wechat_info
    }
  }
  return info

}


exports.main = async (event) => {
  let candidates = [];
  let openid = event.openid
  let userNexus = await getUserNexus(openid)
  let chain = []
  //chain.push(openid)
  let employees = await getNetworkCandidates(userNexus, 0, userNexus.gendor, openid, chain, "")

  return candidates

  async function getNetworkCandidates(userNexus, level, gendor, starter, chain, last) {
    if (level >= MaxLevel) {
      return Promise.resolve(null)
    } else {
      let promises = [];
      var friends = userNexus.friends

      for (var i of friends) {
        if (i._openid == starter || i._openid == userNexus._openid || i._openid == last) {
          continue
        }
        let friendNexus = await getUserNexus(i._openid)
        let tmpChain = chain
        let chainObj = {
          openid: friendNexus._openid,
          relationship: i.relationship,
          company: friendNexus.company
        }
        //tmpChain.push(friendNexus._openid + ":" + i.relationship + ":" + friendNexus.company)
        tmpChain.push(chainObj)
        if (friendNexus.gendor != gendor && friendNexus.completed == true) {
          let userInfo = await getUserInfo(friendNexus._openid)
          let resChain = JSON.stringify(tmpChain)
          resChain = JSON.parse(resChain)
          resChain.push(userInfo)
          candidates.push(resChain.concat([]))
        }
        await getNetworkCandidates(friendNexus, level + 1, gendor, starter, tmpChain, userNexus._openid);
      }
    }
  }

}
