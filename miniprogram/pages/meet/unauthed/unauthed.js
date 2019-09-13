const app = getApp()
const {
  db,
  globalData
} = app
const _ = db.command

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tabCur: Number,
  },
  observers: {
    'tabCur': function(tabCur) {
      console.log('tabCur', tabCur);
      switch (tabCur) {
        case 0:
          this.getNetworkCandidates();
          break;
        case 1:
          this.getBigCompanyCandidates();
          break;
        case 2:
          this.getMyCompanyCandidates();
          break;
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    networkCandidates: [],
    bigCompanyCandidates: [],
    myCompanyCandidates: [],
  },

  ready: function(options) {},

  /**
   * 组件的方法列表
   */
  methods: {
    getNetworkCandidates: async function(force) {
      if (force !== true && this.data.networkCandidates.length > 0) {
        return
      }
      wx.showLoading({
        title: '加载中…'
      })
      let _openid = 'testuser0' // globalData.openid
      let res = await wx.cloud.callFunction({
        name: "getNetworkCandidates",
        data: {
          openid: _openid
        }
      })
      console.log('call getNetworkCandidates:', _openid, res)
      wx.hideLoading()
      if (res.errCode) {
        return
      }
      this.setData({
        networkCandidates: res.result
      })
    },
    getBigCompanyCandidates: async function(force) {
      if (force !== true && this.data.bigCompanyCandidates.length > 0) {
        return
      }
      wx.showLoading({
        title: '加载中…'
      })
      let _openid = 'testuser0' // globalData.openid
      let res = await wx.cloud.callFunction({
        name: "getBigCompanyCandidates",
        data: {
          openid: _openid,
          fields: {
            basic_info: true,
            photos: true
          }
        }
      })
      console.log('call getBigCompanyCandidates:', _openid, res)
      wx.hideLoading()
      if (res.errCode) {
        return
      }
      this.setData({
        bigCompanyCandidates: res.result
      })
    },
    getMyCompanyCandidates: async function(force) {
      if (force !== true && this.data.myCompanyCandidates.length > 0) {
        return
      }
      wx.showLoading({
        title: '加载中…'
      })
      let _openid = 'testuser0' // globalData.openid
      let res = await wx.cloud.callFunction({
        name: "getMyCompanyCandidates",
        data: {
          openid: _openid,
          fields: {
            basic_info: true,
            photos: true
          }
        }
      })
      console.log('call getMyCompanyCandidates:', _openid, res)
      wx.hideLoading()
      if (res.errCode) {
        return
      }
      this.setData({
        myCompanyCandidates: res.result
      })
    },
    getUserInfo: async function(openids) {
      // 如果没有指定 limit，则默认最多取 20 条记录。
      let res = await db.collection('users').field({
          basic_info: true,
          photos: true
        }).where({
          _openid: _.in(openids)
        })
        .get()
      return res.data;
    }
  }
})