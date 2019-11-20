const app = getApp()
const {
    db,
    globalData
} = app
const { 
    getChatID,
    delay,
} = require("../../utils/util.js");
const _ = db.command

Page({
    data: {
        // basic info
        orgChatInfo: {},
        chatInfo: {},
        talkOID: '',
        talkPortraitURL: '',
        selfPortraitURL: '',
        text: '',
        chatid: '',
        chatIntervalID: 0,
        chatBoxPosVal: 0,
        chatMsgHeight: 0,
        scrollTop: 1,
        likeInfo: {},
        // position control
        InputBottom: 0,
        CustomBar: globalData.CustomBar,
        focusOnInput: false,
        holdKeyBoard: true,
        chatBoxTop: 0,
        chatBoxPos: 'bottom',
        showedScreen: 0,
        displayScreen: 0,
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
        isLeaveMsg: false,
    },


    watch: {
        chatInfo: function (data, that) {
            if(that.data.chatMsgHeight >0) return
            if (that.data.chatInfo.messages.length > 0) {
                setTimeout(res => {
                wx.createSelectorQuery().select('#chatid0').boundingClientRect(rect => {
                    that.setData({
                        chatMsgHeight: rect.height
                    })
                }).exec()},500)
            }
        },
    },

    InputFocus(e) {
        const that = this
        console.log("changed:", e.detail.height)
        var InputBottom = e.detail.height
        that.setData({
            InputBottom: InputBottom,
        }, function (res) {
                // that.adjustMsgPos({
                //     focusOnInput: true,
                //     showedScreen: that.data.showedScreen - InputBottom,
                // })
                // that.scrollToBottom()
                setTimeout(res=>{
                    var allMsgHeight = that.data.chatInfo.messages.length * 
                                        that.data.chatMsgHeight
                    var showedScreen = that.data.showedScreen - InputBottom
                    var chatBoxPos = 'bottom'
                    var chatBoxPosVal = 0
                    var chatMsgHeight = that.data.chatMsgHeight
                    if (allMsgHeight > showedScreen + InputBottom) {
                        // show bottom
                        that.scrollToBottom()
                    } else {
                        // show top
                        chatBoxPos = 'top'
                        if (allMsgHeight > showedScreen) {
                            chatBoxPosVal = InputBottom - (allMsgHeight - showedScreen)
                        } else {
                            chatBoxPosVal = InputBottom
                        }
                        // if(allMsgHeight < showedScreen) {
                        //     chatBoxPos = 'top'
                        //     chatBoxPosVal = InputBottom
                        // } else {
                        //     that.scrollToBottom()
                        // }
                    }
                    that.setData({
                        chatBoxPos: chatBoxPos,
                        chatBoxPosVal: chatBoxPosVal,
                        focusOnInput: true,
                        showedScreen: showedScreen,
                    })
                },500)
            }
        )
    },
    InputBlur(e) {
        var showedScreen = this.data.showedScreen + this.data.InputBottom
        this.setData({
            InputBottom: 0,
            chatBoxPos: 'bottom',
            chatBoxPosVal: 0,
            chatBoxTop: 0,
            showedScreen: showedScreen,
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


    /*
     * used to adjust message position
     */
    adjustMsgPos(data) {
        const that = this
        if(that.data.isLeaveMsg) return
        var waitTime = 600
        if (that.data.chatMsgHeight > 0) waitTime = 0
        setTimeout(res => {
            var chatMsgHeight = that.data.chatMsgHeight
            var allMsgHeight = that.data.chatInfo.messages.length * chatMsgHeight
            var chatBoxPos = that.data.chatBoxPos
            var chatBoxPosVal = that.data.chatBoxPosVal
            var showedScreen = that.data.showedScreen
            var InputBottom = that.data.InputBottom
            if (allMsgHeight > showedScreen + InputBottom) {
                chatBoxPos = 'bottom'
                chatBoxPosVal += chatMsgHeight
            } else {
                chatBoxPos = 'top'
                if (allMsgHeight > showedScreen) {
                    chatBoxPosVal -= chatMsgHeight
                    if (chatBoxPosVal <= chatMsgHeight) chatBoxPosVal = 0
                } else {
                    chatBoxPosVal = InputBottom
                }
            }
            var posData = {
                chatBoxPos: chatBoxPos,
                chatBoxPosVal: chatBoxPosVal,
            }
            if(data) {
                for(var key of Object.keys(posData)) {
                    data[key] = posData[key]
                }
            } else {
                data = posData
            }
            that.setData(data)
        }, waitTime)
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
        if(!messages) messages = []
        messages.push(message)
        that.data.chatInfo.endPos++
        globalData.chatMap.set(that.data.chatid,that.data.chatInfo)
        that.setData({
            chatInfo: that.data.chatInfo,
            text: '',
        },function (res) {
            that.adjustMsgPos()
            // var waitTime = 600
            // if(that.data.chatMsgHeight > 0) waitTime = 0
            // setTimeout(res => {
            // var chatMsgHeight = that.data.chatMsgHeight
            // var allMsgHeight = messages.length * chatMsgHeight
            // var chatBoxPos = that.data.chatBoxPos
            // var chatBoxPosVal = that.data.chatBoxPosVal
            // var showedScreen = that.data.showedScreen
            // var InputBottom = that.data.InputBottom
            // if (allMsgHeight > showedScreen + InputBottom) {
            //     chatBoxPos = 'bottom'
            //     chatBoxPosVal += chatMsgHeight
            // } else {
            //     chatBoxPos = 'top'
            //     if (allMsgHeight > showedScreen) {
            //         chatBoxPosVal -= chatMsgHeight
            //         if (chatBoxPosVal <= chatMsgHeight) chatBoxPosVal = 0
            //     } else {
            //         chatBoxPosVal = InputBottom
            //     }
            // }
            // that.setData({
            //     chatBoxPos: chatBoxPos,
            //     chatBoxPosVal: chatBoxPosVal,
            // })},waitTime)
        })
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
    decide(e) {
        const that = this
        const decision = e.currentTarget.dataset.decision
        var likeInfo = that.data.likeInfo
        const index = likeInfo.index
        const tag = likeInfo.tag
        likeInfo.decision = decision
        wx.cloud.callFunction({
            name: 'likeAction_decide',
            data: {
                table: 'users',
                likefrom_openid: likeInfo._openid,
                liketo_openid: globalData.userInfo._openid,
                decision: decision
            },
            success: res => {
                if (res.result.statuscode == 200) {
                    globalData.userInfo.match_info[tag][index] = likeInfo
                    that.setData({
                        'likeInfo.decision': decision,
                        isLeaveMsg: decision != 'yes',
                    },function(res) {
                        if(decision != 'yes') return
                        setTimeout(res => {
                            wx.createSelectorQuery().select('#inputBox').
                            boundingClientRect(rect => {
                                var showedScreen = that.data.showedScreen
                                var displayScreen = showedScreen
                                if (rect) {
                                    showedScreen -= rect.height
                                }
                                that.setData({
                                    showedScreen: showedScreen,
                                    displayScreen: displayScreen,
                                })
                        }).exec(), 500})
                    })
                }
                console.log(res)
            },
            fail: res => {
                console.log(res)
            }
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
        var shiftDisY = that.data.shiftDisY
        var shiftDisX = that.data.shiftDisX
        var scrollToTop = that.data.scrollToTop
        var ListTouchVDirection = that.data.ListTouchVDirection
        if (shiftDisY > 70 && scrollToTop && ListTouchVDirection == 'down') {
            that.setData({
                showTip: true,
                tipContent: 'loading',
            })
            // var messages = this.data.chatInfo.messages
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
                        if (nChatInfo.messages.length == 0) {
                            that.setData({
                                tipContent: 'over',
                            })
                            return
                        }
                        chatInfo = nChatInfo
                        chatInfo.messages = nChatInfo.messages.concat(messages)
                        globalData.chatMap.set(that.data.chatid,chatInfo)
                        that.setData({
                            chatInfo: chatInfo,
                        })
                        that.scrollToTop()
                    } else {
                        console.log("Get old messages failed!",res)
                    }
                },
                fail: function(err) {
                    console.log("Get old messages failed!Internal error!",err)
                },
                complete: function(res) {
                    setTimeout(res => {
                    that.setData({
                        showTip: false,
                    })},1000)
                }
            })
        }
        that.setData({
            ListTouchHDirection: '',
            ListTouchVDirection: '',
            shiftDisX: 0,
            shiftDisY: 0,
        })
    },

    // get new messages
    checkNewMessages() {
        const that = this
        // check if there is a update every 3 seconds
        return setInterval(function (res) {
            // check if agreed
            if (that.data.likeInfo.decision != 'yes') {
                db.collection('users').where({
                    _openid: globalData.userInfo._openid
                }).get().then(
                    function (res) {
                        if (res.data.length == 0) {
                            console.log("Get user info failed!", res)
                            return
                        }
                        var ilikeInfo = res.data[0].match_info.ilike
                        for (var index in ilikeInfo) {
                            var item = ilikeInfo[index]
                            if (item._openid == that.data.talkOID && item.decision == 'yes') {
                                globalData.userInfo.match_info['ilike'][index].decision = 'yes'
                                that.setData({
                                    isLeaveMsg: false,
                                    'likeInfo.decision': 'yes',
                                },function(res) {
                                    setTimeout(res => {
                                    wx.createSelectorQuery().select('#inputBox').
                                    boundingClientRect(rect => {
                                        var showedScreen = that.data.showedScreen
                                        var displayScreen = showedScreen
                                        if (rect) {
                                            showedScreen -= rect.height
                                        }
                                        that.setData({
                                            showedScreen: showedScreen,
                                            displayScreen: displayScreen,
                                        })
                                    }).exec(),500})
                                })
                                break
                            }
                        }
                    },
                    function(err) {
                        console.log("Get user info failed!Internal error!",err)
                    }
                )
            }
            db.collection('chat').where({
                _chatid: that.data.chatid
            }).get({
                success: function (res) {
                    console.log("Coming to check update,ID:", that.data.chatIntervalID)
                    if (res.data.length != 0) {
                        var nChatInfo = res.data[0]
                        var cChatInfo = that.data.chatInfo
                        var nEndPos = nChatInfo.messages.length
                        var cEndPos = cChatInfo.endPos
                        var fMessaegs = cChatInfo.messages
                        var talkOID = that.data.talkOID
                        var needDBUpdate = false
                        var needPGUpdate = false
                        var messageChanged = false
                        // update messages
                        if (nEndPos > cEndPos) {
                            // if get new messages, update
                            var diffNum = nEndPos - cEndPos
                            var nMessages = nChatInfo.messages.slice(nEndPos - diffNum, nEndPos)
                            cChatInfo.messages = cChatInfo.messages.concat(nMessages)
                            cChatInfo.endPos = nEndPos
                            globalData.chatMap.set(that.data.chatid, cChatInfo)
                            fMessaegs = cChatInfo.messages
                            messageChanged = true
                        } else {
                            fMessaegs = nChatInfo.messages
                        }
                        // update check status
                        for (var msg of fMessaegs) {
                            if (msg._openid == talkOID) {
                                if (!msg.checked) {
                                    msg.checked = true
                                    needDBUpdate = true
                                }
                            } else if (!needPGUpdate && msg.checked) {
                                needPGUpdate = true
                            }
                        }
                        cChatInfo.messages = fMessaegs
                        // update db check status
                        if (needDBUpdate) {
                            wx.cloud.callFunction({
                                name: 'dbupdate',
                                data: {
                                    table: 'chat',
                                    idKey: '_chatid',
                                    idVal: that.data.chatid,
                                    data: {
                                        messages: fMessaegs,
                                    }
                                },
                                success: function (res) {
                                    console.log("Update read status succesfully!", res)
                                },
                                fail: function (err) {
                                    console.log("Update read status failed!", err)
                                }
                            })
                        }
                        // update page messaget status
                        if (needPGUpdate || messageChanged) {
                            that.setData({
                                chatInfo: cChatInfo,
                            }, function (res) {
                                if (messageChanged) {
                                    if (that.data.InputBottom == 0) {
                                        that.scrollToBottom()
                                        return
                                    }
                                    that.adjustMsgPos()
                                }
                            })
                        }
                    } else {
                        console.log("Check chat update failed!", res)
                    }
                },
                fail: function (err) {
                    console.log("Check chat update failed!Internal error!", err)
                }
            })
        }, 2000)
    },

    onLoad(option) {
        const that = this
        var dataInfo = JSON.parse(option.likeInfo)
        var likeInfo = dataInfo.likeInfo
        likeInfo.tag = dataInfo.tag
        likeInfo.index = dataInfo.index
        // set watcher
        app.setWatcher(this.data, this.watch, this)
        // genereate chatid
        var talkOID = likeInfo._openid
        var selfOID = globalData.userInfo._openid
        var chatid = getChatID({
            talkOID: talkOID,
            selfOID: selfOID,
        })
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
                            isLeaveMsg: likeInfo.decision != 'yes',
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
                isLeaveMsg: likeInfo.decision != 'yes',
            })
            // that.adjustMsgPos()
            // scroll to page bottom
            that.scrollToBottom()
        }
        // check new messages
        var chatIntervalID = that.checkNewMessages()
        this.setData({
            selfOID: selfOID,
            talkOID: talkOID,
            talkPortraitURL: talkPortraitURL,
            selfPortraitURL: globalData.userInfo.portraitURL,
            chatid: chatid,
            chatIntervalID: chatIntervalID,
            likeInfo: likeInfo,
        })
    },

    onShow: function(e) {
        // showedScreen
        const that = this
        var showedScreen = globalData.CustomHeight - globalData.CustomBar
        wx.createSelectorQuery().select('#inputBox').boundingClientRect(rect => {
            var displayScreen = showedScreen
            if(rect) {
                showedScreen -= rect.height
            }
            that.setData({
                showedScreen: showedScreen,
                displayScreen: displayScreen,
            })
        }).exec()
        // check new messages
        if (that.data.chatIntervalID == -1) {
            that.setData({
                chatIntervalID: that.checkNewMessages()
            })
        }
    },

    onPageScroll: function(e) {
        this.data.scrollTop = e.scrollTop
    },

    onUnload: function() {
        clearInterval(this.data.chatIntervalID)
        this.setData({
            chatIntervalID: -1,
        })
    },
    onHide: function() {
        clearInterval(this.data.chatIntervalID)
        this.setData({
            chatIntervalID: -1,
        })
    },
})