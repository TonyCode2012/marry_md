// pages/member/home/home.js

const observer = require("../../../utils/observer.js")
const app = getApp()

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // userId: {
    //   type: String,
    //   value: ''
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    source: '',

    avatar: [
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big81005.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big25002.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big91012.jpg'
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      const {source} = options;
      console.log('user detail', options, this.properties);
      this.setData({
        source: source
      })
    },
    bindLike: function() {
      // TODO: create like event 
      wx.navigateTo({
        url: '/pages/index/index?cur=like',
      })
    } 
  }
})
