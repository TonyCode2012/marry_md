// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
    env: 'dev-2019-xe6cj'
})
const _ = db.command

// all nexus
var allNexus = new Map()
// all users
var acUsers = new Map()
var authedNexus = new Map()
var company2ACUser = new Map()
// ========== tmp data for one user search ========== //
// relative
var candidates = {}
var rCandidates = {}
var candidatesIDSet = new Set()
var searchFriendSet = new Set()
var searchCompanySet = new Set()
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

var _getUserInfo = async function (openid) {
    var userInfo = acUsers.get(openid)
    if (userInfo != undefined) return userInfo
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

var getRelative = async function (data) {
    const curNexus = data.nexusInfo
    var level = data.level
    searchFriendSet.add(curNexus._openid)
    // recurse search curNexus relation
    for (var friendOid of Object.keys(curNexus.friends)) {
        var friend = curNexus.friends[friendOid]
        // var relations = JSON.parse(JSON.stringify(data.relations))
        var relations = [].concat(data.relations)
        // set last relation's relationship
        relations[relations.length - 1].relationship = friend.relationship
        // get portraitURL
        // var lastOpenid = relations[relations.length - 1]._openid
        // var curuser = await _getUserInfo(lastOpenid)
        // if (curuser != undefined) {
        //     var portraitURL = ""
        //     if (curuser.photos.length != 0) {
        //         portraitURL = curuser.photos[0]
        //     } else {
        //         portraitURL = curuser.wechat_info.avatarUrl
        //     }
        //     relations[relations.length - 1].portraitURL = portraitURL
        // }
        relations.push({ _openid: friendOid, name: friend.name })
        //============== get friends company authed and completed resource ==============//
        if(friend.authed) {
            var fColleagueACUsers = company2ACUser.get(friend.company)
            if(friend.company != data.orgCompany && !searchCompanySet.has(friend.company)) {
                searchCompanySet.add(friend.company)
                for (var acUser of fColleagueACUsers) {
                    var acOid = acUser._openid
                    if (acOid != friendOid && acUser.basic_info.gender != data.orgGender
                        && !candidatesIDSet.has(acOid)) {
                        var tmpRelations = [].concat(relations)
                        tmpRelations[tmpRelations.length - 1].relationship = 'colleague'
                        tmpRelations.push({ _openid: acOid, name: acUser.basic_info.nickName })
                        candidates[acOid] = { relation: tmpRelations }
                        candidatesIDSet.add(acOid)
                    }
                }
            }
        }
        // do not include immediate friend
        if (level != 1) {
            // if person info completed, authed and not contains this person yet 
            if (friend.completed && friend.authed && friend.gender != data.orgGender
                && !candidatesIDSet.has(friendOid) && !searchFriendSet.has(friendOid)) {
                // var portraitURL = relations[relations.length - 1].portraitURL
                // if (portraitURL == undefined || portraitURL == '') {
                //     curuser = await _getUserInfo(friendOid)
                //     if (curuser != undefined) {
                //         var portraitURL = ""
                //         if (curuser.photos.length != 0) {
                //             portraitURL = curuser.photos[0]
                //         } else {
                //             portraitURL = curuser.wechat_info.avatarUrl
                //         }
                //         relations[relations.length - 1].portraitURL = portraitURL
                //     }
                // }
                candidates[friendOid] = { relation: relations }
                candidatesIDSet.add(friendOid)
            }
        }
        // just search in 4 levels and exclude searched friends
        if (level >= 4 || searchFriendSet.has(friendOid)) {
            continue
        }
        var nexusInfo = allNexus.get(friendOid)
        // await db.collection('nexus').where({
        //     _openid: friendOid
        // }).get().then(
        //     function (res) {
        //         // console.log('get network info:'+JSON.stringify(res.data))
        //         if (res.data.length != 0) nexusInfo = res.data[0]
        //     },
        //     function (err) {
        //         console.log(err)
        //     }
        // )
        // recurse searching next friend info
        // searchFriendSet.add(curNexus._openid)
        await getRelative({
            nexusInfo: nexusInfo,
            level: level + 1,
            orgGender: data.orgGender,
            orgCompany: data.orgCompany,
            relations: relations
        })
    }
}

var getColleague = function (openid) {
    // var cuser = acUsers.get(openid)
    var cNexus = allNexus.get(openid)
    for (var user of company2ACUser.get(cNexus.company)) {
        if (user._openid != openid) {
            colleagues[user._openid] = null
        }
    }
    // if (openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
    if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
     console.log("find Emma's colleague data:" + JSON.stringify(colleagues))
    }
}

