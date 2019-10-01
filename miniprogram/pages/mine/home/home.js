// pages/mine/home/home.js
const { aboutme } = require("../../../utils/data.js");
const { stringHash } = require("../../../utils/util.js");
const app = getApp()
const db = wx.cloud.database({
  env: 'test-t2od1'
})
 
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    userInfo: Object,
    completePercent: Number,
  },

  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    isExpand: false,
    userInfo: null,
    
    // check data change by hashcode
    hashCode: {
      expect_info: '',
      love_info: '',
    }
  },

  observers: {
    'userInfo': function(data) {
      if(data.love_info == undefined || data.love_info == '') return
      let hashCode = stringHash(JSON.stringify(data.love_info))
      // if hashcode is not changed, return
      if(hashCode == this.data.hashCode.love_info) return
      let love_info = data.love_info
      let completePercent = 0
      for(let i=0;i<aboutme.listItem.length;i++) {
        if(love_info[aboutme.listItem[i].type].content != '') {
          completePercent++
        }
      }
      completePercent = parseInt(completePercent / aboutme.listItem.length * 100)
      this.setData({
        completePercent: completePercent,
        "hashCode.love_info": hashCode,
      })
    }
  },

  ready: function() {
    // const that = this
    // db.collection('zy_users').where({
    //   _openid: 'cisco0'
    // }).get({
    //   success: function(res) {
    //     that.setData({
    //       userInfo: res.data[0]
    //     })
    //   }
    // })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleExpand(){
      this.setData({
        isExpand: !this.data.isExpand
      })
    },
    gotoProfile(){
      let basic_info = JSON.stringify(this.data.userInfo.basic_info)
      let photos = JSON.stringify({
        data: this.data.userInfo.photos
      })
      wx.navigateTo({
        url: `/pages/mine/profile/profile?basic_info=${basic_info}&photos=${photos}`,
      })
    },
    gotoExpect() {
      let expect_info = JSON.stringify(this.data.userInfo.expect_info)
      wx.navigateTo({
        url: `/pages/mine/expect/expect?expect_info=${expect_info}`,
      })

    },
    gotoAuthCorp() {
      wx.navigateTo({
        url: '/pages/authcorp/authcorp',
      })
    }
  }
})
