// miniprogram/pages/mine/expect/expect.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    expect_info: {},

    // region: ['广东省', '广州市', '海珠区'],
    // index_height: null,
    // height: [170, 171, 172, 173, 174, 175, 176],
    // index_weight: null,
    // weight: [50, 51, 52, 53, 54, 55, 56, 57, 58],
    // index: null,
    // index_job: null,
    // index_assets: null,
    // assets: ['有车', '有房', '有车有房'],
    // index_earning: null,
    // earning: ['5-15W', '15-30W', '30-50W', '50-100W'],
    educationRange: ['大专', '本科', '硕士', '博士'],
    marryStatusRange: ['未婚','离异','无要求'],

    // set height slider
    minHeight: 150,
    maxHeight: 190,
    startHeight: 0,
    endHeight: 0,

    // set age slider
    minAge: 21,
    maxAge: 50,
    startAge: 0,
    endAge: 0,

    rangeArry: ['marryStatus','education'],
    rangeIndexObj: {
      educationIndex: 0,
      marryStatusIndex: 0,
    },

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
      startAge: e.detail.lowValue
    })
  },
  ageHighValueChange: function (e) {
    this.setData({
      endAge: e.detail.highValue
    })
  },
  heightLowValueChange: function (e) {
    this.setData({
      startHeight: e.detail.lowValue
    })
  },
  heightHighValueChange: function (e) {
    this.setData({
      endHeight: e.detail.highValue
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    // set expect_info
    let expect_info = JSON.parse(options.expect_info)
    that.setData({
      expect_info: expect_info,
    })
    let rangeIndexObj = {
      educationIndex: 0,
      marryStatusIndex: 0
    }
    for (let j = 0; j < that.data.rangeArry.length; j++) {
      let range = that.data.rangeArry[j]
      if (expect_info[range] == '') continue
      let concretRange = that.data[range + 'Range']
      for (let i = 0; i < concretRange.length; i++) {
        if (concretRange[i] == expect_info[range]) {
          rangeIndexObj[range + 'Index'] = i
          break
        }
      }
    }
    that.setData({
      rangeIndexObj: rangeIndexObj,
      startAge: expect_info.startAge,
      endAge: expect_info.endAge,
      startHeight: expect_info.startHeight,
      endHeight: expect_info.endHeight,
    })
    // get data from db
    // const db = wx.cloud.database({
    //   env: 'test-t2od1'
    // })
    // db.collection('users').where({
    //   _openid: 'o5lKm5CVkJC-0oaVSWrD9kJHADsg2'
    // }).get({
    //   success: function (res) {
    //     if (res.data.length > 0) {
    //       that.setData({
    //         expect_info: res.data[0].expect_info,
    //       })
    //       let rangeIndexObj = {
    //         educationIndex: 0,
    //         marryStatusIndex: 0
    //       }
    //       let expect_info = res.data[0].expect_info
    //       for (let j = 0; j < that.data.rangeArry.length; j++) {
    //         let range = that.data.rangeArry[j]
    //         if (expect_info[range] == '') continue
    //         let concretRange = that.data[range + 'Range']
    //         for (let i = 0; i < concretRange.length; i++) {
    //           if (concretRange[i] == expect_info[range]) {
    //             rangeIndexObj[range + 'Index'] = i
    //             break
    //           }
    //         }
    //       }
    //       that.setData({
    //         rangeIndexObj: rangeIndexObj,
    //         startAge: expect_info.startAge,
    //         endAge: expect_info.endAge,
    //         startHeight: expect_info.startHeight,
    //         endHeight: expect_info.endHeight,
    //       })
    //     }
    //   },
    //   fail: function (res) {
    //     console.log(res)
    //   }
    // })
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