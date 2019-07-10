//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    PageCur: 'meet'
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  onShareAppMessage() {
    return {
      title: '',
      imageUrl: '',
      path: '/pages/index/index'
    }
  },
})