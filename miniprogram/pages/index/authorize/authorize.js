// miniprogram/pages/meet/authorize/authorize.js
const { aboutme } = require("../../../utils/data.js");
const listItem = aboutme.listItem;

const app = getApp()
let {
  db,
  globalData
} = app
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redirectPath: "",
    openid: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if(options.path != undefined) {
        this.setData({
            redirectPath: unescape(options.path),
            openid: options.openid
        })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  bindGetUserInfo (e) {
    const that = this
    var userInfo = e.detail.userInfo
    var gender = userInfo.gender==1 ? "male" : "female"
    var nickName = userInfo.nickName
    var love_info = {}
    for(var el of listItem) {
      love_info[el.type] = {
        content: "",
        photos: []
      }
    }
    var userInfo = {
        _openid: that.data.openid,
        auth_info: {
            company_auth: {
                authed: false,
                company: ""
            },
            personal_auth: false,
        },
        basic_info: {
            gender: gender,
            nickName: nickName,
            hometown: ['上海市','上海市','浦东新区'],
            location: ['上海市','上海市','浦东新区'],
            birthday: ""
        },
        expect_info: {},
        love_info: love_info,
        match_info: {
          ilike: [],
          likeme: [],
          deletes: []
        },
        photos: [],
        wechat_info: userInfo
    }
    var nexusInfo = {
        _openid: that.data.openid,
        adjCompanies: {},
        authed: false,
        company: "",
        completed: false,
        friends: {},
        gender: gender,
        name: nickName
    }
    wx.showLoading({
      title: '请稍等',
    })
    wx.cloud.callFunction({
        name: 'addUser',
        data: {
            userTable: 'users',
            userInfo: userInfo,
            nexusTable: 'nexus',
            nexusInfo: nexusInfo
        },
        success: function(res) {
            globalData.isLogin = true
            globalData.userInfo = userInfo;
            wx.reLaunch({
                url: that.data.redirectPath
            })
            wx.hideLoading()
        },
        fail: function(err) {
          console.log("Create user info failed,Please check!")
          wx.hideLoading()
        }
    })
        /*
    db.collection('users').where({
      _openid: globalData.openid
    }).get().then(res => {
      if (res.data.length > 0) {
        return
      }
      db.collection('users').add({
        data: {
          wechat_info: e.detail.userInfo
        },
        complete: function(res){
          console.log('users add', res)
        }
      })    
      if(this.data.redirectPath == "") {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      } else {
        wx.reLaunch({
          url: this.data.redirectPath,
        })
      }
    });
    */
  }
})
