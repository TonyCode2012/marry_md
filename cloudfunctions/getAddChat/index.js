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
    var talkOID = event.talkOID
    var selfOID = event.selfOID
    var chatid = event._chatid
    var chatLimit = event.limit
    var startPos = event.startPos
    var endPos = event.endPos
    await db.collection('chat').where({
        _chatid: chatid
    }).get().then(
        async function(res) {
            if (res.data.length != 0) {
                var result = res.data[0]
                var messages = result.messages
                var cLen = messages.length
                if (startPos != -1) {
                    // check if there is update
                    if (cLen < startPos) {
                        chatInfo.resMsg = "Last position larger current length!"
                        chatInfo.statusCode = 500
                        console.log(chatInfo.resMsg)
                        return
                    }
                    var oldMessages = []
                    var fetchEPos = startPos
                    var fetchSPos = startPos - chatLimit
                    if (fetchSPos < 0) fetchSPos = 0
                    oldMessages = messages.slice(fetchSPos, fetchEPos)
                    result.startPos = fetchSPos
                    result.endPos = endPos
                    result.messages = oldMessages
                    chatInfo.data = result
                } else {
                    // initial fetch
                    var getShow = false
                    var showedMsg = []
                    var uncheckedMsg = []
                    for (var msg of messages) {
                        if(!msg.checked && msg._openid == talkOID) {
                            uncheckedMsg.push(msg)
                            getShow = true
                        }
                        if (getShow) {
                            showedMsg.push(JSON.parse(JSON.stringify(msg)))
                            msg.checked = true
                        }
                    }
                    if (showedMsg.length < chatLimit) {
                        var fetchSPos = cLen - chatLimit
                        var fetchEPos = cLen
                        if (fetchSPos < 0) fetchSPos = 0
                        showedMsg = messages.slice(fetchSPos,fetchEPos)
                    }
                    result.messages = showedMsg
                    result.startPos = cLen - showedMsg.length
                    result.endPos = cLen
                    chatInfo.data = result
                    chatInfo.resMsg = "Get chatInfo successfully!"
                    console.log(chatInfo.resMsg)
                    // set check status to checked
                    if(uncheckedMsg.length > 0) {
                        console.log("coming into update")
                        await db.collection('chat').where({
                            _chatid: chatid
                        }).update({
                            data: {
                                messages: messages
                            },
                        }).then(
                            function (res) {
                                console.log("Update check status successfully!", res)
                            },
                            function (err) {
                                console.log("Update check status failed!", err)
                            }
                        )
                    }
                }
            } else {
                var data = {
                    _chatid: event._chatid,
                    messages: [],
                }
                await db.collection('chat').add({
                    data: data
                }).then(
                    function(res) {
                        data.startPos = 0
                        data.endPos = 0
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