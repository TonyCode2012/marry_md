// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'test-t2od1'
});
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  var users = []
  await db.collection('zy_users').where(_.or(event.ids))
  .get().then(
    function(res) {
      users = res.data
    },
    function(err) {
      console.log(err)
    }
  )
  return {
    statusCode: 200,
    data: users
  }
  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}