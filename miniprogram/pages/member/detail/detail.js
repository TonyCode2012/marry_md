// pages/member/home/home.js

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
    source: ''
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
    }
  }
})
