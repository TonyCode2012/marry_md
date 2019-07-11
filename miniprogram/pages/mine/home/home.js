// pages/mine/home/home.js

const app = getApp()

 
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {

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
      wx.navigateTo({
        url: '/pages/mine/profile/profile',
      })
    },
    gotoExpect() {
      wx.navigateTo({
        url: '/pages/mine/expect/expect',
      })

    },
    gotoAuthCorp() {
      wx.navigateTo({
        url: '/pages/authcorp/authcorp',
      })
    }
  }
})
