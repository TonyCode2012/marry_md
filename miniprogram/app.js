//app.js

App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {};

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
    const db = wx.cloud.database({});
    const book = db.collection('books');

    // wx.cloud.callFunction({
    //   name: 'requestapi',
    //   data: {
    //     isbn: '9787111128069',
    //     method: 'getBook'
    //   },
    //   complete: res => {
    //     console.log('callFunction test result: ', res)

    //     db.collection('books').add({
    //       data: JSON.parse(res.result)
    //     }).then(res => {
    //       console.log(res)
    //     }).catch(err => {
    //       console.log(err)
    //     })

    //   },
    // })

    db.collection('books').get({
      success: res => {
        console.log(res.data[0]);
 
      }
    })

  }
})