const observer = require("../../../utils/observer.js");
const app = getApp();

const {
    db,
    globalData
} = app


Component({
    options: {
        addGlobalClass: true,
    },
    /**
     * 组件的属性列表
     */
    properties: {
        seekers: Object,
        userIDs: Array,
        authed: Boolean,
    },

    /**
     * 组件的初始数据
     */
    data: {
        // move control
        ListTouchStartPosX: 0,
        ListTouchStartPosY: 0,
        ListTouchHDirection: '', 
        ListTouchVDirection: '',
        shiftDisX: 0,
        shiftDisY: 0,
        scrollToTop: true,

        isAuth: false,
        tabCur: 0,
        TabCurMax: 2,
        CustomBar: globalData.CustomBar,
        CustomHeight: globalData.CustomHeight,
        userIdx: 0,

        // control update data
        showTip: false,
        tipContent: '',
    },

    observers: {
    },

    pageLifetimes: {
        show: function() {
            if(globalData.nexusInfo.authed) {
                this.setData({
                    authed: true
                })
            }
        }
    },


    ready: function () {
        observer.observe(observer.store, 'isAuth', (value) => {
            this.setData({
                isAuth: value
            })
        })
    },

    /**
     * 组件的方法列表
     */
    methods: {

        getRelativeCandidates: function () {
            const that = this
            db.collection('network').where({
                _openid: globalData.userInfo._openid
            }).get({
                success: res => {
                    if(res.data.length == 0 || res.data[0].time == globalData.relativeGetTime) {
                        that.setData({
                            tipContent: 'over',
                        })
                        setTimeout(()=>{
                            that.setData({
                                showTip: false,
                            })
                        },1500)
                        // clear data
                        if(res.data.length == 0) {
                            that.setData({
                                seekers: [],
                            })
                            globalData.seekers = []
                            globalData.userMap = []
                        }
                        return
                    }
                    var paths = res.data[0]
                    var nt_relative = paths.nt_relative
                    var nt_colleague = paths.nt_colleague
                    var nt_company = paths.nt_company
                    var candidate2DArry = [nt_relative, nt_colleague, nt_company]
                    var ids = []
                    // generate request ids
                    for (var i in candidate2DArry) {
                        for (var openid of Object.keys(candidate2DArry[i])) {
                            ids.push({
                                _openid: openid
                            })
                        }
                    }
                    // deal with relations
                    for (var openid of Object.keys(nt_relative)) {
                        var relative = nt_relative[openid]
                        relative.relation.reverse()
                        for (var relation of relative.relation) {
                            if (relation.relationship) {
                                relation.relationship = that.data.relationMap[relation.relationship]
                            }
                        }
                    }
                    // get users from database
                    wx.cloud.callFunction({
                        name: 'getUserLInfo',
                        data: {
                            ids: ids
                        },
                        success: res => {
                            var users = res.result.data
                            var relativeCandidates = []
                            var colleagueCandidates = []
                            var companyCandidates = []
                            var userMap = new Map()
                            for (var user of users) {
                                if (nt_relative.hasOwnProperty(user._openid)) {
                                    user.relativeInfo = nt_relative[user._openid]
                                    relativeCandidates.push(user)
                                }
                                if (nt_colleague.hasOwnProperty(user._openid)) {
                                    colleagueCandidates.push(user)
                                }
                                if (nt_company.hasOwnProperty(user._openid)) {
                                    companyCandidates.push(user)
                                }
                                userMap.set(user._openid, user)
                            }
                            var data = {
                                relativeCandidates: relativeCandidates,
                                colleagueCandidates: colleagueCandidates,
                                companyCandidates: companyCandidates
                            }
                            that.setData({
                                seekers: data
                            })
                            globalData.seekers = data
                            globalData.userMap = userMap
                            globalData.relativeGetTime = paths.time
                            that.setData({
                                showTip: false,
                            })
                        },
                        fail: err => {
                            that.setData({
                                tipContent: 'neterr',
                            })
                            setTimeout(()=>{
                                that.setData({
                                    showTip: false,
                                })
                            },1500)
                            console.log(err)
                        },
                    })
                },
                fail: err => {
                    that.setData({
                        tipContent: 'neterr',
                    })
                    setTimeout(()=>{
                        that.setData({
                            showTip: false,
                        })
                    },1500)
                    console.log(err)
                },
            })
        },


        tabSelect(e) {
            this.setData({
                tabCur: e.currentTarget.dataset.id,
                scrollLeft: (e.currentTarget.dataset.id - 1) * 60
            })
        },
        userChange(e) {
            var index = e.detail.index
            this.setData({
                userIdx: index
            })
            var openid = this.properties.userIDs[index]
            openid = openid.substring(openid.indexOf(':') + 1, openid.length)
            this.triggerEvent('selectUser', { openid: openid })
        },
        
        // ListTouch触摸开始
        ListTouchStart(e) {
            this.setData({
                ListTouchStartPosX: e.touches[0].pageX,
                ListTouchStartPosY: e.touches[0].pageY,
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
            var shiftDisY = this.data.shiftDisY
            var shiftDisX = this.data.shiftDisX
            var scrollToTop = this.data.scrollToTop
            var ListTouchVDirection = this.data.ListTouchVDirection
            if (shiftDisY < 50 && shiftDisX > 50) {
                var hDirection = this.data.ListTouchHDirection
                var tabCur = this.data.tabCur
                if (hDirection == 'right') {
                    if (tabCur < this.data.TabCurMax) {
                        tabCur++
                    } else {
                        tabCur = this.data.TabCurMax
                    }
                } else {
                    if (tabCur > 0) {
                        tabCur--
                    } else {
                        tabCur = 0
                    }
                }
                this.setData({
                    tabCur: tabCur,
                })
            } else {
                if (shiftDisY > 70 && scrollToTop && ListTouchVDirection == 'down') {
                    this.setData({
                        showTip: true,
                        tipContent: 'loading',
                    })
                    this.getRelativeCandidates()
                }
            }
            this.setData({
                ListTouchHDirection: '',
                ListTouchVDirection: '',
                shiftDisX: 0,
                shiftDisY: 0,
            })
        },

        scrollChange(e) {
            this.setData({
                scrollToTop: e.detail.scrollTop == 0 ? true : false
            })
            // console.log("move to ",this.data.scrollToTop ? "up" : "down")
        },
    }
})
