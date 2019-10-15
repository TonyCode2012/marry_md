// pages/like/home/home.js
const app = getApp()
const {
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
    // match_info: {
    //   type: Object,
    //   value: {}
    // },
    userInfo: {
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
    match_info: {},

  },

  pageLifetimes: {
    show: function() {
      //if(globalData.gotData) {
      if(globalData.isLogin) {
        this.setData({
          'userInfo.match_info': globalData.userInfo.match_info
        })
      }
    }
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
      //const user = e.currentTarget.dataset.user
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

    decide(e) {
      const that = this
      let index = e.currentTarget.dataset.index
      const decision = e.currentTarget.dataset.decision
      this.data.userInfo.match_info.likeme[index].decision = decision;
      wx.cloud.callFunction({
        name: 'likeAction_decide',
        data: {
          table: 'zy_users',
          likefrom_openid: this.data.userInfo.match_info.likeme[index]._openid,
          liketo_openid: this.data.userInfo._openid,
          decision: decision
        },
        success: res=> {
          if (res.result.statuscode == 200) {
            that.setData({
              userInfo: this.data.userInfo
              // match_info: that.data.match_info
            })
          }
          console.log(res)
        },
        fail: res=> {
          console.log(res)
        }
      })
    },
    _deleteLike: function(para) {
      const that = this
      wx.showLoading({
        title: '正在删除',
      })
      wx.cloud.callFunction({
        name: 'likeAction_delete',
        data: {
          table: 'zy_users',
          delItem: para.delItem,
          ilike: {
            myOpenid: para.ilike.fromOpenid,
            hhOpenid: para.ilike.toOpenid
          },
          likeme: {
            myOpenid: para.likeme.fromOpenid,
            hhOpenid: para.likeme.toOpenid
          }
        },
        success: res => {
          wx.hideLoading()
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          })
          console.log("delete "+para.delItem+" item successfully!" + JSON.stringify(res))
          that.setData({
            userInfo: para.userInfo
          })
          app.globalData.userInfo = para.userInfo
          // update father page data
          var param = {userInfo: app.globalData.userInfo}
          that.triggerEvent('userInfoChange',param)
        },
        fail: res => {
          wx.hideLoading()
          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 2000
          })
          console.log(res)
        }
      })
    },
    deleteILike(e) {
      let ilikeItem = (this.data.userInfo.match_info.ilike.splice(e.currentTarget.dataset.index, 1))[0]
      let para = {
        delItem: 'ilike',
        ilike: {
          fromOpenid: this.data.userInfo._openid,
          toOpenid: ilikeItem._openid
        },
        likeme: {
          fromOpenid: ilikeItem._openid,
          toOpenid: this.data.userInfo._openid
        },
        userInfo: this.data.userInfo,
        that: this
      }
      //this.data.methods._deleteLike(data)
      this._deleteLike(para)
    },
    deleteLikeMe(e) {
      let likemeItem = (this.data.userInfo.match_info.likeme.splice(e.currentTarget.dataset.index, 1))[0]
      let para = {
        delItem: 'likeme',
        ilike: {
          fromOpenid: likemeItem._openid,
          toOpenid: this.data.userInfo._openid
        },
        likeme: {
          fromOpenid: this.data.userInfo._openid,
          toOpenid: likemeItem._openid
        },
        userInfo: this.data.userInfo,
        that: this
      }
      //this.data.methods._deleteLike(data)
      this._deleteLike(para)
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

    // get relation
    getRelation(e) {
      wx.showLoading({
        title: '正在处理',
      })
      wx.cloud.callFunction({
        name: 'getRelativeCandidates',
        data: {
          tag: 'test'
        },
        complete: res=> {
          wx.hideLoading()
        }
      })
    }
  }
})
