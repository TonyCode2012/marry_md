const app = getApp()
const {
    db,
    globalData
} = app
const _ = db.command

Page({
    data: {
        // InputBottom: -globalData.Custom.bottom,
        InputBottom: 0,
        CustomBar: globalData.CustomBar,
        orgChatInfo: {},
        chatInfo: {},
        talkOID: '',
        talkName: '',
        talkPortraitURL: '',
        selfPortraitURL: '',
        text: '',
        chatid: '',
        chatIntervalID: 0,
        footHeight: 55,
        inputPos: 0,
        chatPos: 0,
        chatMsgHeight: 0,
        scrollTop: 1,
        scrollHeight: globalData.CustomHeight,
        focusOnInput: false,
        holdKeyBoard: true,
        // indicate current loaded messages length
        toView: 'thelast',
        // diplayed message number
        // move control
        ListTouchStartPosX: 0,
        ListTouchStartPosY: 0,
        ListTouchHDirection: '',
        ListTouchVDirection: '',
        shiftDisX: 0,
        shiftDisY: 0,
        scrollToTop: true,
        // control update data
        showTip: false,
        tipContent: '',
    },
    InputFocus(e) {
        const that = this
        console.log("changed:", e.detail.height)
        that.setData({
            InputBottom: e.detail.height,
        }, function (res) {
                setTimeout(res=>{
                    that.scrollToBottom()
                    that.setData({
                        focusOnInput: true
                    })
                },500)
            }
        )
    },
    InputBlur(e) {
        this.setData({
            InputBottom: 0,
            chatPos: 0,
            // holdKeyBoard: false,
        })
        this.scrollToBottom()
    },
    scrollToBottom() {
        const that = this
        wx.pageScrollTo({
            selector: `#chatid${that.data.chatInfo.messages.length - 1}`,
            duration: 0,
        })
    },
    scrollToTop() {
        wx.pageScrollTo({
            selector: '#chatid0',
            duration: 0,
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
        // generate message
        var message = {
            _openid: globalData.userInfo._openid,
            checked: false,
            time: (new Date()).toLocaleString(),
            text: that.data.text,
        }
        var messages = that.data.chatInfo.messages
        messages.push(message)
        that.data.chatInfo.endPos++
        globalData.chatMap.set(that.data.chatid,that.data.chatInfo)
        // get chat item height
        if (that.data.chatMsgHeight == 0 && messages.length > 0) {
            wx.createSelectorQuery().select('#chatid0').boundingClientRect(rect => {
                that.data.chatMsgHeight = rect.height
                that.setData({
                    'chatInfo.messages': messages,
                    text: '',
                    chatPos: that.data.chatPos + that.data.chatMsgHeight,
                })
            }).exec()
        } else {
            that.setData({
                'chatInfo.messages': messages,
                text: '',
                chatPos: that.data.chatPos + that.data.chatMsgHeight,
            })
        }
        // sync messages to db
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
    },
    go2UserDetail(e) {
        wx.navigateTo({
            url: `/pages/member/detail/detail?openid=${e.currentTarget.dataset.openid}`,
        })
    },

    touchMsgBox(e) {
        this.setData({
            focusOnInput: false,
        })
    },
    // ListTouch触摸开始
    ListTouchStart(e) {
        this.setData({
            ListTouchStartPosX: e.touches[0].pageX,
            ListTouchStartPosY: e.touches[0].pageY,
            focusOnInput: false,
        })
    },
    // ListTouch计算方向
    ListTouchMove(e) {
        var shiftDisX = e.touches[0].pageX - this.data.ListTouchStartPosX
        var shiftDisY = e.touches[0].pageY - this.data.ListTouchStartPosY
        this.setData({
            ListTouchHDirection: shiftDisX < 0 ? 'right' : 'left',
            ListTouchVDirection: shiftDisY < 0 ? 'up' : 'down',
            shiftDisX: Math.abs(shiftDisX),
            shiftDisY: Math.abs(shiftDisY),
        })
        // show tip if top and pull down
        if (this.data.shiftDisY > 70 && this.data.scrollToTop
            && this.data.ListTouchVDirection == 'down') {
            this.setData({
                showTip: true,
                tipContent: 'hold',
            })
        } else {
            this.setData({
                showTip: false,
            })
        }
    },
    // ListTouch计算滚动
    ListTouchEnd(e) {
        const that = this
        var shiftDisY = this.data.shiftDisY
        var shiftDisX = this.data.shiftDisX
        var scrollToTop = this.data.scrollToTop
        var ListTouchVDirection = this.data.ListTouchVDirection
        if (shiftDisY > 70 && scrollToTop && ListTouchVDirection == 'down') {
            this.setData({
                showTip: true,
                tipContent: 'loading',
            })
            var messages = this.data.chatInfo.messages
            wx.cloud.callFunction({
                name: 'getAddChat',
                data: {
                    _chatid: that.data.chatid,
                    talkOID: that.data.talkOID,
                    selfOID: that.data.selfOID,
                    limit: globalData.chatLimit,
                    startPos: that.data.chatInfo.startPos,
                    endPos: that.data.chatInfo.endPos,
                },
                success: function(res) {
                    if (res.result.statusCode == 200) {
                        var nChatInfo = res.result.data
                        var chatInfo = that.data.chatInfo
                        var messages = chatInfo.messages
                        chatInfo = nChatInfo
                        chatInfo.messages = nChatInfo.messages.concat(messages)
                        globalData.chatMap.set(that.data.chatid,chatInfo)
                        that.setData({
                            chatInfo: chatInfo,
                        })
                    } else {
                        console.log("Get old messages failed!",res)
                    }
                },
                fail: function(err) {
                    console.log("Get old messages failed!Internal error!",err)
                },
                complete: function(res) {
                    that.setData({
                        showTip: false,
                    })
                }
            })
            this.scrollToTop()
        }
        this.setData({
            ListTouchHDirection: '',
            ListTouchVDirection: '',
            shiftDisX: 0,
            shiftDisY: 0,
        })
    },

    onLoad(option) {
        const that = this
        var likeInfo = JSON.parse(option.likeInfo)
        // genereate chatid
        var chatid = ''
        var talkOID = likeInfo._openid
        var talkName = likeInfo.nickName
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
                    _chatid: chatid,
                    talkOID: talkOID,
                    selfOID: selfOID,
                    limit: globalData.chatLimit,
                    startPos: -1,
                    endPos: 0,
                },
                success: function(res) {
                    if(res.result.statusCode == 200) {
                        chatInfo = res.result.data
                        globalData.chatMap.set(chatid, chatInfo)
                        that.setData({
                            chatInfo: chatInfo,
                            // orgChatInfo: orgChatInfo,
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
                        var cChatInfo = that.data.chatInfo
                        var nEndPos = nChatInfo.messages.length
                        var cEndPos = cChatInfo.endPos
                        if (nEndPos > cEndPos) {
                            var diffNum = nEndPos - cEndPos
                            var nMessages = nChatInfo.messages.slice(nEndPos-diffNum+1,nEndPos+1)
                            cChatInfo.messages.concat(nMessages)
                            cChatInfo.endPos = nEndPos
                            // get chat item height
                            if (that.data.chatMsgHeight == 0 && messages.length > 0) {
                                wx.createSelectorQuery().select('#chatid0').boundingClientRect(rect => {
                                    that.data.chatMsgHeight = rect.height
                                    that.setData({
                                        chatPos: that.data.chatPos + that.data.chatMsgHeight,
                                    })
                                }).exec()
                            } else {
                                that.setData({
                                    chatPos: that.data.chatPos + that.data.chatMsgHeight,
                                })
                            }
                            globalData.chatMap.set(that.data.chatid,cChatInfo)
                            that.setData({
                                chatInfo: cChatInfo,
                            })
                            // scroll to page bottom
                            // that.scrollToBottom()
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
            selfOID: selfOID,
            talkOID: talkOID,
            talkName: talkName,
            talkPortraitURL: talkPortraitURL,
            selfPortraitURL: globalData.userInfo.portraitURL,
            chatid: chatid,
            chatIntervalID: chatIntervalID,
        })
    },

    onPageScroll: function(e) {
        this.data.scrollTop = e.scrollTop
    },

    onUnload: function() {
        clearInterval(this.data.chatIntervalID)
    },
    onHide: function() {
        clearInterval(this.data.chatIntervalID)
    },
})