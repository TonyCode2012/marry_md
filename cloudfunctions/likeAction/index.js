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
    await db.collection(event.table).where({
      _openid: event.likefrom.openid
    }).update({
      data: {
        "match_info.ilike": event.likefrom.ilike
      },
    })

    // get likeme info
    var likemePromise = ''
    await db.collection(event.table).where({
      _openid: event.liketo.openid
    }).get().then(
      function(res) {
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
        likemePromise = db.collection(event.table).where({
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
        })
      },
      function(err) {
        console.log(err)
      }
    )
    if(likemePromise != '') {
      return await likemePromise.then(
        function(res) {
          console.log(res)
        }
      )
    }
  } catch (e) {
    console.error(e);
  }
}
