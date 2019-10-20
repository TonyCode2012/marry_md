// miniprogram/pages/mine/expect/expect.js

const app = getApp()
const {
    globalData
} = app

Page({

  /**
   * 页面的初始数据
   */
  data: {
    expect_info: {},

    educationRange: ['都可以', '本科', '硕士'],
    marryStatusRange: ['未婚','可以离异'],
    locationRange: ['同城优先','只要同城'],
    hometownRange: ['都可以','同省'],

    // set height slider
    minHeight: 150,
    maxHeight: 190,

    // set age slider
    minAge: 21,
    maxAge: 50,

    rangeArry: ['marryStatus','education'],
    rangeIndexObj: {
      educationIndex: 0,
      marryStatusIndex: 0,
    },

  },


  bindInfoChange(e) {
    let type = e.currentTarget.dataset.type
    let value = e.currentTarget.dataset.value
    this.setData({
      ['expect_info.' + type + '']: value
    })
  },
  bindInfoRegion(e) {
    let type = e.currentTarget.dataset.type
    let value = e.detail.value
    this.setData({
      ['expect_info.' + type + '']: value
    })
  },
  bindInfoRange(e) {
    let type = e.currentTarget.dataset.type
    let value = this.data[type + 'Range'][e.detail.value]
    this.setData({
      ['expect_info.' + type]: value,
      ['rangeIndexObj.' + type + 'Index']: e.detail.value
    })
  },
  

  ageLowValueChange: function (e) {
    this.setData({
      "expect_info.startAge": e.detail.lowValue
    })
  },
  ageHighValueChange: function (e) {
    this.setData({
      "expect_info.endAge": e.detail.highValue
    })
  },
  heightLowValueChange: function (e) {
    this.setData({
      "expect_info.startHeight": e.detail.lowValue
    })
  },
  heightHighValueChange: function (e) {
    this.setData({
      "expect_info.endHeight": e.detail.highValue
    })
  },

  Save: function() {
    const that = this
    wx.showLoading({
      title: '正在保存',
    })
    wx.cloud.callFunction({
      name: 'dbupdate',
      data: {
        table: 'users',
        _openid: app.globalData.userInfo._openid,
        data: {
          expect_info: that.data.expect_info
        }
      },
      success: function (res) {
        // update parent page data
        globalData.userInfo.expect_info = that.data.expect_info
        wx.hideLoading()
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '失败',
          icon: 'fail',
          duration: 2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // set expect_info
    let expect_info = globalData.userInfo.expect_info
    // check initial value validation
    if(expect_info.startAge == undefined) {
      expect_info.startAge = this.data.minAge
    }
    if(expect_info.endAge == undefined) {
      expect_info.endAge = this.data.minAge
    }
    if(expect_info.startHeight == undefined) {
      expect_info.startHeight = this.data.minHeight
    }
    if(expect_info.endHeight == undefined) {
      expect_info.endHeight = this.data.minHeight
    }
    this.setData({
      expect_info: expect_info,
    })
    let rangeIndexObj = {
      educationIndex: 0,
      marryStatusIndex: 0
    }
    for (let j = 0; j < this.data.rangeArry.length; j++) {
      let range = this.data.rangeArry[j]
      if (expect_info[range] == '') continue
      let concretRange = this.data[range + 'Range']
      for (let i = 0; i < concretRange.length; i++) {
        if (concretRange[i] == expect_info[range]) {
          rangeIndexObj[range + 'Index'] = i
          break
        }
      }
    }
    this.setData({
      rangeIndexObj: rangeIndexObj,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
