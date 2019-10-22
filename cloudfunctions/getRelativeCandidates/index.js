// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'dev-2019-xe6cj'
})
const _ = db.command

// all users
var authedUsers = new Map()
var authedNexus = new Map()
var company2AUser = new Map()
// ========== tmp data for one user search ========== //
// relative
var candidates = {}
var rCandidates = {}
var candidatesIDSet = new Set()
var serachFriedsSet = new Set()
// colleague
var colleagues = {}
var rColleagues = {}
// employee
var employees = {}
var rEmployees = {}

var matchMap = {
  education: {
    '都可以': 0,
    '本科': 1,
    '硕士': 2,
    '博士': 3
  },
  hometown: {
    '都可以': 0,
    '同省优先': 1
  },
  location: {
    '都可以': 0,
    '同城优先': 1
  },
  marryStatus: {
    '离异': 0,
    '未婚': 1
  }
}

var _getUserInfo = async function(openid) {
  var userInfo = authedUsers.get(openid)
  if(userInfo != undefined) return userInfo
  await db.collection('users').where({
    _openid: openid
  }).get().then(
    function (res) {
      userInfo = res.data[0]
    },
    function (err) {
      console.log("Get user failed(_openid:" + openid + ")," + err)
    }
  )
  return userInfo
}

var getRelative = async function(data) {
  const curNexusInfo = data.nexusInfo
  var level = data.level
  serachFriedsSet.add(curNexusInfo._openid)
  for (var oid of Object.keys(curNexusInfo.friends)) {
    var friend = curNexusInfo.friends[oid]
    var relation = JSON.parse(JSON.stringify(data.relation))
    // set last relation's relationship
    relation[relation.length-1].relation = friend.relationship
    // get portraitURL
    var lastOpenid = relation[relation.length-1]._openid
    var curuser = await _getUserInfo(lastOpenid)
    if(curuser != undefined) {
      var portraitURL = ""
      if(curuser.photos.length != 0) {
          portraitURL = curuser.photos[0]
      } else {
          portraitURL = curuser.wechat_info.avatarUrl
      }
      relation[relation.length-1].portraitURL = portraitURL
    }
    relation.push({_openid:oid,name:friend.name})
    // do not include immediate friend
    if(level != 1) {
      // if person info completed, authed and not contains this person yet 
      if(friend.completed && friend.authed && friend.gender != data.orgGender 
      && !candidatesIDSet.has(oid) && !serachFriedsSet.has(oid)) {
        var portraitURL = relation[relation.length-1].portraitURL
        if(portraitURL == undefined || portraitURL == '') {
          curuser = await _getUserInfo(oid)
          if(curuser != undefined) {
              var portraitURL = ""
              if(curuser.photos.length != 0) {
                  portraitURL = curuser.photos[0]
              } else {
                  portraitURL = curuser.wechat_info.avatarUrl
              }
              relation[relation.length-1].portraitURL = portraitURL
          }
        }
        candidates[oid] = { relation: relation }
        candidatesIDSet.add(oid)
      }
    }
    // just search in 4 levels and exclude searched friends
    if(level >= 4 || serachFriedsSet.has(oid)) {
        continue
    }
    var nexusInfo = {}
    await db.collection('nexus').where({
      _openid: oid
    }).get().then(
      function(res) {
        // console.log('get network info:'+JSON.stringify(res.data))
        if (res.data.length != 0) nexusInfo = res.data[0]
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
      relation: relation
    })
  }
}

var getColleague = function(openid) {
  var cuser = authedUsers.get(openid)
  const cNexus = authedNexus.get(openid) 
  for(var user of company2AUser.get(cuser.auth_info.company_auth.company)) {
    if (user._openid != openid && cNexus.completed) {
      colleagues[user._openid] = null
    }
  }
  // if (openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
  //   console.log("find Emma's colleague data:" + JSON.stringify(colleagues))
  // }
}

var getEmployee = function(openid) {
  var cuser = authedUsers.get(openid)
  var cNexus = authedNexus.get(openid)
  for(var [_openid,user] of authedUsers) {
    if(cuser._openid != _openid && cuser.auth_info.company_auth.company != user.auth_info.company_auth.company
    && cuser.basic_info.gender != user.basic_info.gender && cNexus.completed) {
      employees[user._openid] = null
    }
  }
  // if (openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
  //   console.log("find Emma's employee data:" + JSON.stringify(employees))
  // }
}