var getEmployee = function (openid) {
    // var cuser = acUsers.get(openid)
    var cNexus = allNexus.get(openid)
    for (var [_openid, user] of acUsers) {
        if (cNexus._openid != _openid && cNexus.company != user.company
            && cNexus.gender != user.basic_info.gender) {
            employees[_openid] = null
        }
    }
    // if (openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
    if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
       console.log("find Emma's employee data:" + JSON.stringify(employees))
    }
}

// select candidates according to seeker's expect
var seleteCandidates = async function (openid) {
    if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
        console.log("find Emma's start select rRelative data:" + JSON.stringify(candidates))
    }
    var categories = [candidates, colleagues, employees]
    var rCategory = [{}, {}, {}]
    // var rCategory = [rCandidates, rColleagues, rEmployees]
    var seeker = acUsers.get(openid)
    if (seeker == undefined) {
        var statusCode = 200
        await db.collection('users').where({
            _openid: openid
        }).get().then(
            function(res) {
                if(res.data.length > 0) {
                    seeker = res.data[0]
                } else {
                    statusCode = 400
                    console.log("Get seeker:" + openid + " expect info failed!400")
                }
            },
            function(err) {
                statusCode = 500
                console.log("Get seeker:"+openid+" expect info failed!500")
            }
        )
        if(statusCode != 200) return
    }
    var seekerExpectInfo = seeker.expect_info
    var seekerBasicInfo = seeker.basic_info
    for (var i in categories) {
        var category = categories[i]
        for (var candidateID of Object.keys(category)) {
            var candidate = category[candidateID]
            var expectBInfo = {
                seekerExpect: seekerExpectInfo,
                seekerBasic: seekerBasicInfo,
                candidateBasic: acUsers.get(candidateID).basic_info
            }
            if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
                console.log("Emma's info:"+JSON.stringify(expectBInfo))
            }
            if (matchExpect(expectBInfo, openid)) {
                rCategory[i][candidateID] = candidate
            }
        }
    }
    rCandidates = ([].concat([rCategory[0]]))[0]
    rColleagues = ([].concat([rCategory[1]]))[0]
    rEmployees = ([].concat([rCategory[2]]))[0]
    // if (openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
    // if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
    //     console.log("find Emma's rColleague data:" + JSON.stringify(rColleagues))
    //     console.log("find Emma's rEmployee data:" + JSON.stringify(rEmployees))
    //     console.log("find Emma's rRelative data:" + JSON.stringify(rCandidates))
    //     console.log("find Emma's rRelative data:" + JSON.stringify(rCategory[0]))
    // }
}

// do match
var matchExpect = function (data,openid) {
    const { seekerExpect, seekerBasic, candidateBasic } = data
    // for (var el of Object.keys(matchMap)) {
    //     // FIXME: if el is not defined in candidateBasic and seekerExepect
    //     if(seekerExpect[el] == undefined) continue
    //     if (matchMap[el][candidateBasic[el]] < matchMap[el][seekerExpect[el]]) {
    //         return false
    //     }
    // }
    var property = 'education'
    // deal with education and marrayStatus
    if (seekerExpect[property] != undefined &&
        matchMap[property][seekerExpect[property]] != 0 &&
        seekerBasic[property] != undefined &&
        matchMap[property][seekerBasic[property]] > matchMap[property][candidateBasic[property]]) {
        if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
            console.log(property + " error")
        }
        return false
    }
    property = 'marryStatus'
    if (seekerExpect[property] != undefined &&
        matchMap[property][seekerExpect[property]] != 0 &&
        seekerBasic[property] != undefined &&
        matchMap[property][seekerBasic[property]] > matchMap[property][candidateBasic[property]]) {
        if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
            console.log(property + " error")
        }
        return false
    }
    // deal with hometown and location
    property = 'hometown'
    if (seekerExpect[property] != undefined &&
        matchMap[property][seekerExpect[property]] != 0 &&
        seekerBasic[property] != undefined &&
        seekerBasic[property][0] != candidateBasic[property][0]) {
        if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
            console.log(property + " error")
        }
        return false
    }
    property = 'location'
    if (seekerExpect[property] != undefined &&
        matchMap[property][seekerExpect[property]] != 0 &&
        seekerBasic[property] != undefined &&
        seekerBasic[property][1] != candidateBasic[property][1]) {
        if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
            console.log(property + " error")
        }
        return false
    }
    var candidateAge = (new Date()).getFullYear() - candidateBasic.birthday
    if(seekerExpect.startAge == undefined || seekerExpect.endAge == undefined) return true
    if (seekerExpect.startHeight == undefined || seekerExpect.endHeight == undefined) return true
    if (openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
        console.log("birthday error")
    }
    if (candidateAge < seekerExpect.startAge || candidateAge > seekerExpect.endAge) return false
    if (candidateBasic.height < seekerExpect.startHeight || candidateBasic.height > seekerExpect.endHeight) return false
    return true
}

