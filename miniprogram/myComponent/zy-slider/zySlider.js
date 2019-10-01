// miniprogram/pages/mine/expect/expect.js


Component({

  /**
   * 页面的初始数据
   */
  properties: {
    min: {
      type: Number,
      value: 21
    },
    max: {
      type: Number,
      value: 50
    },
    lowValue: {
      type: Number
    },
    highValue: {
      type: Number
    },
    unit: {
      type: String,
      value: ''
    }
  },

  data: {

    min: 21,
    max: 50,
    range: 0,
    leftPos: 0,
    rightPos: 100,
    rightestPos: 100,
    lowValue: 0,
    highValue: 0,
    totalLength: 0,
    bigLength: 0,
    ratio: 0.5,
    sliderLength: 190,
    containerLeft: 0, //标识整个组件，距离屏幕左边的距离
    hideOption: '', //初始状态为显示组件
    itemWidth: 20,
  },

  observers: {
    'lowValue,highValue': function(lowValue,highValue) {

      if (lowValue < this.data.min) lowValue = this.data.min
      else if (lowValue > this.data.max) lowValue = this.data.max

      if (highValue > this.data.max) highValue = this.data.max
      else if (highValue < this.data.min) highValue = this.data.min

      if (lowValue > highValue) lowValue = highValue
      if (highValue < lowValue) highValue = lowValue

      let leftPos = (lowValue - this.data.min) / this.data.range * this.data.rightestPos
      let rightPos = (highValue - this.data.min) / this.data.range * this.data.rightestPos

      this.setData({
        // leftPos: leftPos,
        // rightPos: rightPos,
      })
    }
  },


  methods: {

    _minMove: function (e) {
      let pagex = e.changedTouches[0].pageX - this.data.containerLeft - this.data.itemWidth * 0.5
      // console.log(e.changedTouches[0].pageX)
      if (pagex > this.data.rightPos) pagex = this.data.rightPos
      else if (pagex < 0) pagex = 0

      let lowValue = parseInt(pagex / this.data.rightestPos * this.data.range + this.data.min)

      if(lowValue > this.data.highValue) lowValue = this.data.highValue

      this.setData({
        leftPos: pagex,
        // lowValue: lowValue,
      })

      let myEventDetail = { lowValue: lowValue }
      this.triggerEvent('lowValueChange',myEventDetail)
    },

    _maxMove: function (e) {
      let pagex = e.changedTouches[0].pageX - this.data.containerLeft - this.data.itemWidth * 1.5
      // console.log(e.changedTouches[0].pageX)
      if (pagex < this.data.leftPos) pagex = this.data.leftPos
      else if (pagex > this.data.rightestPos) pagex = this.data.rightestPos

      let highValue = parseInt(pagex / this.data.rightestPos * this.data.range + this.data.min)

      if(highValue < this.data.lowValue) highValue = this.data.lowValue

      this.setData({
        rightPos: pagex,
        // highValue: highValue,
      })

      let myEventDetail = { highValue: highValue }
      this.triggerEvent('highValueChange', myEventDetail)
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  ready: function () {
    const that = this
    const query = wx.createSelectorQuery().in(this)
    query.select('#scrollLine').boundingClientRect(function (res) {
      let containerLeft = res.left
      let sliderLength = res.right - res.left
      let rightestPos = sliderLength - that.data.itemWidth * 1.5
      // set two-slider
      let lowValue = that.data.lowValue
      let highValue = that.data.highValue
      if(lowValue < that.data.min) lowValue = that.data.min
      else if(lowValue > that.data.max) lowValue = that.data.max
      if(highValue > that.data.max) highValue = that.data.max
      else if(highValue < that.data.min) highValue = that.data.min
      if(lowValue > highValue) lowValue = highValue

      let range = that.data.max - that.data.min + 1
      let leftPos = (lowValue - that.data.min) / range * rightestPos
      let rightPos = (highValue - that.data.min) / range * rightestPos


      that.setData({
        lowValue: lowValue,
        highValue: highValue,
        leftPos: leftPos,
        rightPos: rightPos,
        range: range,
        containerLeft: containerLeft,
        sliderLength: sliderLength,
        rightestPos: rightestPos
      })
    }).exec()
  },

})