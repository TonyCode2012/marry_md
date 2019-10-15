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
  env: 'dev-2019'
})
Page({

  /**
   * 页面的初始数据
   */
  data: {

    now: formatDate(new Date()),

    basic_info: {},
    photos: [],
    imgList: [],
    orgImgList: [],
    addImgList: [],
    delImgList: [],
    type: "profile",

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
    this.dealSave({
      delPics: this.data.delImgList,
      addPics: this.data.addImgList
    })
  },
  dealSave: function(data) {
    let {
      delPics,
      addPics
    } = data
    if(delPics.length == 0 && addPics.length == 0) {
      this.updateBasicInfo()
    } else if(addPics.length == 0) {
      this.deletePic(delPics)
    } else {
      this.uploadPic(addPics)
    }
  },
  uploadPic: function (data) {
    let photos = data
    if(photos.lenght == 0) return
    const that = this
    let now = new Date()
    now = Date.parse(now.toUTCString())
    wx.cloud.uploadFile({
      cloudPath: that.data.type + '_' + now + '.jpeg', //仅为示例，非真实的接口地址
      filePath: photos[0],
      complete(res) {
        if (res.fileID != undefined) {
          that.data.photos.push(res.fileID)
        }
        photos.splice(0,1)
        if (photos.length != 0) {
          console.log("continue upload,length:" + photos.length)
          that.data.uploadPic(photos)
        } else {
          console.log("start update loveinfo")
          if(that.data.delImgList.length != 0) {
            that.data.deletePic(that.data.delImgList)
          } else {
            that.updateBasicInfo()
          }
          
        }
      }
    })
  },
  deletePic: function(data) {
    if(data.length == 0) return
    const that = this
    wx.cloud.deleteFile({
      fileList: data[0],
      success: res => {
        // handle success
        console.log(res.fileList)
        for(let pic in res.fileList) {
          for(let i=0;i<that.data.imgList.length;i++) {
            if(pic == that.data.imgList[i]) {
              that.data.imgList.splice(i,1)
              break
            }
          }
        }
        data.splice(0,1)
        if(data.length != 0) {
          that.data.deletePic(data)
        } else {
          that.updateBasicInfo()
        }
        
      },
      fail: err => {
        // handle error
        console.log("delete picture failed!" + err)
      }
    })
  },
  updateBasicInfo: function() {
    const that = this
    console.log(that.data.basic_info)
    wx.showLoading({
      title: '正在保存',
    })

    globalData.userInfo.basic_info = this.data.basic_info
    globalData.userInfo.photos = this.data.photos
    wx.cloud.callFunction({
      name: 'dbupdate',
      data: {
        table: 'zy_users',
        _openid: globalData.userInfo._openid,
        data: {
          basic_info: that.data.basic_info,
          photos: that.data.photos
        }
        // field: 'basic_info',
        // data: that.data.basic_info,
      },
      success: function (res) {
        // update parent page data
        globalData.userInfo.basic_info = that.data.basic_info
        wx.hideLoading()
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail:function(res) {
        wx.hideLoading()
        wx.showToast({
          title: '失败',
          icon: 'fail',
          duration: 2000
        })
      }
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //从相册选择
      success: (res) => {
        this.setData({
          imgList: this.data.imgList.concat(res.tempFilePaths),
          addImgList: this.data.addImgList.concat(res.tempFilePaths)
        })
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
          let delPic = this.data.imgList.splice(e.currentTarget.dataset.index, 1)
          // check if the delted pic exists in original pics
          for (let i = 0; i < this.data.orgImgList.length; i++) {
            if (delPic == this.data.orgImgList[i]) {
              this.data.delImgList.push(delPic)
              break
            }
          }
          for (let i = 0; i < this.data.addImgList.length; i++) {
            if (this.data.addImgList[i] == delPic) {
              this.data.addImgList.splice(i, 1)
              break
            }
          }
          this.setData({
            imgList: this.data.imgList,
            delImgList: this.data.delImgList,
            addImgList: this.data.addImgList,
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // get basic info
    let basic_info = globalData.userInfo.basic_info
    let imgList = globalData.userInfo.photos
    this.setData({
      basic_info: basic_info,
      imgList: imgList,
      orgImgList: [].concat(imgList)
    })
    let rangeIndexObj = {
      weightIndex: 0,
      heightIndex: 0,
      educationIndex: 0,
      incomeIndex: 0
    }
    for (let j = 0; j < this.data.rangeArry.length; j++) {
      let range = this.data.rangeArry[j]
      if (basic_info[range] == '') continue
      let concretRange = this.data[range + 'Range']
      for (let i = 0; i < concretRange.length; i++) {
        if (concretRange[i] == basic_info[range]) {
          rangeIndexObj[range + 'Index'] = i
          break
        }
      }
    }
    this.setData({
      rangeIndexObj: rangeIndexObj
    })
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
