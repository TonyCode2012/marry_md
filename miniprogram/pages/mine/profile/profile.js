const {
  formatDate
} = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

    imgList: [],
    now: formatDate(new Date()),
    nickName: '',
    company: '',
    weixin: '',
    phone: '',
    married: false,
    gender: 'female',
    birthday: formatDate(new Date()),

    weightIndex: 20,
    weightRange: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120],

    heightIndex: 20,
    heightRange: [150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229],

    educationIndex: 1,
    educationRange: ['大专', '本科', '硕士', '博士'],

    jobIndex: 1,
    jobRange: ['手动填写', '产品经理', '程序员', '设计师', '运营'],
    customJobItem: '手动填写',

    earningIndex: 0,
    earningRange: ['5-15W', '15-30W', '30-50W', '50-100W'],
    
    region: ['广东省', '广州市', '海珠区'],
    homeRegion: ['广东省', '广州市', '海珠区'],
  },

  birthdayChange(e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  bindWeightChange(e) {
    this.setData({
      weightIndex: e.detail.value
    })
  }, 
  bindHeightChange(e) {
    this.setData({
      heightIndex: e.detail.value
    })
  }, 
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  bindHomeRegionChange: function (e) {
    this.setData({
      homeRegion: e.detail.value
    })
  },
  bindJobChange: function (e) {
    this.setData({
      jobIndex: e.detail.value
    })
  },
  bindEducationChange: function (e) {
    this.setData({
      educationIndex: e.detail.value
    })
  },
  bindNickInput: function (e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  bindCompanyInput: function (e) {
    this.setData({
      company: e.detail.value
    })
  },

  bindWeixinInput: function (e) {
    this.setData({
      weixin: e.detail.value
    })
  },

  bindPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindTapMarriage: function(e){
    debugger
  },

  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '召唤师',
      content: '确定要删除这段回忆吗？',
      cancelText: '再看看',
      confirmText: '再见',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
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

  }
})