// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'dev-2019-xe6cj'
})
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
    return await db.collection('chat').where({
        _chatid: event._chatid
    }).update({
        data: {
            messages: _.push([event.message])
        }
    }).then(
        function(res) {
            console.log("Push message successfully!",res)
        },
        function(err) {
            console.log("Push message failed!Internal error!",err)
        }
    )
}