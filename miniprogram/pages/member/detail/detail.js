// pages/member/home/home.js

const app = getApp()

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
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    source: '',

    avatar: [
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big81005.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big25002.jpg',
      'https://ossweb-img.qq.com/images/lol/web201310/skin/big91012.jpg'
    ],
    album:[
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG2.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG3.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG4.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG5.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG6.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG7.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG8.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG9.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG10.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG11.jpeg',
      'cloud://test-t2od1.7465-test-t2od1/WechatIMG12.jpeg'
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      const {source} = options;
      console.log('user detail', options, this.properties);
      this.setData({
        source: source
      })
    },
    ViewImage(e) {
      wx.previewImage({
        urls: this.data.album,
        current: e.currentTarget.dataset.url
      });
    },
  }
})
