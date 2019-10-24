// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'dev-2019-xe6cj'
});
const _ = db.command;


// 云函数入口函数
exports.main = async (event, context) => {
    var resObj = {
        statusCode: 200,
        resMsg: "Authorize company successfully!"
    }
    // update authedEmail table info
    await db.collection('authedEmail').where({
        _openid: event._openid
    }).get().then(
        async function(res) {
            if(res.data.length == 0) {
                await db.collection('authedEmail').add({
                    data: event.authedEmailData
                }).then(
                    function(res) {
                        console.log("Write authedEmail table successfully!"+JSON.stringify(res))
                    },
                    function(err) {
                        resObj = {
                            statusCode: 500,
                            resMsg: "Write authedEmail table failed!Internal error "
                        }
                        console.log(resObj.resMsg+JSON.stringify(err))
                    }
                )
            } else {
                resObj = {
                    statusCode: 401,
                    resMsg: "This email has been authed!"
                }
            }
        },
        function(err) {
            resObj = {
                statusCode: 500,
                resMsg: "Get authedEmail info failed!"
            }
        }
    )
    if(resObj.statusCode != 200) {
        return resObj
    }
    // update users table info
    await db.collection('users').where({
        _openid: event._openid
    }).update({
        data: event.usersData
    }).then(
        function(res) {
            console.log("Write uses table successfully!"+JSON.stringify(res))
        },
        function(err) {
            resObj = {
                statusCode: 500,
                resMsg: "Write users table failed!Internal error "
            }
            console.log(resObj.resMsg+JSON.stringify(err))
        }
    )
    if(resObj.statusCode != 200) {
        return resObj
    }
    // update nexus table info
    await db.collection('nexus').where({
        _openid: event._openid
    }).update({
        data: event.nexusData
    }).then(
        function(res) {
            console.log("Write nexus table successfully!"+JSON.stringify(res))
        },
        function(err) {
            resObj = {
                statusCode: 500,
                resMsg: "Write nexus table failed!Internal error "
            }
            console.log(resObj.resMsg+JSON.stringify(err))
        }
    )

    return resObj
}
