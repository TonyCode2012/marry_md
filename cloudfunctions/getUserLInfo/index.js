// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'prod-env-2019'
})
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  var users = []
  await db.collection('users').where(_.or(event.ids))
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
