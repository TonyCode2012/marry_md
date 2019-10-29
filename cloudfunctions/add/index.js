// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'prod-env-2019'
});
const _ = db.command;


exports.main = async (event, context) => {
  console.log(event)
  try {
    return await db.collection(event.table).add({
      data: event.userInfo
    }).then(
        function(res) {
            console.log("add user successfully!"+res)
        },
        function(err) {
            console.log("add user failed!"+res)
        }
    )
  } catch (e) {
    console.error(e);
  }
}
