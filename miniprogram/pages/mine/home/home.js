// pages/mine/home/home.js

const app = getApp()
const db = wx.cloud.database({
  env: 'test-t2od1'
})
 
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    userInfo: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    isExpand: false,
  },

  ready: function() {
    // db.collection('users').where({
    //   _openid: 'o5lKm5CVkJC-0oaVSWrD9kJHADsg2'
    // }).get({
    //   success: function(res) {

    //   }
    // })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleExpand(){
      this.setData({
        isExpand: !this.data.isExpand
      })
    },
    gotoProfile(){
      let basic_info = JSON.stringify(this.data.userInfo.basic_info)
      let photos = JSON.stringify({
        data: this.data.userInfo.photos
      })
      wx.navigateTo({
        url: `/pages/mine/profile/profile?basic_info=${basic_info}&photos=${photos}`,
      })
    },
    gotoExpect() {
      let expect_info = JSON.stringify(this.data.userInfo.expect_info)
      wx.navigateTo({
        url: `/pages/mine/expect/expect?expect_info=${expect_info}`,
      })

    },
    gotoAuthCorp() {
      wx.navigateTo({
        url: '/pages/authcorp/authcorp',
      })
    }
  }
})
