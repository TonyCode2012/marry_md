// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-2019-xe6cj'
})

const db = cloud.database();
const _ = db.command;


exports.main = async (event, context) => {
    console.log(event)
    // try {
    //     return await db.collection(event.table).where({
    //         _openid: event._openid
    //     }).update({
    //         data: event.data
    //     })
    // } catch (e) {
    //     console.error(e);
    // }
    try {
        var idKey = event.idKey
        var idVal = event.idVal
        if(!idKey) {
            console.log("Primary key can't be null!")
            return
        }
        return await db.collection(event.table).where({
            [idKey]: idVal
        }).update({
            data: event.data
        })
    } catch (e) {
        console.error(e);
    }
}