// 云函数入口函数
exports.main = async (event, context) => {
    console.log(event)
    try {
        // ========== get all users nexus ========== //
        await db.collection('nexus').where({
            authed: _.eq(true).or(_.eq(false)),
        }).get().then(
            function (res) {
                for (var nexus of res.data) {
                    allNexus.set(nexus._openid, nexus)
                    authedNexus.set(nexus._openid, nexus)
                }
            },
            function (err) {
                console.log(err)
            }
        )
        // ========== get all authed users info ========== //
        var acUserIDs = []
        for (var [_openid, nexus] of allNexus) {
            if (nexus.authed && nexus.completed) {
                acUserIDs.push({
                    _openid: nexus._openid
                })
            }
        }
        await db.collection('users').where(_.or(acUserIDs))
            .get().then(
                function (res) {
                    for (var user of res.data) {
                        acUsers.set(user._openid, user)
                        var company = user.auth_info.company_auth.company
                        var c2u = company2ACUser.get(company)
                        if (c2u == undefined || c2u.length == 0) c2u = []
                        c2u.push(user)
                        company2ACUser.set(company, c2u)
                    }
                },
                function (err) {
                    console.log(err)
                }
            )
        // console.log(company2ACUser)
        // ========== get candidates according to network ========== //
        for (var [_openid, nexus] of allNexus) {
            // get relative
            await getRelative({
                nexusInfo: nexus,
                orgGender: nexus.gender,
                orgCompany: nexus.company,
                level: 1,
                relations: [{ _openid: nexus._openid, name: nexus.name }]
            })
            // get authed user's colleagues and big company employees
            if (nexus.authed) {
                // get colleague
                getColleague(nexus._openid)
                // get employee
                getEmployee(nexus._openid)
            }
            // exclude deletes and recommended
            await db.collection('network').where({
                _openid: nexus._openid
            }).get().then(
                async function (res) {
                    await seleteCandidates(nexus._openid)
                    if (res.data.length == 0) {
                        // if not find nexus's network, add one
                        db.collection('network').add({
                            data: {
                                _openid: nexus._openid,
                                deletes: [],
                                recommended: [],
                                nt_company: rEmployees,
                                nt_colleague: rColleagues,
                                nt_relative: rCandidates
                            }
                        }).then(
                            function (res) {
                                console.log('add ' + nexus._openid +
                                    ' relative successfully! Info:' + JSON.stringify(res))
                            },
                            function (err) {
                                console.log('add ' + nexus._openid +
                                    ' relative failed! Error:' + JSON.stringify(err))
                            }
                        )
                    } else {
                        // if find, exclude deletes and recommended
                        // if (nexus._openid == 'o7-nX5bCjrCcp7zI90EmjMxRamPM') {
                        //if (nexus._openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
                        //  console.log("find Emma's meta data:" + JSON.stringify(res.data[0]))
                        //}
                        const networkInfo = res.data[0]
                        const deletesSet = new Set(networkInfo.deletes)
                        const recommendedSet = new Set(networkInfo.recommended)
                        for (var openid of Object.keys(candidates)) {
                            if (deletesSet.has(openid) || recommendedSet.has(openid)) {
                                delete candidates[openid]
                            }
                        }
                        const updateKeys = ['nt_company','nt_colleague','nt_relative']
                        const updateValues = [rEmployees,rColleagues,rCandidates]
                        var updateData = {}
                        for(var i in updateKeys) {
                            var key = updateKeys[i]
                            // if (nexus._openid == 'o7-nX5cr9anN9KzPJkVMBPBWKxTo') {
                            //     console.log("==========:" + JSON.stringify(rCandidates))
                            // }
                            if(Object.keys(updateValues[i]).length != 0) {
                                updateData[key] = updateValues[i]
                            }
                        }
                        if(Object.keys(updateData).length != 0) {
                            db.collection('network').where({
                                _openid: nexus._openid
                            }).update({
                                data: updateData
                            }).then(
                                function (res) {
                                    console.log('update ' + nexus._openid +
                                        ' relative successfully! Info:' + JSON.stringify(res))
                                },
                                function (err) {
                                    console.log('update ' + nexus._openid +
                                        ' relative failed! Error:' + JSON.stringify(err))
                                }
                            )
                        }
                    }
                }
            )
            // clean tmp data
            candidates = {}
            rCandidates = {}
            candidatesIDSet = new Set()
            searchFriendSet = new Set()
            searchCompanySet = new Set()
            colleagues = {}
            rColleagues = {}
            employees = {}
            rEmployees = {}
        }
    } catch (e) {
        console.log(e)
    }
}
