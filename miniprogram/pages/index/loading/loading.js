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
    if (!app.globalData.isLogin) {
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
          _openid: globalData.openid
        }).get().then(res => {
          if (res.data.length === 0) {
            redirectPath = escape(redirectPath)
            wx.reLaunch({
              url: `/pages/index/authorize/authorize?openid=${globalData.openid}&path=${redirectPath}`,
            })
          } else {
            app.globalData.userInfo = res.data[0]
            app.globalData.userInfoHash = stringHash(JSON.stringify(res.data[0]))
            app.globalData.isLogin = true;
            console.log('user profile from loading: ', app.globalData.userInfo);
            wx.reLaunch({
              url: redirectPath,
            })
          }
        })
      });
    },
    getOpenId() {
      const openid = wx.getStorageSync('openid')
      if (openid) {
        console.log('openid from storage: ', openid)
        globalData.openid = openid;
        return Promise.resolve(openid)
      }
      return wx.cloud.callFunction({
        name: 'login'
      }).then(res => {
        console.log('openid from cloud: ', res)
        const openid = res.result.openid;
        globalData.openid = openid;
        wx.setStorage({
          key: "openid",
          data: openid
        })
        return openid
      })
    }
  }
})
