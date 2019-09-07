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

async function getUserInfo(openids, fields) {
  let res = await db.collection('users').field(fields).where({
    _openid: _.in(openids)
  }).get()
  return res.data;
}

exports.main = async(event) => {
  let candidates = [];
  let openid = event.openid
  let fields = event.fields

  let userNexus = await getUserNexus(openid)
  let chain = []
  //chain.push(openid)
  await getNetworkCandidates(userNexus, 0, userNexus.gendor, openid, chain, "")

  candidates = candidates.reduce((acc, cur) => acc.concat(cur))
  let openids = candidates.filter(n => !!n.openid).map(n => n.openid)
  openids = [...new Set(openids)]
  let _candidatesUserInfo = await getUserInfo(openids, fields)
  _candidatesUserInfo.forEach(c => {
    c._source = candidates.find(n => n.openid == c._openid)
  })

  return _candidatesUserInfo

  async function getNetworkCandidates(userNexus, level, gendor, starter, chain, last) {
    if (level >= MaxLevel) {
      return
    }
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
        let resChain = JSON.stringify(tmpChain)
        resChain = JSON.parse(resChain)
        candidates.push(resChain.concat([]))
      }
      await getNetworkCandidates(friendNexus, level + 1, gendor, starter, tmpChain, userNexus._openid);
    }

  }

}