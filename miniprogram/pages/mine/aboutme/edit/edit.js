const {aboutme} = require("../../../../utils/data.js");
const listItem = aboutme.listItem;
const app = getApp()
const { globalData } = app


Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {
      title: '',
      desc: ''
    },
    maxImgNum: 4,
    imgList: [],
    orgImgList: [],
    addImgList: [],
    delImgList: [],
    loveDetail: {},
    type: '',
    dealSave: function(data) {
      let {
        delPics,
        addPics
      } = data
      if(delPics.length == 0 && addPics.length == 0) {
        this.updateLoveInfo()
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
        cloudPath: that.type + '_' + now + '.jpeg', //仅为示例，非真实的接口地址
        filePath: photos[0],
        complete(res) {
          if (res.fileID != undefined) {
            that.loveDetail.photos.push(res.fileID)
          }
          photos.splice(0,1)
          if (photos.length != 0) {
            console.log("continue upload,length:" + photos.length)
            that.uploadPic(photos)
          } else {
            console.log("start update loveinfo")
            if(that.delImgList.length != 0) {
              that.deletePic(that.delImgList)
            } else {
              that.updateLoveInfo()
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
            for(let i=0;i<that.loveDetail.photos.length;i++) {
              if(pic == that.loveDetail.photos[i]) {
                that.loveDetail.photos.splice(i,1)
                break
              }
            }
          }
          data.splice(0,1)
          if(data.length != 0) {
            that.deletePic(data)
          } else {
            that.updateLoveInfo()
          }
          
        },
        fail: err => {
          // handle error
          console.log("delete picture failed!" + err)
        }
      })
    },
    updateLoveInfo: function () {
      const that = this
      wx.cloud.callFunction({
        name: 'dbupdate',
        data: {
          table: 'zy_users',
          _openid: 'testuser1',
          field: 'love_info.' + that.type,
          data: that.loveDetail
        },
        success: function (res) {
          // update parent page data
          var pages = getCurrentPages()
          var prePage = pages[pages.length - 2]
          var type = that.type
          prePage.setData({
            ["userInfo.love_info." + type]: that.loveDetail
          })
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
  },
  

  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['photos'], //从相册选择
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
          for(let i=0;i<this.data.orgImgList.length;i++) {
            if(delPic == this.data.orgImgList[i]) {
              this.data.delImgList.push(delPic)
              break
            }
          }
          for(let i=0;i<this.data.addImgList.length;i++) {
            if(this.data.addImgList[i] == delPic) {
              this.data.addImgList.splice(i,1)
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

  textChange: function(e) {
    let content = e.detail.value
    this.setData({
      "loveDetail.content": content
    })
  },


  Save: function() {
    const that = this
    wx.showLoading({
      title: '正在保存',
    })
    // upload picture
    this.data.dealSave({
      delPics: this.data.delImgList,
      addPics: this.data.addImgList
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const type = this.options.type;
    const curItem = listItem.find((item) => item.type == type);
    var loveDetail = JSON.parse(options.loveDetail)
    this.setData({
      item: curItem,
      loveDetail: loveDetail,
      type: type,
      imgList: loveDetail.photos,
      orgImgList: [].concat(loveDetail.photos),
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