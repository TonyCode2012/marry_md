// pages/mine/home/home.js
const { aboutme } = require("../../../utils/data.js");
const { 
    stringHash,
    showWechatAuthInfo,
} = require("../../../utils/util.js");
const app = getApp()
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
        userInfo: Object,
        completePercent: Number,
    },

    /**
     * 组件的初始数据
     */
    data: {
        authed: false,
        loginAsTourist: globalData.loginAsTourist,
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom,
        isExpand: false,
        userInfo: null,
        portraitURL: "",

        // check data change by hashcode
        globalUserHash: "",
        hashCode: {
            expect_info: '',
            love_info: '',
        }
    },

    observers: {
        'userInfo': function (data) {
            const that = this
            const userInfo = this.data.userInfo
            if (data.love_info == undefined || data.love_info == '') return
            let hashCode = stringHash(JSON.stringify(data.love_info))
            // if hashcode is changed, update
            if (hashCode != this.data.hashCode.love_info) {
                let love_info = data.love_info
                let completePercent = 0
                for (let i = 0; i < aboutme.listItem.length; i++) {
                    var loveInfo_item = love_info[aboutme.listItem[i].type]
                    if (loveInfo_item != undefined && loveInfo_item.content != '') {
                        completePercent++
                    }
                }
                completePercent = parseInt(completePercent / aboutme.listItem.length * 100)
                this.setData({
                    completePercent: completePercent,
                    "hashCode.love_info": hashCode,
                })
            }
            // get user auth info
            that.setData({
                authed: globalData.nexusInfo.authed
            })
            // add user head portrait
            var portraitURL = ""
            if (userInfo.photos.length != 0) {
                portraitURL = userInfo.photos[0]
                wx.cloud.getTempFileURL({
                    fileList: [portraitURL],
                    success: res => {
                        // fileList 是一个有如下结构的对象数组
                        // [{
                        //    fileID: 'cloud://xxx.png', // 文件 ID
                        //    tempFileURL: '', // 临时文件网络链接
                        //    maxAge: 120 * 60 * 1000, // 有效期
                        // }]
                        portraitURL = res.fileList[0].tempFileURL
                        globalData.userInfo.portraitURL = portraitURL
                        that.setData({
                            portraitURL: portraitURL
                        })
                        console.log(res.fileList)
                    },
                    fail: console.error
                })
            } else if (userInfo.wechat_info.avatarUrl != undefined) {
                portraitURL = userInfo.wechat_info.avatarUrl
                globalData.userInfo.portraitURL = portraitURL
                that.setData({
                    portraitURL: portraitURL
                })
            } else {
                console.log("Set portrait failed!")
            }
        }
    },

    pageLifetimes: {
        show: function () {
            // monitor global userInfo change
            var globalUserHash = stringHash(JSON.stringify(globalData.userInfo))
            if (this.data.globalUserHash != globalUserHash) {
                if (!globalData.loginAsTourist) {
                    this.setData({
                        userInfo: globalData.userInfo,
                        authed: globalData.nexusInfo.authed,
                        globalUserHash: globalUserHash,
                        loginAsTourist: globalData.loginAsTourist,
                    })
                }
            }
        }
    },

    ready: function () {
        console.log(globalData.userInfo)
    },

    /**
     * 组件的方法列表
     */
    methods: {

        go2CheckAuth() {
            wx.navigateTo({
                url: '/pages/index/loading/loading',
            })
        },

        toggleExpand() {
            this.setData({
                isExpand: !this.data.isExpand
            })
        },
        gotoProfile() {
            if (globalData.loginAsTourist) {
                showWechatAuthInfo()
                // wx.showModal({
                //     title: '提示',
                //     content: '不授权微信登录将无法建立账号编辑信息',
                //     confirmText: '前去授权',
                //     cancelText: '暂不登录',
                //     success(res) {
                //         if (res.confirm) {
                //             wx.redirectTo({
                //                 url: '/pages/index/loading/loading',
                //             })
                //         }
                //     }
                // })
            } else {
                wx.navigateTo({
                    url: '/pages/mine/profile/profile',
                })
            }
        },
        gotoExpect() {
            if (globalData.loginAsTourist) {
                showWechatAuthInfo()
                // wx.showModal({
                //     title: '提示',
                //     content: '不授权微信登录将无法建立账号编辑信息',
                //     confirmText: '前去授权',
                //     cancelText: '暂不登录',
                //     success(res) {
                //         if (res.confirm) {
                //             wx.redirectTo({
                //                 url: '/pages/index/loading/loading',
                //             })
                //         }
                //     }
                // })
            } else {
                wx.navigateTo({
                    url: '/pages/mine/expect/expect',
                })
            }
        },
    }
})
