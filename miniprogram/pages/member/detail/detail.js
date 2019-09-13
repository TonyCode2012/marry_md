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
    // userId: {
    //   type: String,
    //   value: ''
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
    relationship: "",
    relations: false,
    relationArry: ['请选择你和介绍人的关系', '亲戚', '同事', '朋友', '同学', '其他'],
    relationIndex: 0,
    ship: true,
    array: ['请选择你和介绍人的关系', '朋友', '同学', '亲戚', '同事'],
    index: 0,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    source: '',

    userInfo: {},
    likeTag: "感兴趣",

    avatar: [
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big81005.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big25002.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big91012.jpg'
    ],

    
    innerM: {
      chooseRelations: function (that) {
        wx.showActionSheet({
          itemList: that.data.relationArry,
          complete(res) {
            if (res.tapIndex != undefined && res.tapIndex != 0) {
              that.data.relationIndex = res.tapIndex
              console.log("relationship is:" + that.data.relationArry[that.data.relationIndex])
              // generate relation data and insert into db
              var newRelation = JSON.parse(JSON.stringify(relationData))
              delete newRelation._id
              newRelation.rear = "zhaoyao2"
              newRelation.path.push("zhaoyao2")
              newRelation.relationship.push(that.data.relationArry[that.data.relationIndex])
              // db.collection('transmition').add({
              //   data: newRelation,
              //   success: function (res) {
              //     console.log(res)
              //   },
              //   fail: console.error
              // })
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
                    that.data.innerM.chooseRelations(that)
                  }
                }
              })
            }
          }
        })
      }
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      const that = this
      const {source} = options;
      const _ = db.command
      // get transmition
      if(options.starter != undefined) {
        // show user info by clicking mini card
        db.collection('zy_users').where({
          _openid: 'testuser1'
        }).get({
          success:function(res) {
            that.setData({
              userInfo: res.data[0]
            })
            // get relation between sharer and partner
            db.collection('transmition').where({
              starter: options.starter,
              rear: _.eq(options.rear).or(_.eq("zhaoyao2"))
            }).get({
              success:function(res) {
                if(res.data.length > 1) {
                  that.setData({
                    relationship: true
                  })
                } else {
                  that.data.innerM.chooseRelations(that)
                  relationData = res.data[0]
                }
              },
              fail:function(res) {
                console.log(res)
              }
            })
          },
          fail:function(res) {
            console.log(res)
          }
        })
      } else if(options.openid != undefined) {
        // show user info from other page
        db.collection('zy_users').where({
          _openid: options.openid
        }).get({
          success:function(res) {
            that.setData({
              userInfo: res.data[0]
            })
          },
          fail:function(res) {
            console.log(res)
          }
        })
      } else {
        var userInfo = JSON.parse(options.seeker)
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
          userInfo: userInfo
        })
      }
      
      console.log('user detail', options, this.properties);
      this.setData({
        source: source
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
      let likeInfo = {
        _openid: this.data.userInfo._openid,
        decision: 'pending',
        time: now,
        basic_info: {
          birthday: this.data.userInfo.basic_info.birthday,
          college: this.data.userInfo.basic_info.college,
          company: this.data.userInfo.basic_info.company,
          education: this.data.userInfo.basic_info.education,
          gender: this.data.userInfo.basic_info.gender,
          height: this.data.userInfo.basic_info.height,
          weight: this.data.userInfo.basic_info.weight,
          hometown: this.data.userInfo.basic_info.hometown,
          location: this.data.userInfo.basic_info.location,
          nickName: this.data.userInfo.basic_info.nickName,
          profession: this.data.userInfo.basic_info.profession,
        }
      }
      // update ilike info to db
      var ilikeInfo = app.globalData.userInfo.match_info.ilike
      ilikeInfo.push(likeInfo)
      let likemeInfo = {
        _openid: app.globalData.userInfo._openid,
        decision: 'pending',
        time: now,
        basic_info: {
          birthday: app.globalData.userInfo.basic_info.birthday,
          college: app.globalData.userInfo.basic_info.college,
          company: app.globalData.userInfo.basic_info.company,
          education: app.globalData.userInfo.basic_info.education,
          gender: app.globalData.userInfo.basic_info.gender,
          height: app.globalData.userInfo.basic_info.height,
          weight: app.globalData.userInfo.basic_info.weight,
          hometown: app.globalData.userInfo.basic_info.hometown,
          location: app.globalData.userInfo.basic_info.location,
          nickName: app.globalData.userInfo.basic_info.nickName,
          profession: app.globalData.userInfo.basic_info.profession,
        }
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
          wx.navigateTo({
            url: `/pages/index/index?cur=like`,
          })
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
  }
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
