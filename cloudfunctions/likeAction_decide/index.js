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
    var likefromPromise = ''
    var liketoPromise = ''
    var dt = new Date()
    dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
    var timeStr = dt.toLocaleString()

    await db.collection(event.table).where({
      _openid: event.likefrom_openid
    }).get().then(
      function(res) {
        var ilike = res.data[0].match_info.ilike
        for(var i=0;i<ilike.length;i++) {
          if(ilike[i]._openid == event.liketo_openid) {
            ilike[i].decision = event.decision
            likefromPromise = db.collection(event.table).where({
              _openid: event.likefrom_openid
            }).update({
              data: {
                  'match_info.ilike': ilike,
                  time: timeStr,
              }
            })
            console.log(likefromPromise)
            break
          }
        }
      },
      function(err) {
        console.log(err)
      }
    )
    if (likefromPromise == '') {
      return {
        statuscode: 500,
        data: null,
        errMsg: 'get ilike info failed'
      }
    }
    await db.collection(event.table).where({
      _openid: event.liketo_openid
    }).get().then(
      function (res) {
        var likeme = res.data[0].match_info.likeme
        for (var i = 0; i < likeme.length; i++) {
          if (likeme[i]._openid == event.likefrom_openid) {
            likeme[i].decision = event.decision
            liketoPromise = db.collection(event.table).where({
              _openid: event.liketo_openid
            }).update({
              data: {
                'match_info.likeme': likeme,
                time: timeStr,
              }
            })
          }
        }
        console.log('update likeme successfully')
      },
      function(err) {
        console.log(err)
      }
    )
    if(liketoPromise == '') {
      return {
        statuscode: 500,
        data: null,
        errMsg: 'get like me info failed'
      }
    }
    const tasks = [likefromPromise,liketoPromise]
    var goon = true
    for(var i=0;i<tasks.length && goon;i++) {
      await (tasks[i]).then(
        function(res) {
          console.log(res)
        },
        function (err) {
          return {
            statuscode: 500,
            data: null,
            errMsg: 'set decision status failed'
          }
          goon = false
          console.log(res)
        }
      )
    }
    return {
      statuscode: 200,
      data: null,
      errMsg: 'set decision status successfully!'
    }
  } catch (e) {
    console.error(e);
  }
}
