// pages/member/list/list.js

const app = getApp()

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    source: {
      type: String,
      value: ''
    },
    seekerList: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    seekers: []
  },


  ready: function (options) {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoDetail(option){
      console.log(option.currentTarget.dataset.info)
      const seeker = option.currentTarget.dataset.info
      let seekerInfo = JSON.stringify(seeker)
      const userId = 'test';
      const source = this.properties.source;
      wx.navigateTo({
        url: `/pages/member/detail/detail?userId=${userId}&source=${source}&seeker=${seekerInfo}`
      })
    }
  }
})
