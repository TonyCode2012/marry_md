// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'test-t2od1'
})
const _ = db.command

var candidates = []
var candidatesIDSet = new Set()
var serachFriedsSet = new Set()

var getRelative = async function(data) {
  const curNexusInfo = data.nexusInfo
  var level = data.level
  serachFriedsSet.add(curNexusInfo._openid)
  for (var friend of curNexusInfo.friends) {
    var path = JSON.parse(JSON.stringify(data.path))
    var relation = JSON.parse(JSON.stringify(data.relation))
    path.push(friend._openid)
    relation.push(friend.relationship)
    // do not include immediate friend
    if(level != 1) {
      // if person info completed and not contains this person yet 
      if(friend.completed && friend.gender != data.orgGender 
      && !candidatesIDSet.has(friend._openid) && !serachFriedsSet.has(friend._openid)) {
        // console.log('add user:'+friend._openid)
        candidates.push({
          _openid: friend._openid,
          path: path,
          relation: relation
        })
        // console.log(candidates)
        candidatesIDSet.add(friend._openid)
      }
    }
    // just search in 4 levels and exclude searched friends
    if(level >= 4 || serachFriedsSet.has(friend._openid)) continue
    var nexusInfo = {}
    await db.collection('zy_nexus').where({
      _openid: friend._openid
    }).get().then(
      function(res) {
        // console.log('get network info:'+JSON.stringify(res.data))
        if (res.data.length != 0) nexusInfo = res.data[0]
        // recurse searching next friend info
        // if(res.data.length == 0) return
        // var nexusInfo = res.data[0]
        // getRelative({
        //   nexusInfo: nexusInfo,
        //   level: level + 1,
        //   orgGender: data.orgGender,
        //   path: path,
        //   relation: relation
        // })
      },
      function(err) {
        console.log(err)
      }
    )
    // recurse searching next friend info
    serachFriedsSet.add(curNexusInfo._openid)
    await getRelative({
      nexusInfo: nexusInfo,
      level: level + 1,
      orgGender: data.orgGender,
      path: path,
      relation: relation
    })
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  try {
    // get all completed people
    var seekers = []
    await db.collection('zy_nexus').where({
      completed: true
    }).get().then(
      function(res) {
        seekers = res.data
      },
      function(err) {
        console.log(err)
      }
    )
    // get candidates according to network
    for(var seeker of seekers) {
      await getRelative({
        nexusInfo: seeker,
        orgGender: seeker.gender,
        level: 1,
        path: [seeker._openid],
        relation: []
      })
      console.log("start:=======================")
      console.log("user "+seeker._openid)
      for(var user of candidates) {
        console.log(user._openid)
      }
      console.log("end: =======================")
      // exclude deletes and recommended
      await db.collection('zy_network').where({
        _openid: seeker._openid
      }).get().then(
        function(res) {
          if(res.data.length == 0) {
            // if not find seeker's network, add one
            db.collection('zy_network').add({
              data: {
                _openid: seeker._openid,
                deletes: [],
                recommended: [],
                nt_colleague: [],
                nt_company: [],
                nt_relative: candidates
              }
            })
          } else {
            // if find, exclude deletes and recommended
            const networkInfo = res.data[0]
            const deletesSet = new Set(networkInfo.deletes)
            const recommendedSet = new Set(networkInfo.recommended)
            for(var i=0;i<candidates.length;) {
              const openid = candidates[i]._openid
              if(deletesSet.has(openid) || recommendedSet.has(openid)) {
                candidates.splice(i,1)
              } else i++
            }
            db.collection('zy_network').where({
              _openid: seeker._openid
            }).update({
              data: {
                nt_relative: candidates
              }
            }).then(
              function(res) {
                console.log('update relative successfully! Info:'+JSON.stringify(res))
              },
              function(err) {
                console.log('update relative failed! Error:'+JSON.stringify(err))
              }
            )
          }
        }
      )
      // clean tmp data
      candidates = []
      candidatesIDSet = new Set()
      serachFriedsSet = new Set()
    }
  } catch(e) {
    console.log(e)
  }
}