// pages/recommend/home/home.js
const app = getApp();
const observer = require("../../../utils/observer.js");

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
    isAuth: false
  },
  ready: function(){
    observer.observe(observer.store, 'isAuth', (value)=>{
      this.setData({
        isAuth: value
      })
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
 
  }
})
