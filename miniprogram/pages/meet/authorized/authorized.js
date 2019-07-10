// pages/meet/authorized/authorized.js
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
    gotoMyGroup(e) {
      wx.navigateTo({
        url: `/pages/group/home/home`
      })
    }
  }
})
