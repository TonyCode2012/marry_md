// pages/member/list/list.js
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
    gotoDetail(){
      const userId = 'test';
      wx.navigateTo({
        url: `/pages/member/detail/detail?userId=${userId}`
      })
    }
  }
})
