const observer = require("../../utils/observer.js")
const app = getApp()

Page({
  data: {
    PageCur: 'meet',
    query: null,
    userInfo: {},
    seekerList: [],
    matchInfo: {},
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  onLoad(query) {
    this.setData({
      query: query
    })
    observer.observe(observer.store, 'PageCur', (value) => {
      this.setData({
        PageCur: value
      })
    })
    // get seekers info from db
    const that = this
    const db = wx.cloud.database({
      env: 'test-t2od1'
    })
    db.collection('users').where({
      'auth_info.personal_auth': false
    }).get({
      success: function (res) {
        that.setData({
          seekerList: res.data
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
    // get my profile from db
    db.collection('zy_users').where({
      _openid: 'testuser1'
    }).get({
      success:function(res) {
        that.setData({
          userInfo: res.data[0],
          matchInfo: res.data[0].match_info
        })
      },
      fail:function(res) {
        console.log(res)
      }
    })
  },

  onReady() {
    if (this.data.query && this.data.query.cur) {
      this.setData({
        PageCur: this.data.query.cur
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '',
      imageUrl: '',
      path: '/pages/index/index'
    }
  },
})