const observer = require("../../utils/observer.js")
const app = getApp()
const { 
  aboutme,
  loveInfoCompletePer 
} = require("../../utils/data.js");

const {
  db,
  globalData
} = app
const _ = db.command

Page({
  data: {
    PageCur: 'meet',
    query: null,
    isLogin: false,
    userInfo: app.globalData.userInfo,
    seekers: {},
    userIDs: [],
    relationMap: {
      family: '亲戚',
      friend: '朋友',
      schoolmate: '同学',
      colleague: '同事'
    },

    // back to home page from other page
    update: true,
  },

  getRelativeCandidates: function () {
    const that = this
    console.log(globalData)
    if (globalData.userInfo._openid == undefined) return
    db.collection('network').where({
      _openid: globalData.userInfo._openid
    }).get({
      success: res => {
        if(res.data.length == 0) {
          wx.hideLoading()
          return
        }
        var paths = res.data[0]
        var nt_relative = paths.nt_relative
        var nt_colleague = paths.nt_colleague
        var nt_company = paths.nt_company
        var candidate2DArry = [nt_relative,nt_colleague,nt_company]
        var ids = []
        // generate request ids
        for(var i in candidate2DArry) {
          for(var openid of Object.keys(candidate2DArry[i])) {
            ids.push({
              _openid: openid
            })
          }
        }
        // deal with relations
        for (var openid of Object.keys(nt_relative)) {
          var relative = nt_relative[openid]
          relative.relation.reverse()
          // relative.relation.reverse()
          for (var relation of relative.relation) {
            relation.relation = that.data.relationMap[relation.relation]
          }
        }
        // get users from database
        wx.cloud.callFunction({
          name: 'getUserLInfo',
          data: {
            ids: ids
          },
          success: res => {
            var users = res.result.data
            var relativeCandidates = []
            var colleagueCandidates = []
            var companyCandidates = []
            var userMap = new Map()
            for (var user of users) {
              if (nt_relative.hasOwnProperty(user._openid)) {
                user.relativeInfo = nt_relative[user._openid]
                relativeCandidates.push(user)
              }
              if(nt_colleague.hasOwnProperty(user._openid)) {
                colleagueCandidates.push(user)
              }
              if(nt_company.hasOwnProperty(user._openid)) {
                companyCandidates.push(user)
              }
              userMap.set(user._openid,user)
            }
            var data = {
              relativeCandidates: relativeCandidates,
              colleagueCandidates: colleagueCandidates,
              companyCandidates: companyCandidates
            }
            that.setData({
              seekers: data
            })
            globalData.seekers = data
            globalData.userMap = userMap
          },
          fail: err => {
            console.log(err)
          }
        })
        wx.hideLoading()
      },
      fail: err => {
        wx.hideLoading()
        console.log(err)
      }
    })
  },

  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },

  // used update changed user info by sub pages
  updateUserInfo(e) {
    this.setData({
      userInfo: e.detail.userInfo
    })
  },

  // when select user,get related info
  selectUser(e) {
    const that = this
    // clear previous seekers
    that.setData({
      seekers: {}
    })
    wx.showLoading({
      title: '加载中...',
    })
    console.log(e.detail.openid)
    db.collection('users').where({
      _openid: e.detail.openid
    }).get({
      success: function (res) {
        app.globalData.userInfo = res.data[0]
        let userInfo = app.globalData.userInfo
        that.setData({
          userInfo: userInfo,
        })
        that.setCompleteAndAuthd(userInfo)
        that.setLikePortrait(userInfo)
        // get network resource
        that.getRelativeCandidates()
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
      }
    })
  },
  // compute completed
  setCompleteAndAuthd: async function(userInfo) {
    if(userInfo.love_info != undefined) {
        // compute complete
        var completed = true
        var allNum = Object.keys(userInfo.love_info).length
        var completeNum = allNum
        for(var key of Object.keys(userInfo.love_info)) {
            var item = userInfo.love_info[key]
            if(item.content == undefined || item.content == "") {
                completed--
            }
        }
        if(completeNum/allNum < loveInfoCompletePer) completed = false
        // get auth info
        var res = await db.collection('nexus').where({
            _openid: userInfo._openid
        }).get()
        globalData.userInfo.authed = res.data[0].authed
        globalData.userInfo.completed = completed
        this.setData({
            'userInfo.completed': completed,
            'userInfo.authed': globalData.userInfo.authed
        })
    }
  },
  // set like info seeks head portrait
  setLikePortrait: function(userInfo) {
    if(userInfo.match_info == undefined) return
    const that = this
    var match_info = userInfo.match_info
    var tags = ['ilike','likeme']
    var likeOpenids = []
    for(var tag of tags) {
        var likeItem = match_info[tag]
        for(var item of likeItem) {
            likeOpenids.push({
                _openid: item._openid
            })
        }
    }
    wx.cloud.callFunction({
        name: 'getUserPortrait',
        data: {
            ids: likeOpenids
        },
        success: function(res) {
            var o2p = res.result.data
            for(var tag of tags) {
                var likeItem = match_info[tag]
                for(var item of likeItem) {
                    item.portraitURL = o2p[item._openid]
                }
            }
            that.setData({
                'userInfo.match_info': match_info
            })
        },
        fail: function(err) {
            console.log("get like info portrait failed!"+JSON.stringify(err))
        }
    })
  },

  onLoad(query) {
    if (!app.globalData.isLogin){
      return false
    }
    // get network resource
    if(this.data.update) {
      this.getRelativeCandidates()
    }

    this.setData({
      query: query,
      isLogin: app.globalData.isLogin,
      userInfo: globalData.userInfo
    })
    // set completed info
    this.setCompleteAndAuthd(globalData.userInfo)
    this.setLikePortrait(globalData.userInfo)
    

    // get seekers info from db
    const that = this
    const _ = db.command
    // get my profile from db
    wx.cloud.callFunction({
      name: 'getAuthedUserID',
      data: {},
      success: res=> {
        var userIDs = ['请选择ID'].concat(res.result.data)
        that.setData({
          userIDs: userIDs
        })
        globalData.userIDs = userIDs
      }
    })
    // if(globalData.gotData) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     seekers: app.globalData.seekers
    //   })
    // } else {
    //   wx.showLoading({
    //     title: '加载中...',
    //   })
    //   db.collection('users').where({
    //     _openid: openid
    //   }).get({
    //     success: function(res) {
    //       app.globalData.userInfo = res.data[0]
    //       let userInfo =  app.globalData.userInfo
    //       that.setData({
    //         userInfo: userInfo,
    //       })
    //       // get network resource
    //       that.data.methods.getRelativeCandidates(that)
    //       globalData.gotData = true
    //     },
    //     fail: function(res) {
    //       console.log(res)
    //       wx.hideLoading()
    //     }
    //   })
    // }
  },

  onReady() {
    if (this.data.query && this.data.query.cur) {
      this.setData({
        PageCur: this.data.query.cur
      })
      if(this.data.query.update) {
        this.data.update = this.data.query.update
      }
    }

  },

  onShareAppMessage() {
    return {
      title: '',
      imageUrl: '',
      path: '/pages/index/index'
    }
  },
})
