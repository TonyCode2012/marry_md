const {
  formatDate
} = require('../../../utils/util.js')
const {
  weightRange,
  heightRange,
  educationRange,
  jobRange,
  earningRange
} = require('../../../utils/data.js')

const app = wx.app();
const db = wx.cloud.database({});
const user_profile = db.collection('user_profile');
Page({

  /**
   * 页面的初始数据
   */
  data: {

    imgList: [],

    now: formatDate(new Date()),

    nickname: '',
    gender: 'female',
    birthday: formatDate(new Date()),
    company: '',
    maritalStatus: 'single',
    college: '',
    weixin: '',
    phone: '',

    weightIndex: 20,
    weightRange: weightRange,

    heightIndex: 20,
    heightRange: heightRange,

    educationIndex: 1,
    educationRange: educationRange,

    earningIndex: 0,
    earningRange: earningRange,

    region: ['广东省', '广州市', '海珠区'],
    homeRegion: ['广东省', '广州市', '海珠区'],

    // jobIndex: 1,
    // jobRange: jobRange,
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
  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    })
  },
  bindHomeRegionChange: function(e) {
    this.setData({
      homeRegion: e.detail.value
    })
  },
  bindJobInput: function(e) {
    this.setData({
      jobIndex: e.detail.value
    })
  },
  bindEducationChange: function(e) {
    this.setData({
      educationIndex: e.detail.value
    })
  },
  bindNickInput: function(e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  bindCompanyInput: function(e) {
    this.setData({
      company: e.detail.value
    })
  },

  bindWeixinInput: function(e) {
    this.setData({
      weixin: e.detail.value
    })
  },

  bindPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindTapMarriage: function(e) {
    debugger
  },
  Save: function(e) {
    let user_profile_model = {
      nickname: this.data.nickname,
      gender: '',
      birthday: '',
      weight: '',
      height: '',
      region: '',
      home_region: '',
      marital_status: 'divorced | single',
      education: '',
      college: '',
      weixin: '',
      phone: ''
    }

    db.collection('users').add({
      data: user_profile_model
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })


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
      title: '',
      content: '确定要删除吗？',
      cancelText: '取消',
      confirmText: '确定',
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
    wx.collec
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