// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'prod-env-2019'
})

const db = cloud.database();
const _ = db.command;


exports.main = async (event, context) => {
  console.log(event)
  try {
    var statuscode = 200
    var ilikePromise = ''
    var likemePromise = ''
    var dt = new Date()
    dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
    var timeStr = dt.toLocaleString()

    var resp = {
        ilike: {
            statuscode: 200,
            resMsg: 'update ilike info successfully!'
        },
        likeme: {
            statuscode: 200,
            resMsg: 'update likeme info successfully!'
        }
    }
    await db.collection(event.table).where({
      _openid: _.eq(event.ilike.myOpenid).or(_.eq(event.likeme.myOpenid))
    }).get().then(
      async function(res) {
        var users = res.data
        if(users.length != 2) {
            resp = {
                ilike: {
                    statuscode: 500,
                    resMsg: 'update ilike info failed!'
                },
                likeme: {
                    statuscode: 500,
                    resMsg: 'update likeme info failed!'
                }
            }
            return
        }
        var ilike = []
        var ilikedel = []
        var likeme = []
        var likemedel = []
        if(users[0]._openid == event.ilike.myOpenid) {
          ilike = users[0].match_info.ilike
          ilikedel = users[0].match_info.deletes
          likeme = users[1].match_info.likeme
          likemedel = users[1].match_info.deletes
        } else {
          ilike = users[1].match_info.ilike
          ilikedel = users[1].match_info.deletes
          likeme = users[0].match_info.likeme
          likemedel = users[0].match_info.deletes
        }
        var ilikeIndex = -1
        var likemeIndex = -1
        for(var i=0;i<ilike.length;i++) {
          if(ilike[i]._openid == event.ilike.hhOpenid) {
            ilikeIndex = i
            if(event.delItem == 'ilike') {
              var delItems = ilike.splice(i,1)
              var tmpSet = new Set(ilikedel)
              if(!tmpSet.has(delItems[0]._openid)) {
                ilikedel.push(delItems[0]._openid)
              }
            } else {
              ilike[i].decision = "delete"
            }
            break;
          }
        }
        for(var i=0;i<likeme.length;i++) {
          if(likeme[i]._openid == event.likeme.hhOpenid) {
            likemeIndex = i
            if(event.delItem == 'likeme') {
              var delItems = likeme.splice(i,1)
              var tmpSet = new Set(likemedel)
              if(!tmpSet.has(delItems[0]._openid)) {
                likemedel.push(delItems[0]._openid)
              }
            } else {
              likeme[i].decision = "delete"
            }
            break
          }
        }
        await db.collection(event.table).where({
          _openid: event.ilike.myOpenid
        }).update({
          data: {
            'match_info.ilike': ilike,
            'match_info.deletes': ilikedel,
            time: timeStr,
          }
        }).then(
            function(res) {
              console.log(res)
            },
            function(err) {
              console.log("update ilike info failed! ERROR:"+JSON.stringify(err))
              resp.ilike = {
                statuscode: 500,
                resMsg: 'update ilike info failed! ERROR:'+JSON.stringify(err)
              }
            }
        )
        await db.collection(event.table).where({
          _openid: event.likeme.myOpenid
        }).update({
          data: {
            'match_info.likeme': likeme,
            'match_info.deletes': likemedel,
            time: timeStr,
          }
        }).then(
            function(res) {
              console.log(res)
            },
            function(err) {
              console.log("update likeme info failed! ERROR:"+JSON.stringify(err))
              resp.likeme = {
                statuscode: 500,
                resMsg: 'update likeme info failed! ERROR:'+JSON.stringify(err)
              }
            }
        )
      },
      function(err) {
        console.log(err)
      }
    )
    console.log(resp)
    return resp
  } catch (e) {
    console.error(e);
  }
}
