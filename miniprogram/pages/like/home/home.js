// pages/like/home/home.js
const { stringHash } = require("../../../utils/util.js");
const app = getApp()
const {
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
        // match_info: {
        //   type: Object,
        //   value: {}
        // },
        userInfo: {
            type: Object,
            value: {}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        TabCur: 0,
        scrollLeft: 0,
        modalName: '',
        decision: 'pending',
        ListTouchStartPos: 0,
        ListTouchDirection: '',
        // tab set
        tabs: {
            ilike: '我想认识',
            likeme:'想认识我'
        },
        //match_info: {},
        matchInfoHash: "",

        seekerWechat: "",
        //userInfo: {}

        // set tags
        tags: {
            ilike: 0,
            likeme: 0
        },
    },

    observers: {
        'userInfo': function (data) {
            const that = this
            // set tags
            that.setData({
                tags: globalData.tags
            })
            // set match info
            if (this.data.userInfo.match_info == undefined) return
            var matchInfo = this.data.userInfo.match_info
            var types = ['ilike', 'likeme']
            var ilikeMap = new Map()
            var likemeMap = new Map()
            var maps = [ilikeMap, likemeMap]
            for (var tid in types) {
                var likeInfo = matchInfo[types[tid]]
                var tmpMap = maps[tid]
                for (var i in likeInfo) {
                    var item = likeInfo[i]
                    var portraitURL = item.portraitURL
                    if (portraitURL == undefined || portraitURL.indexOf("http") != -1) continue
                    var tmpArry = []
                    if (tmpMap.get(portraitURL) != undefined) {
                        tmpArry = tmpMap.get(portraitURL)
                    }
                    tmpArry.push(i)
                    tmpMap.set(portraitURL, tmpArry)
                }
            }
            if (ilikeMap.size + likemeMap.size == 0) return
            wx.cloud.getTempFileURL({
                fileList: Array.from(ilikeMap.keys()).concat(Array.from(likemeMap.keys())),
                success: res => {
                    // fileList 是一个有如下结构的对象数组
                    // [{
                    //    fileID: 'cloud://xxx.png', // 文件 ID
                    //    tempFileURL: '', // 临时文件网络链接
                    //    maxAge: 120 * 60 * 1000, // 有效期
                    // }]
                    for (var el of res.fileList) {
                        for (var i in maps) {
                            var tmpMap = maps[i]
                            var likeInfo = matchInfo[types[i]]
                            if (tmpMap.get(el.fileID) == undefined) continue
                            tmpMap.get(el.fileID).forEach(function (id) {
                                likeInfo[id].portraitURL = el.tempFileURL
                            })
                        }
                    }
                    that.setData({
                        'userInfo.match_info': matchInfo
                    })
                    // don't save tmp file url to globalData
                    //globalData.userInfo.match_info = matchInfo
                },
                fail: console.error
            })
        }
    },

    pageLifetimes: {
        show: function () {
            if (globalData.isLogin) {
                var matchInfoHash = stringHash(JSON.stringify(globalData.userInfo))
                if (matchInfoHash != this.data.matchInfoHash) {
                    this.data.matchInfoHash = matchInfoHash
                    this.setData({
                        userInfo: globalData.userInfo
                    })
                }
            }
        }
    },

    ready: function () {
    },

    /**
     * 组件的方法列表
     */
    methods: {
        tabSelect(e) {
            this.setData({
                TabCur: e.currentTarget.dataset.id,
                scrollLeft: (e.currentTarget.dataset.id - 1) * 60
            })
        },
        gotoUserDetail(e) {
            //const user = e.currentTarget.dataset.user
            const openid = e.currentTarget.dataset.openid
            wx.navigateTo({
                url: `/pages/member/detail/detail?openid=${openid}`,
            })
        },
        hideModal() {
            this.setData({
                modalName: null
            })
        },
        showModal(e) {
            this.setData({
                modalName: 'weixinModal',
                seekerWechat: e.currentTarget.dataset.wechat
            })
            return false;
        },
        clip() {
            wx.setClipboardData({
                data: this.data.seekerWechat,
                success(res) {
                    wx.getClipboardData({
                        success(res) {
                            console.log(res.data) // data
                        }
                    })
                }
            })
        },

        decide(e) {
            const that = this
            let index = e.currentTarget.dataset.index
            const decision = e.currentTarget.dataset.decision
            this.data.userInfo.match_info.likeme[index].decision = decision;
            wx.cloud.callFunction({
                name: 'likeAction_decide',
                data: {
                    table: 'users',
                    likefrom_openid: this.data.userInfo.match_info.likeme[index]._openid,
                    liketo_openid: this.data.userInfo._openid,
                    decision: decision
                },
                success: res => {
                    if (res.result.statuscode == 200) {
                        that.setData({
                            userInfo: this.data.userInfo
                            // match_info: that.data.match_info
                        })
                    }
                    console.log(res)
                },
                fail: res => {
                    console.log(res)
                }
            })
        },
        _deleteLike: function (para) {
            const that = this
            wx.showLoading({
                title: '正在删除',
            })
            wx.cloud.callFunction({
                name: 'likeAction_delete',
                data: {
                    table: 'users',
                    delItem: para.delItem,
                    ilike: {
                        myOpenid: para.ilike.fromOpenid,
                        hhOpenid: para.ilike.toOpenid
                    },
                    likeme: {
                        myOpenid: para.likeme.fromOpenid,
                        hhOpenid: para.likeme.toOpenid
                    }
                },
                success: res => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 2000
                    })
                    console.log("delete " + para.delItem + " item successfully!" + JSON.stringify(res))
                    that.setData({
                        userInfo: para.userInfo
                    })
                    globalData.userInfo = para.userInfo
                    // update father page data
                    var param = { userInfo: globalData.userInfo }
                    that.triggerEvent('userInfoChange', param)
                },
                fail: res => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '删除失败',
                        icon: 'none',
                        duration: 2000
                    })
                    console.log(res)
                }
            })
        },
        deleteILike(e) {
            let ilikeItem = (this.data.userInfo.match_info.ilike.splice(e.currentTarget.dataset.index, 1))[0]
            let para = {
                delItem: 'ilike',
                ilike: {
                    fromOpenid: this.data.userInfo._openid,
                    toOpenid: ilikeItem._openid
                },
                likeme: {
                    fromOpenid: ilikeItem._openid,
                    toOpenid: this.data.userInfo._openid
                },
                userInfo: this.data.userInfo,
                that: this
            }
            //this.data.methods._deleteLike(data)
            this._deleteLike(para)
        },
        deleteLikeMe(e) {
            let likemeItem = (this.data.userInfo.match_info.likeme.splice(e.currentTarget.dataset.index, 1))[0]
            let para = {
                delItem: 'likeme',
                ilike: {
                    fromOpenid: likemeItem._openid,
                    toOpenid: this.data.userInfo._openid
                },
                likeme: {
                    fromOpenid: this.data.userInfo._openid,
                    toOpenid: likemeItem._openid
                },
                userInfo: this.data.userInfo,
                that: this
            }
            //this.data.methods._deleteLike(data)
            this._deleteLike(para)
        },

        // ListTouch触摸开始
        ListTouchStart(e) {
            this.setData({
                ListTouchStartPos: e.touches[0].pageX
            })
            var index = e.currentTarget.dataset.index
            var tag = e.currentTarget.dataset.tag
            var item = globalData.userInfo.match_info[tag][index]
            if(!item.checked) {
                item.checked = true
                globalData.tags[tag]--
                wx.cloud.callFunction({
                    name: 'dbupdate',
                    data: {
                        table: 'users',
                        _openid: globalData.userInfo._openid,
                        data: {
                            ['match_info.' + tag + '']: globalData.userInfo.match_info[tag]
                        }
                    },
                    success: res=> {
                        console.log("Update check successfully!")
                    },
                    fail: err=> {
                        console.log("Update check failed!")
                    }
                })
                this.setData({
                    ['tags.' + tag]: globalData.tags[tag]
                })
                // update father page data
                var param = { key: 'tags' }
                this.triggerEvent('globalDataChange', param)
            }
        },

        // ListTouch计算方向
        ListTouchMove(e) {
            this.setData({
                ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStartPos > -100 ? 'right' : 'left'
            })
        },
        // ListTouch计算滚动
        ListTouchEnd(e) {
            if (this.data.ListTouchDirection == 'left') {
                this.setData({
                    modalName: e.currentTarget.dataset.target
                })
            } else {
                this.setData({
                    modalName: null
                })
            }
            this.setData({
                ListTouchDirection: null
            })
        },

        // get relation
        getRelation(e) {
            wx.showLoading({
                title: '正在处理',
            })
            wx.cloud.callFunction({
                name: 'getRelativeCandidates',
                data: {
                    tag: 'test'
                },
                complete: res => {
                    wx.hideLoading()
                }
            })
        }
    }
})
