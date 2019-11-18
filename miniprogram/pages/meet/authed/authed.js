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

  observers: {
    'seekers': function(data) {
      console.log(data)
      console.log(this.data)
    }
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
