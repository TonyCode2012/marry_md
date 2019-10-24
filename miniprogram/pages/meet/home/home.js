const observer = require("../../../utils/observer.js");
const app = getApp();

const {
    db,
    globalData
} = app


Component({
    options: {
        addGlobalClass: true,
    },
    /**
     * 组件的属性列表
     */
    properties: {
        seekers: Object,
        userIDs: Array,
        authed: Boolean,
    },

    /**
     * 组件的初始数据
     */
    data: {
        // move control
        ListTouchStartPos: 0,
        ListTouchDirection: '',

        isAuth: false,
        tabCur: 0,
        TabCurMax: 2,
        CustomBar: globalData.CustomBar,
        userIdx: 0
    },

    observers: {
    },

    pageLifetimes: {
        show: function() {
            if(globalData.authed) {
                this.setData({
                    authed: true
                })
            }
        }
    },


    ready: function () {
        observer.observe(observer.store, 'isAuth', (value) => {
            this.setData({
                isAuth: value
            })
        })
    },

    /**
     * 组件的方法列表
     */
    methods: {
        tabSelect(e) {
            this.setData({
                tabCur: e.currentTarget.dataset.id,
                scrollLeft: (e.currentTarget.dataset.id - 1) * 60
            })
        },
        userChange(e) {
            var index = e.detail.index
            this.setData({
                userIdx: index
            })
            var openid = this.properties.userIDs[index]
            openid = openid.substring(openid.indexOf(':') + 1, openid.length)
            this.triggerEvent('selectUser', { openid: openid })
        },
        
        // ListTouch触摸开始
        ListTouchStart(e) {
            this.setData({
                ListTouchStartPos: e.touches[0].pageX
            })
        },
        // ListTouch计算方向
        ListTouchMove(e) {
            var shiftDis = e.touches[0].pageX - this.data.ListTouchStartPos
            if(Math.abs(shiftDis) < 50) return
            this.setData({
                ListTouchDirection: shiftDis < 0 ? 'right' : 'left'
            })
        },
        // ListTouch计算滚动
        ListTouchEnd(e) {
            var direction = this.data.ListTouchDirection
            if (direction == '') return
            var tabCur = this.data.tabCur
            if (direction == 'right') {
                if(tabCur < this.data.TabCurMax) {
                    tabCur++
                } else {
                    tabCur = this.data.TabCurMax
                }
            } else {
                if (tabCur > 0) {
                    tabCur--
                } else {
                    tabCur = 0
                }
            }
            this.setData({
                tabCur: tabCur,
                ListTouchDirection: '',
            })
        },
    }
})
