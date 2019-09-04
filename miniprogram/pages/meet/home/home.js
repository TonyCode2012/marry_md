const observer = require("../../../utils/observer.js");
const app = getApp();

const {
  db,
  globalData
} = app
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    seekerList: Array
  },

  /**
   * 组件的初始数据
   */
  data: { 
    isAuth: false,
    TabCur: 0,
    CustomBar: globalData.CustomBar
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
    tabSelect(e) {
      this.setData({
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id - 1) * 60
      })
    },
  }
})
