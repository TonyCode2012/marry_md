const observer = require("../../utils/observer.js")
const app = getApp()

const {
  db,
  globalData
} = app

Page({
  data: {
    PageCur: 'meet',
    query: null,
    isLogin: false,
    userInfo: {},
    seekerList: []
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  onLoad(query) {
    if (!app.globalData.isLogin){
      return false
    }
    this.setData({
      query: query
    })
    this.setData({
      isLogin: app.globalData.isLogin
    })

    // get seekers info from db
    const that = this
    db.collection('users').where({
      'auth_info.personal_auth': false
    }).get({
      success: function(res) {
        that.setData({
          seekerList: res.data
        })
      },
      fail: function(res) {
        console.log(res)
      }
    })
    // get my profile from db
    db.collection('users').where({
      _openid: 'testuser1'
    }).get({
      success: function(res) {
        that.setData({
          userInfo: res.data[0]
        })
      },
      fail: function(res) {
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