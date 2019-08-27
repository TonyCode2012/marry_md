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

exports.main = async (event) => {
  let candidates = [];
  let openid = event.openid
  let userNexus = await getUserNexus(openid)
  let chain = []
  chain.push(openid)
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
        tmpChain.push(friendNexus._openid + ":" + i.relationship)

        if (friendNexus.gendor != gendor && friendNexus.single == true) {

          candidates.push(tmpChain.concat([]))
        }
        await getNetworkCandidates(friendNexus, level + 1, gendor, starter, tmpChain, userNexus._openid);
      }
    }
  }

}
