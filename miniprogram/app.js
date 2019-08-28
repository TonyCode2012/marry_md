App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // env: 'test-t2od1'
      let env = 'dev-od3w5'
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
      userProfile: {}
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
        console.log('getMenuButtonBoundingClientRect', this.globalData, e);
      }
    })

  }
})