const observer = require("../../utils/observer.js")
const app = getApp()

Page({
  data: {
    PageCur: 'meet',
    query: null
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  onLoad(query) {
    this.setData({
      query: query
    })
    observer.observe(observer.store, 'PageCur', (value) => {
      this.setData({
        PageCur: value
      })
    })
  },
  onReady() {
    if (this.data.query && this.data.query.cur) {
      this.setData({
        PageCur: this.data.query.cur
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '',
      imageUrl: '',
      path: '/pages/index/index'
    }
  },
})