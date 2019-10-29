// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
    env: 'prod-env-2019'
});
const _ = db.command;


// 云函数入口函数
exports.main = async (event, context) => {
    var to_openid = event.to_openid
    var from_openid = event.from_openid
    var relationship = event.relationship
    var resObj = {
        statusCode: 200,
        resMsg: "Update relation successfully!",
        friends: null,
    }
    var ids = [{ _openid: to_openid }, { _openid: from_openid }]
    console.log("ids:" + JSON.stringify(ids))
    await db.collection('nexus').where(_.or(ids)).
        get().then(
            async function (res) {
                var nexusArry = res.data
                if (nexusArry.length != 2) {
                    if(from_openid == to_openid) {
                        var ownNexus = nexusArry[0]
                        var openid = to_openid
                        if (ownNexus['friends'][openid] == undefined) {
                            ownNexus['friends'][openid] = {
                                relationship: relationship,
                                company: ownNexus.company,
                                completed: ownNexus.completed,
                                authed: ownNexus.authed,
                                gender: ownNexus.gender,
                                name: ownNexus.name,
                            }
                        } else {
                            ownNexus['friends'][openid]['relationship'] = relationship
                        }
                        // update own info
                        await db.collection('nexus').where({
                            _openid: openid
                        }).update({
                            data: {
                                friends: ownNexus['friends']
                            }
                        }).then(
                            function (res) {
                                console.log(res)
                                resObj.friends = ownNexus['friends']
                            },
                            function (err) {
                                resObj = {
                                    statusCode: 500,
                                    resMsg: "Update own relation failed!",
                                }
                                console.log(err)
                            }
                        )
                    } else {
                        var msg = "Get related nexus failed!"
                        console.log(msg)
                        resObj = {
                            statusCode: 500,
                            resMsg: msg
                        }
                    }
                    return
                }
                // set these two users' nexus
                var fromNexus = null
                var toNexus = null
                if (nexusArry[0]._openid == to_openid) {
                    toNexus = nexusArry[0]
                    fromNexus = nexusArry[1]
                } else {
                    toNexus = nexusArry[1]
                    fromNexus = nexusArry[0]
                }
                if (toNexus['friends'][from_openid] == undefined) {
                    toNexus['friends'][from_openid] = {
                        relationship: relationship,
                        company: fromNexus.company,
                        completed: fromNexus.completed,
                        authed: fromNexus.authed,
                        gender: fromNexus.gender,
                        name: fromNexus.name
                    }
                } else {
                    toNexus['friends'][from_openid]['relationship'] = relationship
                }
                if (fromNexus['friends'][to_openid] == undefined) {
                    fromNexus['friends'][to_openid] = {
                        relationship: relationship,
                        company: toNexus.company,
                        completed: toNexus.completed,
                        authed: toNexus.authed,
                        gender: toNexus.gender,
                        name: toNexus.name
                    }
                } else {
                    fromNexus['friends'][to_openid]['relationship'] = relationship
                }
                // update to_user info
                await db.collection('nexus').where({
                    _openid: to_openid
                }).update({
                    data: {
                        friends: toNexus['friends']
                    }
                }).then(
                    function (res) {
                        console.log(res)
                    },
                    function (err) {
                        resObj = {
                            statusCode: 500,
                            resMsg: "Update to user relation failed!"
                        }
                        console.log(err)
                    }
                )
                // update from_user info
                await db.collection('nexus').where({
                    _openid: from_openid
                }).update({
                    data: {
                        friends: fromNexus['friends']
                    }
                }).then(
                    function (res) {
                        console.log(res)
                    },
                    function (err) {
                        resObj = {
                            statusCode: 500,
                            resMsg: "Update from user relation failed!"
                        }
                        console.log(err)
                    }
                )
                if(resObj.statusCode == 200) {
                    resObj.friends = fromNexus['friends']
                }
            },
            function (err) {
                resObj = {
                    statusCode: 500,
                    errMsg: err
                }
            }
        )

    return resObj
}
