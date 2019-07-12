// pages/meet/auth/auth.js

const observer = require("../../../utils/observer.js");

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
  ready: function () { 
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
    gotoAuthorized(){
      observer.store.isAuth = true;
    },
    gotoAuthCorp(){
      wx.navigateTo({
        url: '/pages/authcorp/authcorp',
      })
    }
  }
})
