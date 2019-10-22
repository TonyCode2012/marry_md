const { aboutme } = require("../../../../../utils/data.js");
const listItem = aboutme.listItem;
const app = getApp()
const { globalData } = app


Page({

    /**
     * 页面的初始数据
     */
    data: {
        canSave: true,
        item: {
            title: '',
            desc: ''
        },
        maxImgNum: 4,
        imgList: [],
        delImgList: [],
        loveDetail: {},
        type: '',
        photoDir: "",
    },

    dealSave: async function () {
        this.uploadPic(0)
    },
    uploadPic: function (i) {
        const that = this
        var imgList = this.data.imgList
        while (i < imgList.length && imgList[i].indexOf("cloud") != -1) i++;
        if (i >= imgList.length) {
            that.deletePic(this.data.delImgList)
            return
        }
        var pic = imgList[i]
        let now = new Date()
        now = Date.parse(now.toUTCString())
        var cloudPath = that.data.photoDir + "/" + that.data.type + '_' + now + '.jpeg'
        wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: pic,
            complete(res) {
                if (res.fileID != undefined) {
                    imgList[i] = res.fileID
                    that.uploadPic(++i)
                } else {
                    console.log("upload file failed!")
                }
            }
        })
    },
    deletePic: async function (pics) {
        const that = this
        if (pics.length == 0) {
            that.updateLoveInfo()
            return
        }
        wx.cloud.deleteFile({
            fileList: pics[0],
            success: res => {
                pics.splice(0, 1)
                that.deletePic(pics)
            },
            fail: err => {
                // handle error
                console.log("delete picture failed!" + err)
            }
        })
    },
    updateLoveInfo: function () {
        const that = this
        console.log(that.data.loveDetail)

        that.data.loveDetail.photos = that.data.imgList
        wx.cloud.callFunction({
            name: 'dbupdate',
            data: {
                table: 'users',
                _openid: globalData.userInfo._openid,
                data: {
                    ['love_info.' + that.data.type]: that.data.loveDetail
                }
            },
            success: function (res) {
                // update parent page data
                globalData.userInfo.love_info[that.data.type] = that.data.loveDetail
                wx.hideLoading()
                wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 2000
                })
            },
            fail: function (res) {
                wx.hideLoading()
                wx.showToast({
                    title: '失败',
                    icon: 'fail',
                    duration: 2000
                })
            },
            complete: function (res) {
                that.setData({
                    canSave: true
                })
            }
        })
    },

    ChooseImage() {
        wx.chooseImage({
            count: 4, //默认9
            sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], //从相册选择
            success: (res) => {
                this.setData({
                    imgList: this.data.imgList.concat(res.tempFilePaths),
                })
            }
        });
    },
    ViewImage(e) {
        wx.previewImage({
            urls: this.data.imgList,
            current: e.currentTarget.dataset.url
        });
    },
    DelImg(e) {
        wx.showModal({
            title: '召唤师',
            content: '确定要删除这段回忆吗？',
            cancelText: '再看看',
            confirmText: '再见',
            success: res => {
                if (res.confirm) {
                    let delPic = this.data.imgList.splice(e.currentTarget.dataset.index, 1)
                    this.setData({
                        imgList: this.data.imgList,
                        delImgList: this.data.delImgList,
                    })
                }
            }
        })
    },

    textChange: function (e) {
        let content = e.detail.value
        this.setData({
            "loveDetail.content": content
        })
    },


    Save: function () {
        const that = this
        wx.showLoading({
            title: '正在保存',
        })
        // disable Save button
        this.setData({
            canSave: false
        })
        // upload picture
        this.dealSave()
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const type = this.options.type;
        const curItem = listItem.find((item) => item.type == type);
        var loveDetail = globalData.userInfo.love_info[type]
        //var loveDetail = JSON.parse(options.loveDetail)
        this.setData({
            item: curItem,
            loveDetail: loveDetail,
            type: type,
            imgList: loveDetail.photos,
            photoDir: globalData.userInfo._openid,
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
