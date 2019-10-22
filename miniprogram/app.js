App({
    onLaunch: function (opt) {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            let env = 'dev-2019-xe6cj'
            //let env = 'test-t2od1'
            // let env = 'dev-od3w5'
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
            weixin_info: {},
            userInfo: {},
            userInfoHash: "", // used to check if userInfo changed
            seekers: {},
            userIDs: [],
            userMap: null,
            openid: null,
            isLogin: false,
            authed: false,
            completed: false,
            chance: 0,
            scene: opt.scene,
            tags: {
                ilike: 0,
                likeme: 0
            },
        };

        //wx.login({
        //  success (res) {
        //    if (res.code) {
        //      //发起网络请求
        //      wx.request({
        //          url: 'https://tcb-api.tencentcloudapi.com',
        //        data: {
        //          code: res.code
        //        }
        //      })
        //    } else {
        //      console.log('登录失败！' + res.errMsg)
        //    }
        //  }
        //})

        wx.getSystemInfo({
            success: e => {
                this.globalData.StatusBar = e.statusBarHeight;
                let custom = wx.getMenuButtonBoundingClientRect();
                this.globalData.Custom = custom;
                // this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
                const isiOS = e.system.indexOf('iOS') > -1;
                const navHeight = isiOS ? (32 + 6 * 2) : (32 + 8 * 2);
                this.globalData.CustomBar = e.statusBarHeight + navHeight;
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
    }
})
