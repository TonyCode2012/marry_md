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
    getNetworkCandidates: async function (force) {
      if (force !== true && this.data.networkCandidates.length > 0) {
        return
      }
      wx.showLoading({ title: '加载中…' })
      let res = await wx.cloud.callFunction({
        name: "getNetworkCandidates"
      })
      let candidates = res.result;
      candidates = candidates.flat();
      let openids = candidates.filter(n => !!n.openid).map(n => n.openid)
      openids = [...new Set(openids)]
      if (openids.length === 0) {
        wx.hideLoading()
        return
      }
      let candidatesInfo = await this.getUserInfo(openids)
      this.setData({
        networkCandidates: candidatesInfo
      })
      wx.hideLoading()
      console.log('networkCandidates', candidates, openids, candidatesInfo)
    },
    getBigCompanyCandidates: async function(force) {
      if (force !== true && this.data.bigCompanyCandidates.length > 0) {
        return
      }
      wx.showLoading({ title: '加载中…' })
      let res = await wx.cloud.callFunction({
        name: "getBigCompanyCandidates"
      })
      let candidates = res.result;
      let openids = candidates.map(n => n._openid)
      if (openids.length === 0) {
        wx.hideLoading()
        return
      }
      let candidatesInfo = await this.getUserInfo(openids)
      this.setData({
        bigCompanyCandidates: candidatesInfo
      })
      wx.hideLoading()
      console.log('bigCompanyCandidates', candidates, openids, candidatesInfo)
    },
    getMyCompanyCandidates: async function(force) {
      if (force !== true && this.data.myCompanyCandidates.length > 0) {
        return
      }
      wx.showLoading({ title: '加载中…' })
      let res = await wx.cloud.callFunction({
        name: "getMyCompanyCandidates"
      })
      let candidates = res.result;
      let openids = candidates.map(n => n._openid)
      if (openids.length === 0) {
        wx.hideLoading()
        return
      }
      let candidatesInfo = await this.getUserInfo(openids)
      this.setData({
        myCompanyCandidates: candidatesInfo
      })
      wx.hideLoading()
      console.log('myCompanyCandidates', candidates, openids, candidatesInfo)
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