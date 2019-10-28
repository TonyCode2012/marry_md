const { stringHash } = require("../../../utils/util.js")
const app = getApp()
let {
    db,
    globalData
} = app

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        redirectPath: {
            type: String,
            value: '/pages/index/index'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },
    ready() {
        if (globalData.loginAsTourist) {
            this.checkAuthorize()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        checkAuthorize() {
            const that = this
            var redirectPath = that.data.redirectPath
            this.getOpenId().then(openid => {
                db.collection('users').where({
                    _openid: globalData.userInfo._openid
                }).get().then(
                    function (res) {
                        if (res.data.length === 0) {
                            redirectPath = escape(redirectPath)
                            wx.reLaunch({
                                url: `/pages/index/authorize/authorize?openid=${globalData.userInfo._openid}&path=${redirectPath}`,
                            })
                        } else {
                            globalData.userInfo = res.data[0]
                            globalData.userInfoHash = stringHash(JSON.stringify(res.data[0]))
                            globalData.loginAsTourist = false;
                            db.collection('nexus').where({
                                _openid: globalData.userInfo._openid
                            }).get().then(
                                function(res) {
                                    if(res.data.length == 0) {
                                        console.log("Get nexus info failed!")
                                    } else {
                                        globalData.nexusInfo = res.data[0]
                                        wx.reLaunch({
                                            url: redirectPath,
                                        })
                                    }
                                },
                                function(err) {
                                    console.log("Get nexus info failed! internal error!",err)
                                }
                            )
                        }
                    }),
                    function(err) {
                        console.log("Get user info failed!")
                    }
            });
        },
        getOpenId() {
            const openid = wx.getStorageSync('openid')
            if (openid) {
                console.log('openid from storage: ', openid)
                globalData.userInfo._openid = openid;
                return Promise.resolve(openid)
            }
            return wx.cloud.callFunction({
                name: 'login'
            }).then(res => {
                console.log('openid from cloud: ', res)
                const openid = res.result.openid;
                globalData.userInfo._openid = openid;
                wx.setStorage({
                    key: "openid",
                    data: openid
                })
                return openid
            })
        }
    }
})
