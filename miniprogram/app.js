App({
    onLaunch: function (opt) {

        wx.showShareMenu({
            withShareTicket: true
        })

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            // let env = 'dev-2019-xe6cj'
            let env = 'prod-env-2019'
            wx.cloud.init({
                env: {
                    database: env,
                    storage: env,
                    functions: env
                },
                traceUser: true,
            })
        }

        this.db = wx.cloud.database()
        this.globalData = {
            //weixin_info: {},
            userInfo: {},
            nexusInfo: {},
            userInfoHash: "", // used to check if userInfo changed
            relativeGetTime: "",
            seekers: {},
            userIDs: [],
            userMap: null,
            scene: opt.scene,
            loginAsTourist: true,
            showWAuthed: false,
            tags: {
                ilike: 0,
                likeme: 0
            },
            getFromGroup: true,
        };

        wx.getSystemInfo({
            success: e => {
                this.globalData.StatusBar = e.statusBarHeight;
                let custom = wx.getMenuButtonBoundingClientRect();
                this.globalData.Custom = custom;
                // this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
                const isiOS = e.system.indexOf('iOS') > -1;
                const navHeight = isiOS ? (32 + 6 * 2) : (32 + 8 * 2);
                this.globalData.CustomBar = e.statusBarHeight + navHeight;
                this.globalData.CustomHeight = e.screenHeight - this.globalData.Custom.bottom + this.globalData.CustomBar
                console.log('getMenuButtonBoundingClientRect', this.globalData, e);
            }
        })
    },

    setWatcher(data, watch, that) { // 接收index.js传过来的data对象和watch对象
        Object.keys(watch).forEach(v => { // 将watch对象内的key遍历
            this.observe(data, v, watch[v], that); // 监听data内的v属性，传入watch内对应函数以调用
        })
    },
    /**
     * 监听属性 并执行监听函数
     */
    observe(obj, key, watchFun, that) {
        var val = obj[key]; // 给该属性设默认值
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            set: function (value) {
                val = value;
                watchFun(value, that); // 赋值(set)时，调用对应函数
            },
            get: function () {
                return val;
            }
        })
    },

    onShow: function(options) {
        const that = this
        wx.getShareInfo({
            shareTicket: options.shareTicket,
            success: function(res) {
                that.globalData.getFromGroup = true
            },
            fail: function(err) {
                that.globalData.getFromGroup = false
            }
        })
        // auto update userInfo
        if(that.globalData.userInfo._openid != undefined) {
            wx.cloud.callFunction({
                name: 'getUpdate',
                data: {
                    table: 'users',
                    _openid: that.globalData.userInfo._openid,
                },
                success: function(res) {
                    var resData = res.result
                    console.log("Get updated userInfo:",resData)
                    if(resData) {
                        if(!that.globalData.userInfo.time) {
                            that.globalData.userInfo = resData
                        } else if(resData.time && resData.time != that.globalData.userInfo.time) {
                            that.globalData.userInfo = resData
                            console.log("Update user info successfully!",res)
                        } else {
                            console.log("No new update")
                        }
                    } else {
                        console.log("Update user info failed!",res)
                    }
                },
                fail: function(err) {
                    console.log('Update user info failed!Internal error!',err)
                },
            })
        }
    },
})
