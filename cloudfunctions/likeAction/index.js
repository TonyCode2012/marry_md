// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()


const db = cloud.database({
  env: 'dev-2019-xe6cj'
});
const _ = db.command;


exports.main = async (event, context) => {
  console.log(event)
  try {
    var statusCode = 200
    var resMsg = "like action successfully"
    await db.collection('nexus').where({
        _openid: event.likefrom.openid
    }).get().then(
        async function(res) {
            if(res.data.length == 0) {
                statusCode = 500
                resMsg = "Get user nexus info failed!"
                console.log(resMsg)
            } else {
                if(res.data[0].chance == 1) {
                    await db.collection('nexus').where({
                        _openid: event.likefrom.openid
                    }).update({
                        data: {
                            chance: 0
                        }
                    }).then(
                        function(res) {
                            resMsg = "Get chance success!"+JSON.stringify(res)
                            console.log(resMsg)
                        },
                        function(err) {
                            statusCode = 500
                            resMsg = "Get chance failed!"+JSON.stringify(err)
                            console.log(resMsg)
                        }
                    )
                } else {
                    statusCode = 401
                    resMsg = "no chance left"
                    console.log(resMsg)
                }
            }
        },
        function(err) {
            statusCode = 500
            resMsg = "Get user nexus internal error"+JSON.stringify(err)
            console.log(resMsg)
        }
    )
    if(statusCode != 200) {
        return {
            statusCode: statusCode,
            resMsg: resMsg
        }
    }
    // update ilike info
    await db.collection(event.table).where({
      _openid: event.likefrom.openid
    }).update({
      data: {
        "match_info.ilike": event.likefrom.ilike
      },
    }).then(
        function(res) {
            resMsg = "Update ilike info successfully!"
            console.log(resMsg)
        },
        function(err) {
            statusCode = 500
            resMsg = "Update ilike info failed!"+JSON.stringify(err)
            console.log(resMsg)
        }
    )
    if(statusCode != 200) {
        return {
            statusCode: statusCode,
            resMsg: resMsg
        }
    }
    // set likeme info
    await db.collection(event.table).where({
      _openid: event.liketo.openid
    }).get().then(
      async function(res) {
        console.log(res)
        var likeme = res.data[0].match_info.likeme
        // check if exist
        var liketoOpenid = event.liketo.likeme._openid
        for(var i=0;i<likeme.length;i++) {
          if(likeme[i]._openid == liketoOpenid) {
            likeme.splice(i,1)
            break
          }
        }
        likeme.push(event.liketo.likeme)
        // update likeme info
        await db.collection(event.table).where({
          _openid: event.liketo.openid
        }).update({
          data: {
            "match_info.likeme": likeme
          },
          success: res => {
            console.log(res)
          },
          fail: res => {
            console.log("update likeme info failed,_openid:" + event.liketo.openid)
          }
        }).then(
            function(res) {
                console.log("Set likeme info successfully!"+JSON.stringify(res))
            },
            function(err) {
                statusCode = 402
                resMsg = "Set likeme info failed!"+JSON.stringify(err)
                console.log(resMsg)
            }
        )
      },
      function(err) {
          statusCode = 500
          resMsg = "Set likeme info internal error" + JSON.stringify(err)
          console.log(resMsg)
      }
    )
    return {
        statusCode: statusCode,
        resMsg: resMsg
    }
  } catch (e) {
    console.error(e);
  }
}
