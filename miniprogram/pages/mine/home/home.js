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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoProfile(){
      wx.navigateTo({
        url: '/pages/mine/profile/profile',
      })
    }
  }
})
