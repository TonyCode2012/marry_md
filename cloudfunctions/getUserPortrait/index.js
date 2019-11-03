// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-2019-xe6cj'
})
const db = cloud.database();
const _ = db.command;

var getPortrait = function(userInfo) {
    var portraitURL = ""
    if(userInfo.photos.length != 0) {
        portraitURL = userInfo.photos[0]
    } else {
        portraitURL = userInfo.wechat_info.avatarUrl
    }
    return {
        _openid: userInfo._openid,
        portrait: portraitURL
    }

}


// 云函数入口函数
exports.main = async (event, context) => {
    var statusCode = 200
    var openid2Portrait = {}
    await db.collection('users').where({
        _openid: _.or(event.ids)
    }).get().then(
        function(res) {
            for(var userInfo of res.data) {
                var o2p = getPortrait(userInfo)
                openid2Portrait[o2p._openid] = o2p.portrait
            }
        },
        function(err) {
            statusCode = 500
            console.log("get seeks failed!"+err)
        }
    )

    return {
        data: openid2Portrait,
        statusCode: statusCode
    }

}
