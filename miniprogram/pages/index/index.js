const observer = require("../../utils/observer.js")
const app = getApp()
const { aboutme } = require("../../utils/data.js");

const {
  db,
  globalData
} = app

Page({
  data: {
    PageCur: 'meet',
    query: null,
    isLogin: false,
    userInfo: app.globalData.userInfo,
    seekerList: [],
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  updateUserInfo(e) {
    this.setData({
      userInfo: e.detail.userInfo
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

    // get parameter
    let openid = 'testuser2'
    if(query.openid != undefined) {
      openid = query.openid
    }
    

    // get seekers info from db
    const that = this
    const _ = db.command
    db.collection('zy_users').where({
      _openid: _.neq(openid)
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
    if(app.globalData.userInfo.match_info != undefined) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      db.collection('zy_users').where({
        _openid: openid
      }).get({
        success: function(res) {
          app.globalData.userInfo = res.data[0]
          let userInfo =  app.globalData.userInfo
          that.setData({
            userInfo: userInfo,
          })
        },
        fail: function(res) {
          console.log(res)
        }
      })
    }
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