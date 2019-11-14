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

    relationMap: {
      family: '亲戚',
      friend: '朋友',
      schoolmate: '同学',
      colleague: '同事'
    }
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
