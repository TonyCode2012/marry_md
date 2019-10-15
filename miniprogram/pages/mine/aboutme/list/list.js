// pages/mine/aboutme/list/list.js
const {aboutme} = require("../../../../utils/data.js");

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    loveInfo: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    listItem: aboutme.listItem
  },

  /**
   * 组件的方法列表
   */
  methods: {
    gotoEdit(e){
      const type = e.currentTarget.dataset.type;
      //const loveDetail = JSON.stringify(this.data.loveInfo[type])
      wx.navigateTo({
        url: `/pages/mine/aboutme/edit/edit?type=${type}`
      })
    }
  }
})
