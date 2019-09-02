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
    minValue: {
      type: Number
    },
    maxValue: {
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
    minValue: 0,
    maxValue: 0,
    totalLength: 0,
    bigLength: 0,
    ratio: 0.5,
    sliderLength: 190,
    containerLeft: 68, //标识整个组件，距离屏幕左边的距离
    borderWidth: 68,
    hideOption: '', //初始状态为显示组件
    itemWidth: 17,
    leftUnselectedLen: 0,
    selectedLen: 0,
    rightUnselectedLen: 0,
  },

  observers: {
    'minValue,maxValue': function(minValue,maxValue) {

      if (minValue < this.data.min) minValue = this.data.min
      else if (minValue > this.data.max) minValue = this.data.max
      if (maxValue > this.data.max) maxValue = this.data.max
      else if (maxValue < this.data.min) maxValue = this.data.min
      if (minValue > maxValue) minValue = maxValue

      let leftPos = (minValue - this.data.min) / this.data.range * (this.data.sliderLength - this.data.itemWidth * 1.6)
      let rightPos = (maxValue - this.data.min) / this.data.range * (this.data.sliderLength - this.data.itemWidth * 1.6)
      let leftUnselectedLen = leftPos
      let selectedLen = rightPos - leftPos
      let rightUnselectedLen = this.data.sliderLength - rightPos - this.data.itemWidth * 2

      this.setData({
        leftPos: leftPos,
        rightPos: rightPos,
        leftUnselectedLen: leftUnselectedLen,
        selectedLen: selectedLen,
        rightUnselectedLen: rightUnselectedLen,
      })
    }
  },


  methods: {

    _minMove: function (e) {
      let pagex = e.changedTouches[0].pageX - this.data.borderWidth
      if (pagex > this.data.rightPos) pagex = this.data.rightPos
      else if (pagex < 0) pagex = 0
      let minValue = parseInt(pagex / (this.data.sliderLength - this.data.itemWidth*1.8) * this.data.range + this.data.min)
      let selectedLen = this.data.sliderLength - pagex - this.data.rightUnselectedLen - this.data.itemWidth

      this.setData({
        leftPos: pagex,
        minValue: minValue,
        leftUnselectedLen: pagex,
        selectedLen: selectedLen
      })

      let myEventDetail = { lowValue: minValue }
      this.triggerEvent('lowValueChange',myEventDetail)
    },

    _maxMove: function (e) {
      let pagex = e.changedTouches[0].pageX - this.data.borderWidth
      if (pagex < this.data.leftPos) pagex = this.data.leftPos
      else if (this.data.sliderLength - this.data.itemWidth * 2 < pagex) pagex = this.data.sliderLength - this.data.itemWidth * 2

      let maxValue = parseInt(pagex / (this.data.sliderLength - this.data.itemWidth*1.8) * this.data.range + this.data.min)
      let rightUnselectedLen = this.data.sliderLength - pagex - this.data.itemWidth * 2
      let selectedLen = this.data.sliderLength - this.data.leftUnselectedLen - rightUnselectedLen - this.data.itemWidth

      this.setData({
        rightPos: pagex,
        maxValue: maxValue,
        rightUnselectedLen: rightUnselectedLen,
        selectedLen: selectedLen
      })

      let myEventDetail = { highValue: maxValue }
      this.triggerEvent('highValueChange', myEventDetail)
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  ready: function () {
    // set two-slider
    let minValue = this.data.minValue
    let maxValue = this.data.maxValue
    if(minValue < this.data.min) minValue = this.data.min
    else if(minValue > this.data.max) minValue = this.data.max
    if(maxValue > this.data.max) maxValue = this.data.max
    else if(maxValue < this.data.min) maxValue = this.data.min
    if(minValue > maxValue) minValue = maxValue

    let range = this.data.max - this.data.min + 1
    let leftPos = (minValue - this.data.min) / range * (this.data.sliderLength - this.data.itemWidth*1.6)
    let rightPos = (maxValue - this.data.min) / range * (this.data.sliderLength - this.data.itemWidth*1.6)
    let selectedLen = rightPos - leftPos
    let rightUnselectedLen = this.data.sliderLength - rightPos - this.data.itemWidth * 2

    this.setData({
      leftUnselectedLen: leftPos,
      selectedLen: selectedLen,
      rightUnselectedLen: rightUnselectedLen,
      minValue: minValue,
      maxValue: maxValue,
      leftPos: parseInt(leftPos),
      rightPos: parseInt(rightPos),
      range: range,
    })
  },

})