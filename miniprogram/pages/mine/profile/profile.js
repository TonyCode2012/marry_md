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
const db = wx.cloud.database({
  env: 'test-t2od1'
})
Page({

  /**
   * 页面的初始数据
   */
  data: {

    now: formatDate(new Date()),

    basic_info: {
      nickName: '',
      gender: 'male',
      birthday: '2000-01-01',
      height: '160',
      weight: '50',
      marryStatus: 'unmarried',
      education: '本科',
      college: '',
      company: '',
      profession: '',
      income: '5-15w',
      location: [],
      hometown: [],
      phone: '',
      wechat: ''
    },

    photos: [],

    weightIndex: 20,
    weightRange: weightRange,

    heightIndex: 20,
    heightRange: heightRange,

    educationIndex: 1,
    educationRange: educationRange,

    incomeIndex: 0,
    incomeRange: incomeRange,

    rangeArry: ['weight','height','education','income'],
    rangeIndexObj: {
      weightIndex: 0,
      heightIndex: 0,
      educationIndex: 0,
      incomeIndex: 0
    },

    region: ['广东省', '广州市', '海珠区'],
    homeRegion: ['广东省', '广州市', '海珠区'],
  },

  bindInfoChange(e) {
    let type = e.currentTarget.dataset.type
    let value = e.currentTarget.dataset.value
    this.setData({
      ['basic_info.'+type+'']: value
    })
  },
  bindInfoInput(e) {
    let type = e.currentTarget.dataset.type
    let value = e.detail.value
    this.setData({
      ['basic_info.' + type + '']: value
    })
  },
  bindInfoRange(e) {
    let type = e.currentTarget.dataset.type
    let value = this.data[type+'Range'][e.detail.value]
    this.setData({
      ['basic_info.' + type + '']: value,
      ['rangeIndexObj.'+type+'Index']: e.detail.value
    })
  },
  bindInfoRegion(e) {
    let type = e.currentTarget.dataset.type
    let value = e.detail.value
    this.setData({
      ['basic_info.' + type + '']: value
    })
  },

  Save: function(e) {
    const that = this
    console.log(that.data.basic_info)
    db.collection('users').where({
      _openid: 'o5lKm5CVkJC-0oaVSWrD9kJHADsg2'
    }).get().then(res=>{
      return res.data[0]._id;
    }).then(id=>{
      db.collection('users').doc(id).update({
        data: {
          basic_info: that.data.basic_info
        }
      }).then(res=>{
        console.log(res)
      })
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['photos'], //从相册选择
      success: (res) => {
        if (this.data.photos.length != 0) {
          this.setData({
            photos: this.data.photos.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            photos: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.photos,
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
          this.data.photos.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            photos: this.data.photos
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this

    // get basic info
    let basic_info = JSON.parse(options.basic_info)
    let photos = JSON.parse(options.photos).data
    that.setData({
      basic_info: basic_info,
      photos: photos
    })
    let rangeIndexObj = {
      weightIndex: 0,
      heightIndex: 0,
      educationIndex: 0,
      incomeIndex: 0
    }
    for (let j = 0; j < that.data.rangeArry.length; j++) {
      let range = that.data.rangeArry[j]
      if (basic_info[range] == '') continue
      let concretRange = that.data[range + 'Range']
      for (let i = 0; i < concretRange.length; i++) {
        if (concretRange[i] == basic_info[range]) {
          rangeIndexObj[range + 'Index'] = i
          break
        }
      }
    }
    that.setData({
      rangeIndexObj: rangeIndexObj
    })

    // get data from db
    // db.collection('users').where({
    //   _openid: 'o5lKm5CVkJC-0oaVSWrD9kJHADsg2'
    // }).get({
    //   success:function(res){
    //     if(res.data.length > 0) {
    //       that.setData({
    //         basic_info: res.data[0].basic_info,
    //         photos: res.data[0].photos
    //       })
    //       let rangeIndexObj =  {
    //         weightIndex: 0,
    //         heightIndex: 0,
    //         educationIndex: 0,
    //         incomeIndex: 0
    //       }
    //       let basic_info = res.data[0].basic_info
    //       for(let j=0;j<that.data.rangeArry.length;j++) {
    //         let range = that.data.rangeArry[j]
    //         if(basic_info[range] == '') continue
    //         let concretRange = that.data[range+'Range']
    //         for (let i = 0; i < concretRange.length; i++) {
    //           if (concretRange[i] == basic_info[range]) {
    //             rangeIndexObj[range+'Index'] = i
    //             break
    //           }
    //         }
    //       }
    //       that.setData({
    //         rangeIndexObj: rangeIndexObj
    //       })
    //     }
    //   },
    //   fail:function(res) {
    //     console.log(res)
    //   }
    // })
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