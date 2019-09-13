// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'test-t2od1'
});
const _ = db.command;


exports.main = async (event, context) => {
  console.log(event)
  try {
    var statuscode = 200
    var ilikePromise = ''
    var likemePromise = ''
    var resp = {
      statuscode: 200,
      resMsg: 'update ilike and likeme info successfully!'
    }
    resp = await db.collection(event.table).where({
      _openid: _.eq(event.ilike.myOpenid).or(_.eq(event.likeme.myOpenid))
    }).get().then(
      function(res) {
        var users = res.data
        if(users.length != 2) {
          return {
            statuscode: 400,
            resMsg: 'get ilike and likeme info failed!'
          }
        }
        var ilike = []
        var ilikedel = []
        var likeme = []
        var likemedel = []
        if(users[0]._openid == event.ilike.myOpenid) {
          ilike = users[0].match_info.ilike
          ilikedel = user[0].match_info.deletes
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
              ilikedel.push(delItems[0]._openid)
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
              likemedel.push(delItems[0]._openid)
            } else {
              likeme[i].decision = "delete"
            }
            break
          }
        }
        if(ilikeIndex != -1) {
          ilikePromise = db.collection(event.table).where({
            _openid: event.ilike.myOpenid
          }).update({
            data: {
              'match_info.ilike': ilike,
              'match_info.deletes': ilikedel
            }
          })
        }
        if (likemeIndex != -1) {
          likemePromise = db.collection(event.table).where({
            _openid: event.likeme.myOpenid
          }).update({
            data: {
              'match_info.likeme': likeme,
              'match_info.deletes': likemedel
            }
          })
        }
        return {
          statuscode: 200,
          resMsg: 'update ilike and likeme info successfully!'
        }
      },
      function(err) {
        console.log(err)
        return 500
      }
    )
    if(ilikePromise != '') {
      await ilikePromise.then(
        function(res) {
          console.log(res)
        },
        function(err) {
          console.log("update ilike info failed! ERROR:"+JSON.stringify(err))
          resp = {
            statuscode: 201,
            resMsg: 'update ilike info failed! ERROR:'+JSON.stringify(err)
          }
        }
      )
    }
    if(likemePromise != '') {
      await likemePromise.then(
        function(res) {
          console.log(res)
        },
        function (err) {
          console.log("update likeme info failed! ERROR:" + JSON.stringify(err))
          resp = {
            statuscode: 202,
            resMsg: 'update likeme info failed! ERROR:' + JSON.stringify(err)
          }
        }
      )
    }
    console.log(resp)
    return resp
  } catch (e) {
    console.error(e);
  }
}