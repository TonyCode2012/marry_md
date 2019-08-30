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
        db.collection('users').where({
          _openid: 'o5lKm5CVkJC-0oaVSWrD9kJHADsg2'
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
      } else {
        // get user information
        that.setData({
          userInfo: JSON.parse(options.seeker)
        })
      }
      
      console.log('user detail', options, this.properties);
      this.setData({
        source: source
      })
    },
    bindLike: function() {
      // TODO: create like event
      wx.navigateTo({
        url: '/pages/index/index?cur=like',
      })
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
