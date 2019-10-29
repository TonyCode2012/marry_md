
const observer = require("../../../utils/observer.js");
const {
    showWechatAuthInfo,
} = require("../../../utils/util.js");
const app = getApp();

const {
    db,
    globalData
} = app

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
      
      // wx.cloud.callFunction({
      //   name: "sendEmail",
      //   data: "",
      //   success: function(res) {
      //     console.log("send mail successfully!")
      //   },
      //   fail: function(res) {
      //     console.error("send mail failed!")
      //   }
      // })
      if(globalData.loginAsTourist) {
          showWechatAuthInfo()
      } else {
          wx.navigateTo({
              url: '/pages/authcorp/authcorp',
          })
      }
    }
  }
})
