// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'dev-2019-xe6cj'
});
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  var userIDs = []
  await db.collection('nexus')
        //.where({completed: true })
        .get().then(
    function(res) {
      for(var user of res.data) {
        userIDs.push(user.name+":"+user._openid)
      }
    }
  )

  return {
    data: userIDs,
    statusCode: 200
  }
  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}
