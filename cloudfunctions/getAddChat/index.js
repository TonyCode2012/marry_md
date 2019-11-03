// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'dev-2019-xe6cj'
})
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
    var chatInfo = {
        statusCode: 200,
        resMsg: "",
        data: {},
    }
    await db.collection('chat').where({
        _chatid: event._chatid
    }).get().then(
        async function(res) {
            if (res.data.length != 0) {
                chatInfo.data = res.data[0]
                chatInfo.resMsg = "Get chatInfo successfully!"
                console.log(chatInfo.resMsg)
            } else {
                var data = {
                    _chatid: event._chatid,
                    messages: [],
                }
                await db.collection('chat').add({
                    data: data
                }).then(
                    function(res) {
                        chatInfo.data = data
                        chatInfo.resMsg = "Add chatInfo successfully!"
                        console.log(chatInfo.resMsg)
                    },
                    function(err) {
                        chatInfo.statusCode = 500
                        chatInfo.resMsg = "Add chatInfo failed!" + JSON.stringify(err)
                        console.log(chatInfo.resMsg)
                    }
                )
            }
        },
        function(err) {
            chatInfo.statusCode = 500
            chatInfo.resMsg = "Get chatInfo failed!Internal error!" + JSON.stringify(err)
            console.log(chatInfo.resMsg)
        }
    )
    return chatInfo
}