// select candidates according to seeker's expect
var seleteCandidates = function(openid) {
  var category = [candidates,colleagues,employees]
  var rCategory = [rCandidates,rColleagues,rEmployees]
  var seekerExpectInfo = authedUsers.get(openid).expect_info
  for(var i in category) {
    for (var candidateID of Object.keys(category[i])) {
      var candidate = category[i][candidateID]
      var expectBInfo = {
        seekerExpect: seekerExpectInfo,
        candidateBasic: authedUsers.get(candidateID).basic_info
      }
      if (matchExpect(expectBInfo)) {
        rCategory[i][candidateID] = candidate
      }
    }
  }
  // if (openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
  //   console.log("find Emma's rColleague data:" + JSON.stringify(rColleagues))
  //   console.log("find Emma's rEmployee data:" + JSON.stringify(rEmployees))
  // }
}

// do match
var matchExpect = function(data) {
  const {seekerExpect,candidateBasic} = data
  for(var el of Object.keys(matchMap)) {
    // FIXME: if el is not defined in candidateBasic and seekerExepect
    if (matchMap[el][candidateBasic[el]] < matchMap[el][seekerExpect[el]]) {
      return false
    }
  }
  var candidateAge = (new Date()).getFullYear - candidateBasic.birthday
  if(candidateAge < seekerExpect.startAge || candidateAge > seekerExpect.endAge) return false
  if(candidateBasic.height < seekerExpect.startHeight || candidateBasic.height > seekerExpect.endHeight) return false
  return true
}

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  try {
    // ========== get all authed users nexus ========== //
    var seekers = []
    await db.collection('nexus').where({
      authed: true,
    }).get().then(
      function(res) {
        seekers = res.data
        for(var nexus of res.data) {
            authedNexus.set(nexus._openid,nexus)
        }
      },
      function(err) {
        console.log(err)
      }
    )
    // ========== get all authed users info ========== //
    var authedUserIDs = []
    for(var seeker of seekers) {
      authedUserIDs.push({
        _openid: seeker._openid
      })
    }
    await db.collection('users').where(_.or(authedUserIDs))
    .get().then(
      function(res) {
        for(var user of res.data) {
          authedUsers.set(user._openid,user)
          var company = user.auth_info.company_auth.company
          var c2u = company2AUser.get(company)
          if(c2u == undefined || c2u.length == 0) c2u = []
          c2u.push(user)
          company2AUser.set(company,c2u)
        }
      },
      function(err) {
        console.log(err)
      }
    )
    // console.log(company2AUser)
    // ========== get candidates according to network ========== //
    for(var seeker of seekers) {
      // get relative
      await getRelative({
        nexusInfo: seeker,
        orgGender: seeker.gender,
        level: 1,
        relation: [{_openid:seeker._openid,name:seeker.name}]
      })
      // get colleague
      getColleague(seeker._openid)
      // get employee
      getEmployee(seeker._openid)
      // exclude deletes and recommended
      await db.collection('network').where({
        _openid: seeker._openid
      }).get().then(
        function(res) {
          seleteCandidates(seeker._openid)
          if(res.data.length == 0) {
            // if not find seeker's network, add one
            db.collection('network').add({
              data: {
                _openid: seeker._openid,
                deletes: [],
                recommended: [],
                nt_company: rEmployees,
                nt_colleague: rColleagues,
                nt_relative: rCandidates
              }
            }).then(
              function(res) {
                console.log('add ' + seeker._openid +
                ' relative successfully! Info:'+JSON.stringify(res))
              },
              function(err) {
                console.log('add ' + seeker._openid +
                ' relative failed! Error:'+JSON.stringify(err))
              }
            )
          } else {
            // if find, exclude deletes and recommended
            // if (seeker._openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
            //   console.log("find Emma's meta data:" + JSON.stringify(res.data[0]))
            // }
            const networkInfo = res.data[0]
            const deletesSet = new Set(networkInfo.deletes)
            const recommendedSet = new Set(networkInfo.recommended)
            for(var openid of Object.keys(candidates)) {
              if(deletesSet.has(openid) || recommendedSet.has(openid)) {
                delete candidates[openid]
              }
            }
            db.collection('network').where({
              _openid: seeker._openid
            }).update({
              data: {
                nt_company: rEmployees,
                nt_colleague: rColleagues,
                nt_relative: rCandidates
              }
            }).then(
              function(res) {
                console.log('update ' + seeker._openid +
                ' relative successfully! Info:'+JSON.stringify(res))
              },
              function(err) {
                console.log('update ' + seeker._openid +
                ' relative failed! Error:'+JSON.stringify(err))
              }
            )
          }
        }
      )
      // clean tmp data
      candidates = {}
      rCandidates = {}
      candidatesIDSet = new Set()
      serachFriedsSet = new Set()
      colleagues = {}
      rColleagues = {}
      employees = {}
      rEmployees = {}
    }
  } catch(e) {
    console.log(e)
  }
}
