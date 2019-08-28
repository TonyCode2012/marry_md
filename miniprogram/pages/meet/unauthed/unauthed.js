
const observer = require("../../../utils/observer.js");

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    userListFromParent: {
      type: String,
      value: ""
    },
    seekerList: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    userList: []
  },

  ready: function(options) {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad:function() {
      console.log('unauthed page')
    }
  }
})
