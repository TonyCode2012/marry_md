const { stringHash } = require("../../../utils/util.js");
const app = getApp()
let {
    db,
    globalData
} = app
let relationData = []

Component({
    options: {
        addGlobalClass: true,
    },
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        redirectPath: '/pages/member/detail/detail',
        source: 'meet',
        loginAsTourist: globalData.loginAsTourist,
        showWAuthed: globalData.showWAuthed,
        existed: true,
        canLike: false,
        // relation related
        _openid: '',
        showModal: '',
        relationship: "",
        relations: false,
        relationArry: ['请选择你和介绍人的关系', '亲戚', '同事', '朋友', '同学', '其他'],
        relationRArry: ['unknown', 'family', 'colleague', 'friend', 'schoolmate', 'other'],
        relationIndex: 0,
        ship: true,
        array: ['请选择你和介绍人的关系', '朋友', '同学', '亲戚', '同事'],
        index: 0,
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom,
        basic_item: [
            "birthday",
            "college",
            "company",
            "education",
            "gender",
            "height",
            "weight",
            "hometown",
            "location",
            "nickName",
            "profession",
            "wechat",
        ],

        userInfo: {},
        likeTag: "感兴趣",
        showLike: true,

        userIdx: 0,
        userIDs: [],

        avatar: [
            'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg',
            'https://ossweb-img.qq.com/images/lol/web201310/skin/big81005.jpg',
            'https://ossweb-img.qq.com/images/lol/web201310/skin/big25002.jpg',
            'https://ossweb-img.qq.com/images/lol/web201310/skin/big91012.jpg'
        ],

        relativePortraitHash: "",

    },

    observers: {
        'userInfo': function (data) {
        },
        'userInfo.relativeInfo.relation': function(data) {
            const that = this
            // set relative info portraitURL
            if (this.data.userInfo.relativeInfo == undefined) return
            var tmpHash = stringHash(JSON.stringify(this.data.userInfo.relativeInfo))
            if (tmpHash != this.data.relativePortraitHash) {
                this.data.relativePortraitHash = tmpHash
                //var relations = this.data.userInfo.relativeInfo.relation
                var relations = data
                var tmpMap = new Map()
                for (var i in relations) {
                    var relation = relations[i]
                    var portraitURL = relation.portraitURL
                    if (portraitURL != undefined && portraitURL.indexOf("http") == -1) {
                        var tmpArry = []
                        if (tmpMap.get(portraitURL) != undefined) {
                            tmpArry = tmpMap.get(portraitURL)
                        }
                        tmpArry.push(i)
                        tmpMap.set(portraitURL, tmpArry)
                    }
                }
                if (tmpMap.size == 0) return
                wx.cloud.getTempFileURL({
                    fileList: Array.from(tmpMap.keys()),
                    success: res => {
                        // fileList 是一个有如下结构的对象数组
                        // [{
                        //    fileID: 'cloud://xxx.png', // 文件 ID
                        //    tempFileURL: '', // 临时文件网络链接
                        //    maxAge: 120 * 60 * 1000, // 有效期
                        // }]
                        res.fileList.forEach(function (el) {
                            if (tmpMap.get(el.fileID) == undefined) return
                            tmpMap.get(el.fileID).forEach(function (id) {
                                relations[id].portraitURL = el.tempFileURL
                            })
                        })
                        that.setData({
                            'userInfo.relativeInfo.relation': relations
                        })
                    },
                    fail: console.error
                })
            }
        }
    },


    /**
     * 组件的方法列表
     */
    methods: {
        chooseRelation: function (e) {
            const that = this
            var index = e.currentTarget.dataset.index
            var relationship = that.data.relationRArry[index]
            if(index == 0) return
            that.setData({
                showModal: '',
            })
            wx.cloud.callFunction({
                name: 'updateRelation',
                data: {
                    to_openid: that.data._openid,
                    from_openid: globalData.userInfo._openid,
                    relationship: relationship,
                },
                success: res => {
                    var resData = res.result
                    if (resData.statusCode == 200) {
                        globalData.nexusInfo.friends = resData.friends
                        console.log("update relation successfully!", res)
                    } else {
                        console.log("Update relation failed!", res)
                    }
                },
                fail: err => {
                    console.log("update relation failed!Internal error!", err)
                }
            })
        },
        share2Friend: function (e) {
            const that = this
            var openid = e.detail.index
            openid = this.data.userIDs[openid]
            openid = openid.substring(openid.indexOf(':') + 1, openid.length)
            // this.chooseRelation(openid)
        },

        onLoad: async function (options) {
            const that = this
            // check if login and show the wechat authorized page
            // if not redirect to authorized page
            if (globalData.loginAsTourist && !globalData.showWAuthed) {
                if (options.sopenid == undefined || options.topenid == undefined) {
                    console.log("shared parameter error!")
                } else {
                    var redirectPath = that.data.redirectPath + '?sopenid=' + options.sopenid + '&topenid=' + options.topenid
                    redirectPath = escape(redirectPath)
                    wx.reLaunch({
                        url: `/pages/index/loading/loading?redirectPath=${redirectPath}`,
                    })
                }
                return
            }
            const { source } = options;
            const _ = db.command
            var userInfo = null
            var userOID = null

            // enter from share mini card
            if (options.sopenid != undefined) {
                userOID = options.topenid
                that.data._openid = userOID
                console.log("enter from mini card,scene is",globalData.scene)
                console.log("is got from group:",globalData.getFromGroup?'yes':'no')
                // show user info by clicking mini card
                // if get the mini card from group, assume not a friend
                if (!globalData.getFromGroup && !globalData.loginAsTourist 
                    && options.sopenid != globalData.userInfo._openid 
                    && !globalData.nexusInfo.friends.hasOwnProperty(userOID)) {
                    that.setData({
                        showModal: 'show',
                    })
                    console.log("loginastourist", globalData.loginAsTourist ? 'true' : 'false')
                    console.log("sopenid:", options.sopenid, "_openid:", globalData.userInfo._openid)
                }
            } else {
                console.log("enter from main port")
                // show user info by clicking mini card
                if (!globalData.loginAsTourist) {
                    userInfo = globalData.userMap.get(options.openid)
                }
                userOID = options.openid
                // get user information
                that.setData({
                    userIDs: globalData.userIDs
                })
            }
            // check if resume is valid
            var isResumValid = await db.collection('nexus').where({
                _openid: userOID
            }).get().then(
                function(res) {
                    if(res.data.length != 0) {
                        var nexusInfo = res.data[0]
                        if(nexusInfo.authed && nexusInfo.completed) {
                            return true
                        }
                    }
                    console.log("Invalid resume!",res)
                    return false
                },
                function(err) {
                    console.log("Get resume nexus info failed!",err)
                    return false
                }
            )
            // get user info
            if(isResumValid) {
                if (userInfo == undefined) {
                    await db.collection('users').where({
                        _openid: userOID
                    }).get().then(
                        function (res) {
                            if (res.data.length > 0) {
                                userInfo = res.data[0]
                            } else {
                                console.log("Get user info failed! no user found!")
                            }
                        },
                        function (err) {
                            console.log("Get user info failed!" + err)
                        }
                    )
                }
                if (userInfo) {
                    this.setData({
                        userInfo: userInfo,
                    })
                    // if authorize wechat login
                    if(!globalData.loginAsTourist) {
                        // set show like tag
                        if (userInfo.basic_info.gender == globalData.userInfo.basic_info.gender) {
                            that.setData({
                                showLike: false
                            })
                        }
                        // check if this user info has been existed on the match list
                        var loginILike = globalData.userInfo.match_info.ilike
                        var loginLikeMe = globalData.userInfo.match_info.likeme
                        for (var i = 0; i < loginILike.length; i++) {
                            if (loginILike[i]._openid == userInfo._openid) {
                                this.setData({
                                    likeTag: "已感兴趣"
                                })
                                break
                            }
                        }
                        for (var i = 0; i < loginLikeMe.length; i++) {
                            if (loginLikeMe[i]._openid == userInfo._openid) {
                                this.setData({
                                    //likeTag: "对你感兴趣",
                                    likeTag: "想认识你",
                                })
                                break
                            }
                        }
                    }
                    // set relative portrait, async get
                    if (userInfo.relativeInfo != undefined) {
                        var relativeIDs = []
                        for (var item of userInfo.relativeInfo.relation) {
                            relativeIDs.push({
                                _openid: item._openid
                            })
                        }
                        db.collection('users').where(_.or(relativeIDs)).get({
                            success: function (res) {
                                var tmpMap = new Map()
                                for (var user of res.data) {
                                    tmpMap.set(user._openid, user)
                                }
                                for (var item of userInfo.relativeInfo.relation) {
                                    var user = tmpMap.get(item._openid)
                                    var portraitUrl = user.wechat_info.avatarUrl
                                    if (user.photos.length != 0) {
                                        portraitUrl = user.photos[0]
                                    }
                                    item.portraitURL = portraitUrl
                                }
                                that.setData({
                                    'userInfo.relativeInfo.relation': userInfo.relativeInfo.relation
                                })
                            },
                            fail: function (err) {
                                console.log("Set relative portraitUrl failed!")
                            }
                        })
                    }
                } else {
                    console.log("Get resume failed!Please check!")
                }
            }

            console.log('user detail', options, this.properties);
            console.log('userInfo', userInfo);
            this.setData({
                existed: (userInfo ? true : false) && isResumValid,
                userInfo: userInfo ? userInfo : {},
                //source: source,
                loginAsTourist: globalData.loginAsTourist,
                showWAuthed: globalData.showWAuthed,
            })
        },
        toHomePage: function () {
            wx.navigateBack({
                delta: 1,
                success: res => {
                    console.log("To home page")
                },
                fail: err => {
                    wx.reLaunch({
                        url: '/pages/index/index?cur=meet',
                    })
                }
            })
        },
        bindLike: async function () {
            const that = this
            if (this.data.likeTag != "感兴趣") return
            var latestNexus = await db.collection('nexus').where({
                _openid: globalData.userInfo._openid
            }).get().then(
                function(res) {
                    if(res.data.length != 0) {
                        return res.data[0]
                    } else {
                        console.log("Get nexus info failed!",res)
                    }
                },
                function(err) {
                    console.log(err)
                }
            )
            if (latestNexus && latestNexus.chance == 0) {
                wx.showToast({
                    title: '每天只有一次喜欢机会',
                    icon: 'none',
                    duration: 2000
                })
                return
            }
            // just ahthed and completed user can like
            if (!globalData.nexusInfo.authed || !globalData.nexusInfo.completed) {
                wx.showModal({
                    title: '提示',
                    content: '没有认证和完善资料无法发起感兴趣',
                    confirmText: '完善认证',
                    cancelText: '取消',
                    success(res) {
                        if (res.confirm) {
                            console.log('完善认证')
                            wx.navigateTo({
                                //url: '/pages/index/index?cur=mine',
                                // url: '/pages/mine/profile/profile',
                                url: '/pages/mine/home/home',
                            })
                        } else if (res.cancel) {
                            console.log('取消')
                            that.chooseRelation(openid)
                        }
                    }
                })
                return
            }
            wx.showModal({
                title: '提示',
                content: '每天只有一次发起喜欢的机会，确定是ta么?',
                confirmText: '发起喜欢',
                cancelText: '取消',
                success: function (res) {
                    if (res.confirm) {
                        that._doLike()
                    }
                }
            })
        },
        _doLike() {
            const that = this
            // create like info
            wx.showLoading({
                title: '正在处理',
            })
            let now = new Date()
            var basic_info_t = {}
            for (var item of this.data.basic_item) {
                basic_info_t[item] = this.data.userInfo.basic_info[item]
            }
            var portraitURL = ""
            if (this.data.userInfo.photos.length != 0) {
                portraitURL = this.data.userInfo.photos[0]
            } else {
                portraitURL = this.data.userInfo.wechat_info.avatarUrl
            }
            let likeInfo = {
                _openid: this.data.userInfo._openid,
                decision: 'pending',
                time: now,
                checked: true,
                basic_info: basic_info_t,
                portraitURL: portraitURL
            }
            // update ilike info to db
            var ilikeInfo = app.globalData.userInfo.match_info.ilike
            ilikeInfo.push(likeInfo)
            var basic_info_g = {}
            for (var item of this.data.basic_item) {
                basic_info_g[item] = app.globalData.userInfo.basic_info[item]
            }
            portraitURL = ""
            if (app.globalData.userInfo.photos.length != 0) {
                portraitURL = app.globalData.userInfo.photos[0]
            } else {
                portraitURL = app.globalData.userInfo.wechat_info.avatarUrl
            }
            let likemeInfo = {
                _openid: app.globalData.userInfo._openid,
                decision: 'pending',
                time: now,
                checked: false,
                basic_info: basic_info_g,
                portraitURL: portraitURL
            }
            wx.cloud.callFunction({
                name: 'likeAction',
                data: {
                    table: 'users',
                    likefrom: {
                        openid: globalData.userInfo._openid,
                        ilike: ilikeInfo
                    },
                    liketo: {
                        openid: that.data.userInfo._openid,
                        likeme: likemeInfo
                    }
                },
                success: res => {
                    // TO DO
                    wx.hideLoading()
                    var statusCode = res.result.statusCode
                    if (statusCode == 200) {
                        wx.showToast({
                            title: '处理成功',
                            icon: 'success',
                            duration: 2000
                        })
                        console.log(res)
                        globalData.userInfo.match_info.ilike = ilikeInfo
                        globalData.nexusInfo.chance--
                        that.setData({
                            likeTag: '已感兴趣'
                        })
                    } else if (statusCode == 401) {
                        wx.showToast({
                            title: '每天只有一次喜欢机会',
                            icon: 'none',
                            duration: 2000
                        })
                    } else {
                        wx.showToast({
                            title: '处理失败',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                    // wx.redirectTo({
                    //   url: `/pages/index/index?cur=like`,
                    // })
                },
                fail: res => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '处理失败',
                        icon: 'none',
                        duration: 2000
                    })
                    console.log("failed!" + JSON.stringify(res))
                }
            })
        },
        ViewImage(e) {
            var photos = this.data.userInfo.photos
            if(photos.length == 0) {
                photos = [this.data.userInfo.wechat_info.avatarUrl]
            }
            wx.previewImage({
                urls: photos,
                current: e.currentTarget.dataset.url
            });
        },
        onShareAppMessage: function (opt) {
            if (opt.from === 'button') {
                // 来自页面内转发按钮
                console.log(opt.target)
            }
            // generate description
            var sopenid = globalData.loginAsTourist ? 'tourist' : globalData.userInfo._openid
            const basic_info = this.data.userInfo.basic_info
            var loc = basic_info.location[0]
            if(loc.indexOf("黑龙江")!=-1 || loc.indexOf("内蒙古")!=-1) loc = loc.substring(0,3)
            else loc = loc.substring(0,2)
            var home = basic_info.hometown[0]
            if(home.indexOf("黑龙江")!=-1 || home.indexOf("内蒙古")!=-1) home = home.substring(0,3)
            else home = home.substring(0,2)
            var job = basic_info.job_title
            job = job ? job : ''
            var age = basic_info.birthday.substring(2,4)
            var desc = "「" + loc + "」" + age + "年 身高" + basic_info.height + " " + 
                job + (basic_info.gender=='male'?'小哥哥':'小姐姐,') + 
                home + "人," + basic_info.education + "学位"
            return {
                //title: "from:" + globalData.userInfo._openid + ",user:" + this.data.userInfo._openid,
                title: desc,
                path: '/pages/member/detail/detail?sopenid=' + sopenid + '&topenid=' + this.data.userInfo._openid,
            }
        }
    },
})
