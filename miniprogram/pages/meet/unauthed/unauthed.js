const app = getApp()
const {
  db,
  globalData
} = app
const _ = db.command

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tabCur: Number,
    seekers: Object
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    networkCandidates: [],
    bigCompanyCandidates: [],
    myCompanyCandidates: [],

    relativeCandidates: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
