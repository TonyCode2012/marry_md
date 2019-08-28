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
  db,
  globalData
} = app

Page({

  /**
   * 页面的初始数据
   */
  data: {

    album: [],
    dateNow: formatDate(new Date()),
    info: {
      nickName: '',
      school: '',
      job: '',
      company: '',
      weixin: '',
      phone: ''
    },

    gender: 'female',
    birthday: '1990-01-01',
    maritalStatus: 'unmarried', // unmarried, divorced


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
  bindEducationChange: function (e) {
    this.setData({
      educationIndex: e.detail.value
    })
  },
  bindIncomeChange: function (e) {
    this.setData({
      incomeIndex: e.detail.value
    })
  },
  bindGenderChange: function (e) {
    this.setData({
      gender: e.currentTarget.dataset.gender
    })
  },
  bindMarryChange: function (e) {
    this.setData({
      maritalStatus: e.currentTarget.dataset.married
    })
  },
  bindFieldInput: function (e) {
    let ds = e.currentTarget.dataset;
    let value = e.detail.value;
    let form = ds.form || "info";
    this.data[form][ds.field] = value;
    this.setData({
      [form]: this.data[form]
    })
  },
  Save: async function (e) {
    let basic_info = {
      nickName: this.data.info.nickName,
      gender: this.data.gender,
      birthday: this.data.birthday,
      weight: this.data.weightRange[this.data.weightIndex],
      height: this.data.heightRange[this.data.heightIndex],
      location: this.data.region,
      hometown: this.data.homeRegion,
      marryStatus: this.data.maritalStatus,

      education: this.data.educationRange[this.data.educationIndex],
      college: this.data.info.college,

      profession: this.data.info.profession,
      company: this.data.info.company,
      income: this.data.incomeRange[this.data.incomeIndex],

      wechat: this.data.info.weixin,
      phone: this.data.info.phone
    }
    console.log('basic_info', basic_info);

    let res = await db.collection('users').where({ _openid: globalData.openid }).get()
    let user = res.data[0]
    res = await db.collection('users').doc(user._id).update({ data: {basic_info: basic_info } })
    console.log(res)
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
  onLoad: function (options) {
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