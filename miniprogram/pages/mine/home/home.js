// pages/mine/home/home.js
const { aboutme } = require("../../../utils/data.js");
const { stringHash } = require("../../../utils/util.js");
const app = getApp()
const {
    globalData
} = app
const db = wx.cloud.database({
    env: 'dev-2019-xe6cj'
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
    authed: false,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    isExpand: false,
    userInfo: null,
    portraitURL: "",
    
    // check data change by hashcode
    globalUserHash: "",
    hashCode: {
      expect_info: '',
      love_info: '',
    }
  },

  observers: {
    'userInfo': function(data) {
      const that = this
      const userInfo = this.data.userInfo
      if(data.love_info == undefined || data.love_info == '') return
      let hashCode = stringHash(JSON.stringify(data.love_info))
      // if hashcode is changed, update
      if(hashCode != this.data.hashCode.love_info) {
        let love_info = data.love_info
        let completePercent = 0
        for(let i=0;i<aboutme.listItem.length;i++) {
          var loveInfo_item = love_info[aboutme.listItem[i].type]
          if (loveInfo_item != undefined && loveInfo_item.content != '') {
            completePercent++
          }
        }
        completePercent = parseInt(completePercent / aboutme.listItem.length * 100)
        this.setData({
          completePercent: completePercent,
          "hashCode.love_info": hashCode,
        })
      }
      // get user auth info
      db.collection('zy_nexus').where({
          _openid: userInfo._openid
      }).get().then(
          function(res) {
              if(res.data.length < 0) return
              var authed = false
              var nexusInfo = res.data[0]
              if(nexusInfo.authed!=undefined && nexusInfo.authed) {
                  authed = true
              }
              that.setData({
                authed: authed
              })
          },
          function(err) {
              console.log("get nexus info failed!")
          }
      )
      // add user head portrait
      var portraitURL = ""
      if(userInfo.photos.length != 0 ) {
          portraitURL = userInfo.photos[0]
          wx.cloud.getTempFileURL({
            fileList: [portraitURL],
            success: res => {
              // fileList 是一个有如下结构的对象数组
              // [{
              //    fileID: 'cloud://xxx.png', // 文件 ID
              //    tempFileURL: '', // 临时文件网络链接
              //    maxAge: 120 * 60 * 1000, // 有效期
              // }]
              portraitURL = res.fileList[0].tempFileURL
              that.setData({
                portraitURL: portraitURL
              })
              console.log(res.fileList)
            },
            fail: console.error
          })
      } else if(userInfo.wechat_info.avatarUrl != undefined) {
          portraitURL = userInfo.wechat_info.avatarUrl
          that.setData({
              portraitURL: portraitURL
          })
      } else {
          console.log("Set portrait failed!")
      }
    }
  },

  pageLifetimes: {
      show: function() {
        // monitor global userInfo change
        var globalUserHash = stringHash(JSON.stringify(globalData.userInfo))
        if(this.data.globalUserHash != globalUserHash) {
          if(globalData.isLogin) {
            this.setData({
                userInfo: globalData.userInfo,
                authed: globalData.userInfo.auth_info.company_auth.authed,
                globalUserHash: globalUserHash
            })
          }
        }
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
      wx.navigateTo({
        url: '/pages/mine/profile/profile',
      })
    },
    gotoExpect() {
      wx.navigateTo({
        url: '/pages/mine/expect/expect',
      })

    },
    gotoAuthCorp() {
      wx.navigateTo({
        url: '/pages/authcorp/authcorp',
      })
    }
  }
})
