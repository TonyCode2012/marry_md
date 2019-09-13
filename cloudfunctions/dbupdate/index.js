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
    return await db.collection(event.table).where({
      _openid: event._openid
    }).update({
      data: {
        [event.field]: event.data
      }
    })
  } catch (e) {
    console.error(e);
  }
}