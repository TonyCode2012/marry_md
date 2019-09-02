
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env: 'dev-od3w5',
        env: 'test-t2od1',
        traceUser: true,
      })
    }

    this.globalData = {
      userProfile: {},
      userInfo: {}
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