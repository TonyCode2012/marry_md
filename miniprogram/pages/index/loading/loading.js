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
      this.getOpenId().then(openid => {
        db.collection('users').where({
          _openid: globalData.openid
        }).get().then(res => {
          if (res.data.length === 0) {
            wx.navigateTo({
              url: '/pages/index/authorize/authorize',
            })
          } else {
            app.globalData.weixin_info = res.data[0];
            console.log('user profile from loading: ', app.globalData.weixin_info);
            app.globalData.isLogin = true;
            wx.navigateTo({
              url: '/pages/index/index',
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