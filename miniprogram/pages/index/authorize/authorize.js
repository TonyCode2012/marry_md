// miniprogram/pages/meet/authorize/authorize.js

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

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
      wx.reLaunch({
        url: '/pages/index/index',
      })
    });
  }
})
