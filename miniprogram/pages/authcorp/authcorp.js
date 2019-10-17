// miniprogram/pages/authcorp/authcorp.js

const app = getApp()
const {
  db,
  globalData
} = app
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {

    imgList: [],
    TabCur: 0,
    scrollLeft: 0,
    corp: ['思科', '腾讯', '阿里巴巴'],
    corpMap: {
        '思科': 'cisco',
        '腾讯': 'tencent',
        '阿里巴巴': 'alibaba'
    },
    index_corp: 0,
    email: '',
    jobTitle: '',
    authCode: '',
    authed: false
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  submitAuthCorp: async function() {
    const that = this
    let email = this.data.email
    let authCode = this.data.authCode
    let corp = this.data.corp[this.data.index_corp]
    corp = this.data.corpMap[corp]
    let jobTitle = this.data.jobTitle
    
    if (!(email && authCode && corp && jobTitle)) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let res = await db.collection("auth").where({
      _openid: globalData.openid,
      auth_code: authCode,
      is_active: true
    }).get()

    if (!res.data || res.data.length == 0) {
      wx.showToast({
        title: '校验码无效',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let auth = res.data[0];

    // db.collection('auth').doc(auth._id).update({
    //   data: {
    //     is_active: false,
    //     status: 'success'
    //   }
    // })
    wx.cloud.callFunction({
      name: 'dbupdate',
      data: {
        _openid: auth._openid,
        table: 'auth',
        data: {
          is_active: false,
          status: 'success'
        }
      },
      success: function(res) {
        console.log("update pincode status successfully"+res)
      },
      fail: function(err) {
        console.log("update pincode status failed!"+err)
      }
    })

    // let resUsers =  await db.collection('zy_users').where({
    //   _openid: globalData.openid
    // }).get()
    // let user = resUsers.data[0]
    // await db.collection('zy_users').doc(user._id).update({
    //   data: {
    //     auth_info:{
    //       company_auth: {
    //         authed: true,
    //         company_name: corp,
    //         job_title: jobTitle
    //       }
    //     }
    //   }
    // })
    wx.cloud.callFunction({
      name: 'dbupdate',
      data: {
        table: 'zy_users',
        _openid: auth._openid,
        data: {
          auth_info:{
            company_auth: {
              authed: true,
              company_name: corp,
              job_title: jobTitle
            }
          }
        }
      },
      success: function(res) {
        wx.showToast({
          title: '认证成功',
          icon: 'success',
          duration: 2000
        })
        globalData.userInfo.auth_info.company_auth = {
            authed: true,
            company_name: corp,
            job_title: jobTitle
        }
        that.setData({
          authed: true
        })
      },
      fail: function(err) {
        console.log("认证失败,"+err)
      }
    })

    wx.cloud.callFunction({
      name: 'dbupdate',
      data: {
        table: 'zy_nexus',
        _openid: auth._openid,
        data: {
            authed: true,
            company: corp,
        }
      },
      success: function(res) {
        console.log("update nexus table successfully!"+res)
      },
      fail: function(err) {
        console.log("update nexus table failed!"+err)
      }
    })
  },

  getAuthCode: async function() {
    let regx = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
    let email = this.data.email
    if (!(email && regx.test(email))) {
      wx.showToast({
        title: '请填写正确的企业邮箱',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.showToast({
      title: '校验码发送中...',
      icon: 'loading'
    })
    wx.cloud.callFunction({
      name: "sendmail",
      data: {
        email: email
      }
    }).then(res => {
      wx.showToast({
        title: '校验码已发送',
        icon: 'success'
      })
      console.log(res)
    }, res => {
      wx.showToast({
        title: '校验码发送失败',
        icon: 'success'
      })
      console.log(res)
    })
  },
  inputCode: function (e) {
    this.setData({
      authCode: e.detail.value
    })
  },
  inputEmail: function(e) {
    this.setData({
      email: e.detail.value
    })
  },
  inputJobTitle: function(e) {
    this.setData({
      jobTitle: e.detail.value
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
  onShow: async function() {
    let res = await db.collection('zy_users').where({
      _openid: globalData.userInfo._openid,
      auth_info: {
        company_auth: {
          authed: true
        }
      }
    }).get()
    this.setData({
      authed: (res.data.length > 0)
    })
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
