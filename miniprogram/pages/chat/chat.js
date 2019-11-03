const app = getApp()
const {
    db,
    globalData
} = app
const _ = db.command

Page({
    data: {
        InputBottom: -globalData.Custom.bottom,
        orgChatInfo: {},
        chatInfo: {},
        talkOID: '',
        talkPortraitURL: '',
        selfPortraitURL: '',
        text: '',
        chatid: '',
        chatIntervalID: 0,
        footHeight: 55,
        scrollTop: 0,
        focusOnInput: false,
        holdKeyBoard: true,
    },
    InputFocus(e) {
        console.log("changed:",e.detail.height)
        this.setData({
            InputBottom: e.detail.height - globalData.Custom.bottom,
            // holdKeyBoard: true,
            // focusOnInput: true,
        })
    },
    InputBlur(e) {
        this.setData({
            InputBottom: 0
        })
    },
    scrollToBottom() {
        const that = this
        //创建节点选择器
        var query = wx.createSelectorQuery();
        //选择id
        query.select('#chatBox').boundingClientRect()
        query.exec(function (res) {
            //取高度
            console.log("bottom:",that.data.InputBottom);
            var curPageHeight = res[0].height
            wx.pageScrollTo({
                scrollTop: curPageHeight,
            })
            // setTimeout(res=> {
            //     that.setData({
            //         InputBottom: that.data.InputBottom - 10,
            //         scrollTop: curPageHeight,
            //     })
            // },1000)
        })
    },

    inputMessage(e) {
        this.setData({
            text: e.detail.value,
        })
    },
    sendMessage(e) {
        const that = this
        if(that.data.text == '') {
            console.log("Please input something!")
            return
        }
        var message = {
            _openid: globalData.userInfo._openid,
            checked: false,
            time: (new Date()).toLocaleString(),
            text: that.data.text,
        }
        var messages = that.data.chatInfo.messages
        messages.push(message)
        that.setData({
            'chatInfo.messages': messages,
            text: '',
        })
        // scroll to page bottom
        that.scrollToBottom()
        wx.cloud.callFunction({
            name: 'sendMessage',
            data: {
                _chatid: that.data.chatid,
                message: message,
            },
            success: function(res) {
                console.log("Send message successfully!",res)
            },
            fail: function(err) {
                console.log("Send message failed!",err)
            }
        })
        // that.setData({
        //     holdKeyBoard: false,
        // })
    },

    onLoad(option) {
        const that = this
        var likeInfo = JSON.parse(option.likeInfo)
        // genereate chatid
        var chatid = ''
        var talkOID = likeInfo._openid
        var selfOID = globalData.userInfo._openid
        var idLen = Math.max(talkOID.length,selfOID.length) / 2
        if (talkOID > selfOID) {
            chatid = talkOID.substring(0, idLen) + selfOID.substring(0, idLen)
        } else {
            chatid = selfOID.substring(0, idLen) + talkOID.substring(0, idLen)
        }
        var talkPortraitURL = likeInfo.portraitURL
        // get or add chatInfo to db
        var chatInfo = globalData.chatMap.get(chatid)
        if(!chatInfo) {
            wx.cloud.callFunction({
                name: 'getAddChat',
                data: {
                    _chatid: chatid
                },
                success: function(res) {
                    if(res.result.statusCode == 200) {
                        chatInfo = res.result.data
                        var messages = chatInfo.messages
                        that.data.orgChatInfo = chatInfo
                        if(messages.length > 15) {
                            chatInfo.messages = messages.slice(messages.length-15,messages.length)
                        }
                        globalData.chatMap.set(chatid, chatInfo)
                        that.setData({
                            chatInfo: chatInfo,
                        })
                        // scroll to page bottom
                        that.scrollToBottom()
                    } else {
                        console.log("Get chatInfo failed!",res)
                    }
                },
                fail: function(err) {
                    console.log("Get chatInfo failed!Internal error!",err)
                }
            })
        } else {
            that.setData({
                chatInfo: chatInfo,
            })
            // scroll to page bottom
            that.scrollToBottom()
        }
        // check if there is a update every 3 seconds
        var chatIntervalID = setInterval(function(res) {
            db.collection('chat').where({
                _chatid: chatid
            }).get({
                success: function(res) {
                    if(res.data.length != 0) {
                        var nChatInfo = res.data[0]
                        if (nChatInfo.messages.length > orgChatInfo.messages.length) {
                            var messages = nChatInfo.messages
                            if (messages.length > 15) {
                                nChatInfo.messages = messages.slice(messages.length - 15, messages.length)
                            }
                            globalData.chatMap.set(chatid, nChatInfo)
                            that.setData({
                                chatInfo: nChatInfo,
                            })
                            // scroll to page bottom
                            that.scrollToBottom()
                        }
                    } else {
                        console.log("Check chat update failed!",res)
                    }
                },
                fail: function(err) {
                    console.log("Check chat update failed!Internal error!",err)
                }
            })
        }, 3000)
        this.setData({
            talkOID: talkOID,
            talkPortraitURL: talkPortraitURL,
            selfPortraitURL: globalData.userInfo.portraitURL,
            chatid: chatid,
            chatIntervalID: chatIntervalID,
        })
    },

    onUnload: function() {
        clearInterval(this.data.chatIntervalID)
    },
    onHide: function() {
        clearInterval(this.data.chatIntervalID)
    },
})