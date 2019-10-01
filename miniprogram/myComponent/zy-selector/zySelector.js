Component({
  properties: {
    selectData: Array,
    index: Number
  },
  data: {
    selectShow: false,//控制下拉列表的显示隐藏，false隐藏、true显示
    // selectData: ['15:10', '15:15', '15:20'],//下拉列表的数据
    // index: 0,//选择的下拉列表下标
  },

  methods: {
    // 点击下拉显示框
    selectTap() {
      this.setData({
        selectShow: !this.data.selectShow
      });
    },
    // 点击下拉列表
    optionTap(e) {
      let Index = e.currentTarget.dataset.index;//获取点击的下拉列表的下标
      this.setData({
        index: Index,
        selectShow: !this.data.selectShow
      });
      this.triggerEvent( 'userChange', { index: Index } )
    }
  }
})