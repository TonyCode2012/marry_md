// pages/like/home/home.js
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
    TabCur: 0,
    scrollLeft: 0,
    modalName: '',
    decision: 'pending'
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
    gotoUserDetail(e){
      const user = e.currentTarget.dataset.user;
      wx.navigateTo({
        url: `/pages/member/detail/detail?user=${user}`,
      })
    },
    hideModal(){
      this.setData({
        modalName: null
      })
    },
    showModal(){
      this.setData({
        modalName: 'weixinModal'
      })
      return false;
    },
    clip(){
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
    sayYes(e){

      const decision = e.currentTarget.dataset.decision
      this.setData({
        decision: decision
      })
    },
    // ListTouch触摸开始
    ListTouchStart(e) {
      this.setData({
        ListTouchStart: e.touches[0].pageX
      })
    },

    // ListTouch计算方向
    ListTouchMove(e) {
      this.setData({
        ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > -100 ? 'right' : 'left'
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
