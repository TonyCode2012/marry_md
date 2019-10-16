const app = getApp()
let {
  db,
  globalData
} = app
let relationData = []
// const db = wx.cloud.database({
//   env: 'test-t2od1'
// })
// const db = wx.cloud.database()
// const transColl = db.collection('transmition')

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
    redirectPath: '/pages/member/detail/detail',
    source: 'meet',
    getFromGroup: globalData.scene == 1008 ? true: false,
    isLogin: globalData.isLogin,
    relationship: "",
    relations: false,
    relationArry: ['请选择你和介绍人的关系', '亲戚', '同事', '朋友', '同学', '其他'],
    relationRArry: ['unknown','family','colleague','friend','schoolmate','other'],
    relationIndex: 0,
    ship: true,
    array: ['请选择你和介绍人的关系', '朋友', '同学', '亲戚', '同事'],
    index: 0,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    basic_item: [
        "birthday",
        "college",
        "company",
        "education",
        "gender",
        "height",
        "weight",
        "hometown",
        "location",
        "nickName",
        "profession",
    ],

    userInfo: {},
    likeTag: "感兴趣",
    showLike: true,

    userIdx: 0,
    userIDs: [],

    avatar: [
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big81005.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big25002.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big91012.jpg'
    ],
    
  },


  /**
   * 组件的方法列表
   */
  methods: {
    chooseRelations: function (openid) {
      const that = this
      wx.showActionSheet({
        itemList: that.data.relationArry,
        complete(res) {
          if (res.tapIndex != undefined && res.tapIndex != 0) {
            that.data.relationIndex = res.tapIndex
            console.log("relationship is:" + that.data.relationArry[that.data.relationIndex])
            wx.showLoading({
              title: '正在分享',
            })
            wx.cloud.callFunction({
              name: 'updateRelation',
              data: {
                to_openid: openid,
                from_openid: globalData.userInfo._openid,
                relationship: that.data.relationRArry[that.data.relationIndex],
              },
              success: res => {
                console.log(res)
                wx.hideLoading()
                wx.showToast({
                  title: '分享成功',
                  icon: 'success',
                  duration: 1500
                })
              },
              fail: err => {
                console.log(err)
                wx.hideLoading()
                wx.showToast({
                  title: '分享失败',
                  icon: 'none',
                  duration: 1500
                })
              }
            })
          } else if (res.tapIndex == undefined || res.tapIndex == 0 ||
            (res.errMsg != undefined && res.errMsg.indexOf("cancel") != -1)) {
            wx.showModal({
              title: '提示',
              content: '不选择与介绍人的关系将无法查看该简历',
              confirmText: '返回首页',
              cancelText: '选择关系',
              success(res) {
                if (res.confirm) {
                  console.log('返回首页')
                  wx.redirectTo({
                    url: '/pages/index/index',
                  })
                } else if (res.cancel) {
                  console.log('选择关系')
                  that.chooseRelations(openid)
                }
              }
            })
          }
        }
      })
    },
    share2Friend: function(e) {
      const that = this
      var openid = e.detail.index
      openid = this.data.userIDs[openid]
      openid = openid.substring(openid.indexOf(':')+1,openid.length)
      this.chooseRelations(openid)
      // wx.showLoading({
      //   title: '正在分享',
      // })
      // wx.cloud.callFunction({
      //   name: 'updateRelation',
      //   data: {
      //     to_openid: openid,
      //     from_openid: globalData.userInfo._openid,
      //     relationship: that.data.relationRArry[that.data.relationIndex],
      //     name: that.data.userInfo.basic_info.nickName
      //   },
      //   success: res => {
      //     console.log(res)
      //     wx.hideLoading()
      //     wx.showToast({
      //       title: '分享成功',
      //       icon: 'success',
      //       duration: 1500
      //     })
      //   },
      //   fail: err => {
      //     console.log(err)
      //     wx.hideLoading()
      //     wx.showToast({
      //       title: '分享失败',
      //       icon: 'none',
      //       duration: 1500
      //     })
      //   }
      // })
    },

    onLoad: function (options) {
      const that = this
      if(!globalData.isLogin) {
          if(options.sopenid == undefined || options.topenid == undefined) {
              console.log("shared parameter error!")
          } else {
            this.setData({
                redirectPath: that.data.redirectPath+'?sopenid='+options.sopenid+'&topenid='+options.topenid
            })
          }
          return
      }
      const {source} = options;
      const _ = db.command
      // get transmition
      if(options.sopenid != undefined) {
        console.log("enter from mini card")
        // show user info by clicking mini card
        db.collection('zy_nexus').where({
          _openid: options.sopenid
        }).get({
          success:function(res) {
            db.collection('zy_users').where({
                _openid: options.topenid
            }).get({
                success: function(res2) {
                    that.setData({
                        userInfo: res2.data[0]
                    })
                },
                fail: function(err) {
                    console.log("Get user info failed!"+err)
                }
            })
            var friends = res.data[0].friends
            var loginID = globalData.userInfo._openid
            if(loginID != undefined && friends.hasOwnProperty(loginID)) {
                that.setData({
                  relationship: true
                })
            } else {
                that.chooseRelations(options.sopenid)
            }
          },
          fail:function(res) {
            console.log(res)
          }
        })
      } else {
        console.log("enter from main port")
        // show user info by clicking mini card
        var userInfo = globalData.userMap.get(options.openid)
        // set show like tag
        if(userInfo.basic_info.gender == globalData.userInfo.basic_info.gender) {
          that.setData({
            showLike: false
          })
        }
        // check if this user info has been existed on the match list
        var loginILike = app.globalData.userInfo.match_info.ilike
        var loginLikeMe = app.globalData.userInfo.match_info.likeme
        for(var i=0;i<loginILike.length;i++) {
          if(loginILike[i]._openid == userInfo._openid) {
            this.setData({
              likeTag: "已感兴趣"
            })
            break
          }
        }
        for(var i=0;i<loginLikeMe.length;i++) {
          if(loginLikeMe[i]._openid == userInfo._openid) {
            this.setData({
              likeTag: "对你感兴趣"
            })
            break
          }
        }
        // get user information
        that.setData({
          userInfo: userInfo,
          userIDs: globalData.userIDs
        })
      }
      
      console.log('user detail', options, this.properties);
      this.setData({
        source: source,
        isLogin: globalData.isLogin
      })
    },
    bindBack: function() {
      wx.navigateTo({
        url: '/pages/index/index?PageCur=meet',
      })
    },
    bindLike: function() {
      const that = this
      if(this.data.likeTag != "感兴趣") return
      // create like info
      wx.showLoading({
        title: '正在处理',
      })
      let now = new Date()
      var basic_info_t = {}
      for(var item of this.data.basic_item) {
          basic_info_t[item] = this.data.userInfo.basic_info[item]
      }
      var portraitURL = ""
      if(this.data.userInfo.photos.length != 0) {
          portraitURL = this.data.userInfo.photos[0]
      } else {
          portraitURL = this.data.userInfo.wechat_info.avatarUrl
      }
      let likeInfo = {
        _openid: this.data.userInfo._openid,
        decision: 'pending',
        time: now,
        basic_info: basic_info_t,
        portraitURL: portraitURL
      }
      // update ilike info to db
      var ilikeInfo = app.globalData.userInfo.match_info.ilike
      ilikeInfo.push(likeInfo)
      var basic_info_g = {}
      for(var item of this.data.basic_item) {
          basic_info_g[item] = app.globalData.userInfo.basic_info[item]
      }
      portraitURL = ""
      if(app.globalData.userInfo.photos.length != 0) {
          portraitURL = app.globalData.userInfo.photos[0]
      } else {
          portraitURL = app.globalData.userInfo.wechat_info.avatarUrl
      }
      let likemeInfo = {
        _openid: app.globalData.userInfo._openid,
        decision: 'pending',
        time: now,
        basic_info: basic_info_g,
        portraitURL: portraitURL
      }
      wx.cloud.callFunction({
        name: 'likeAction',
        data: {
          table: 'zy_users',
          likefrom: {
            openid: app.globalData.userInfo._openid,
            ilike: ilikeInfo
          },
          liketo: {
            openid: that.data.userInfo._openid,
            likeme: likemeInfo
          }
        },
        success: res=> {
          // TO DO
          wx.hideLoading()
          wx.showToast({
            title: '处理成功',
            icon: 'success',
            duration: 2000
          })
          console.log(res)
          app.globalData.userInfo.match_info.ilike = ilikeInfo
          that.setData({
            likeTag: '已感兴趣'
          })
          // wx.redirectTo({
          //   url: `/pages/index/index?cur=like`,
          // })
        },
        fail: res => {
          wx.hideLoading()
          wx.showToast({
            title: '处理失败',
            icon: 'none',
            duration: 2000
          })
          console.log("failed!"+JSON.stringify(res))
        }
      })
      // TODO: create like event
    },
    // bindPickerChange: function (e) {
    //   console.log('picker发送选择改变，携带值为', e.detail.value)
    //   if(e.detail.value != 0) {
    //     this.setData({
    //       relationship: true
    //     })
    //     var newRelation = JSON.parse(JSON.stringify(relationData))
    //     delete newRelation._id
    //     newRelation.rear = "zhaoyao2"
    //     newRelation.path.push("zhaoyao2")
    //     newRelation.relationship.push(this.data.array[e.detail.value])
    //     db.collection('transmition').add({
    //       data: newRelation,
    //       success: function(res) {
    //         console.log(res)
    //       },
    //       fail: console.error
    //     })
    //   }
    //   this.setData({
    //     index: e.detail.value
    //   })
    // },
    ViewImage(e) {
      wx.previewImage({
        urls: this.data.album,
        current: e.currentTarget.dataset.url
      });
    },
    onShareAppMessage: function (res) {
       if (res.from === 'button') {
         // 来自页面内转发按钮
         console.log(res.target)
       }
       return {
         title: "from:"+globalData.userInfo._openid+",user:"+this.data.userInfo._openid,
         //path: `/pages/member/detail/detail?sopenid=${globalData.userInfo._openid}&topenid=${this.data.userInfo._openid}`
         path: '/pages/member/detail/detail?sopenid='+globalData.userInfo._openid+'&topenid='+this.data.userInfo._openid
       }
     }
    },
})

// Page({
//   onShareAppMessage: function (res) {
//     if (res.from === 'button') {
//       // 来自页面内转发按钮
//       console.log(res.target)
//     }
//     return {
//       title: '自定义转发标题',
//       path: '/page/user?id=123'
//     }
//   }
// })
