// pages/like/home/home.js
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    matchInfo: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    TabCur: 0,
    scrollLeft: 0,
    modalName: '',
    decision: 'pending',
    ListTouchStartPos: 0,
    ListTouchDirection: '',
    // fromMe: [{
    //   avatar: '',
    //   name: 'Anais DING',
    //   basic_profile: '89年・本科・广告策划・浙江人・现居上海',
    //   decision: 'pending',
    //   date: '6天前'
    // }, {
    //   avatar: '',
    //   name: '皮皮',
    //   basic_profile: '93年・硕士・涉外法务・湖北人・现居深圳',
    //   decision: 'no',
    //   date: '7天前'
    // }, {
    //   avatar: '',
    //   name: '芙洛拉',
    //   basic_profile: '92年・本科・前程无忧・湖南人・现居上海',
    //   decision: 'yes'
    // }],
    // toMe: [{
    //   avatar: '',
    //   name: '向',
    //   basic_profile: '91年・本科・IQVIA・临床观察员・江西・现居上海',
    //   decision: 'pending'
    // }, {
    //   avatar: '',
    //   name: '王小野',
    //   basic_profile: '93年・本科・产品经理・安徽人・现居深圳',
    //   decision: 'yes'
    // }]
  },

  ready: function() {

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
    gotoUserDetail(e) {
      const user = e.currentTarget.dataset.user
      const openid = e.currentTarget.dataset.openid
      wx.navigateTo({
        url: `/pages/member/detail/detail?openid=${openid}`,
      })
    },
    hideModal() {
      this.setData({
        modalName: null
      })
    },
    showModal() {
      this.setData({
        modalName: 'weixinModal'
      })
      return false;
    },
    clip() {
      wx.setClipboardData({
        data: 'xxxxxxxxxxxxxxxxx',
        success(res) {
          wx.getClipboardData({
            success(res) {
              console.log(res.data) // data
            }
          })
        }
      })
    },
    sayYes(e) {
      let index = e.currentTarget.dataset.index
      const decision = e.currentTarget.dataset.decision
      this.data.matchInfo.likeme[index].decision = decision;
       this.setData({
        matchInfo: this.data.matchInfo
      })
    },
    // ListTouch触摸开始
    ListTouchStart(e) {
      this.setData({
        ListTouchStartPos: e.touches[0].pageX
      })
    },

    // ListTouch计算方向
    ListTouchMove(e) {
      this.setData({
        ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStartPos > -100 ? 'right' : 'left'
      })
    },

    // ListTouch计算滚动
    ListTouchEnd(e) {
      if (this.data.ListTouchDirection == 'left') {
        this.setData({
          modalName: e.currentTarget.dataset.target
        })
      } else {
        this.setData({
          modalName: null
        })
      }
      this.setData({
        ListTouchDirection: null
      })
    },
  }
})