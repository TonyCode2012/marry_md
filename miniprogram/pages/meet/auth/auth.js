// pages/meet/auth/auth.js
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoUser(){
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const indexPage = pages[0];
        indexPage.setData({
          PageCur: "mine"
        })
      }
    },
    gotoGroup(){
      wx.navigateTo({
        url: '/pages/group/home/home',
      })
    }
  }
})
