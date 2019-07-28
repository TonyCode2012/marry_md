const {
  formatDate
} = require('../../../utils/util.js')
const {
  weightRange,
  heightRange,
  educationRange,
  jobRange,
  incomeRange
} = require('../../../utils/data.js')

const app = getApp()
const {
  globalData
} = app
const db = wx.cloud.database({})
Page({

  /**
   * 页面的初始数据
   */
  data: {

    album: [],

    now: formatDate(new Date()),

    nickName: '',
    gender: '',
    birthday: '',
    maritalStatus: '', // single,divorced
    school: '',
    job: '',
    company: '',
    weixin: '',
    phone: '',

    weightIndex: 20,
    weightRange: weightRange,

    heightIndex: 20,
    heightRange: heightRange,

    educationIndex: 1,
    educationRange: educationRange,

    incomeIndex: 0,
    incomeRange: incomeRange,

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
  bindIncomeChange: function(e) {
    this.setData({
      incomeIndex: e.detail.value
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
      nickName: this.data.nickName,
      gender: this.data.gender,
      birthday: this.data.birthday,
      weight: this.data.weightRange[this.data.weightIndex],
      height: this.data.heightRange[this.data.heightIndex],
      region: this.data.region,
      home_region: this.data.home_region,
      marital_status: this.data.maritalStatus,

      education: this.data.educationRange[this.data.educationIndex],
      school: this.data.school,

      job: this.data.job,
      company: this.data.company,
      income: this.data.incomeRange[this.data.incomeIndex],

      school: this.data.school,
      weixin: this.data.weixin,
      phone: this.data.phone
    }


    db.collection('users').where({
      _openid: globalData.openid
    }).get().then(res => {
      return res.data[0]._id;
    }).then(id => {
      db.collection('users').doc(id)
        .update({
          data: user_profile_model
        }).then(res => {
          console.log(res)
        })
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.album.length != 0) {
          this.setData({
            album: this.data.album.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            album: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.album,
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
          this.data.album.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            album: this.data.album
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    debugger;
    const {
      userProfile
    } = globalData
    const {
      userInfo
    } = userProfile

    let data = {
      nickName: userProfile.nickName || userInfo.nickName,
      gender: userProfile.gender || userInfo.gender,
      birthday: userProfile.birthday || '1990-01-01',
      maritalStatus: userProfile.marital_status || 'single', // single,divorced
      school: userProfile.school,
      job: userProfile.job,
      company: userProfile.company,
      weixin: userProfile.weixin,
      phone: userProfile.phone,
      album: userProfile.album
    }
    console.log(data)
    this.setData(data)
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