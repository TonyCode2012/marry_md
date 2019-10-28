const {
    formatDate,
    checkComplete,
    stringHash
} = require('../../../utils/util.js')
const {
    aboutme,
    weightRange,
    heightRange,
    educationRange,
    jobRange,
    incomeRange,
    requiredInfo
} = require('../../../utils/data.js')

const app = getApp()
const {
    globalData
} = app
const db = wx.cloud.database({
    env: 'dev-2019'
})
Page({

    /**
     * 页面的初始数据
     */
    data: {

        corpMap: {
            'cisco': '思科',
            'tencent': '腾讯',
            'alibaba': '阿里巴巴',
            'Sherwin-Willinms': '宣伟',
        },

        canSave: true,
        canShare: false,

        basic_info: {},
        love_info: {},
        imgList: [],      // pic to show on GUI
        orgAllHash: "",
        delImgList: [],   // can only be cloud address
        type: "profile",

        weightIndex: 20,
        weightRange: weightRange,

        heightIndex: 20,
        heightRange: heightRange,

        educationIndex: 1,
        educationRange: educationRange,

        incomeIndex: 0,
        incomeRange: incomeRange,

        rangeArry: ['weight', 'height', 'education', 'income'],
        rangeIndexObj: {
            weightIndex: 0,
            heightIndex: 0,
            educationIndex: 0,
            incomeIndex: 0
        },

        // auth info
        authed: false,

        // aboutme info variable 
        completePercent: 0,
        isExpand: false,
        loveInfoHash: "",
        basicInfoHash: "",

        // file folder on cloud
        photoDir: "",

        // monitor data change
        dataChanged: false,
    },


    watch: {
        basic_info: function(data,that) {
            that.setDataChanged()
        },
        //love_info: function(data,that) {
        //    that.setDataChanged()
        //},
        imgList: function(data,that) {
            that.setDataChanged()
        }
    },

    calOrgAllHash() {
        var basic_info = JSON.stringify(this.data.basic_info)
        var love_info = JSON.stringify(this.data.love_info)
        var imgList = JSON.stringify(this.data.imgList)
        
        return stringHash(basic_info+love_info+imgList)
    },
    setDataChanged() {
        var allHash = this.calOrgAllHash()
        var dataChanged = false
        var canShare = checkComplete({
            basic_info: this.data.basic_info,
            love_info: this.data.love_info,
        })
        if(allHash != this.data.orgAllHash) {
            dataChanged = true
        }
        this.setData({
            dataChanged: dataChanged,
            canShare: canShare,
        })
    },

    toggleExpand() {
        this.setData({
            isExpand: !this.data.isExpand
        })
    },

    bindInfoChange(e) {
        let type = e.currentTarget.dataset.type
        let value = e.currentTarget.dataset.value
        this.data.basic_info[type] = value
        this.setData({
            //['basic_info.' + type + '']: value
            basic_info: this.data.basic_info,
        })
    },
    bindInfoInput(e) {
        let type = e.currentTarget.dataset.type
        let value = e.detail.value
        this.data.basic_info[type] = value
        this.setData({
            //['basic_info.' + type + '']: value
            basic_info: this.data.basic_info,
        })
    },
    bindInfoRange(e) {
        let type = e.currentTarget.dataset.type
        let value = this.data[type + 'Range'][e.detail.value]
        this.data.basic_info[type] = value
        this.setData({
            //['basic_info.' + type + '']: value,
            basic_info: this.data.basic_info,
            ['rangeIndexObj.' + type + 'Index']: e.detail.value
        })
    },
    bindInfoRegion(e) {
        let type = e.currentTarget.dataset.type
        let value = e.detail.value
        this.data.basic_info[type] = value
        this.setData({
            //['basic_info.' + type + '']: value
            basic_info: this.data.basic_info,
        })
    },


    Save: function (e) {
        const that = this
        this.data.basic_info.company = globalData.userInfo.auth_info.company_auth.company
        globalData.userInfo.basic_info = this.data.basic_info
        globalData.nexusInfo.completed = checkComplete(globalData.userInfo)
        //if (!globalData.nexusInfo.completed) {
        //    wx.showModal({
        //        title: '提示',
        //        content: '带*号为必填选项，否则将无法发起感兴趣',
        //        confirmText: '继续填写',
        //        cancelText: '保存',
        //        success(res) {
        //            if (res.cancel) {
        //                wx.showLoading({
        //                    title: '正在保存',
        //                })
        //                // disable Save button
        //                that.setData({
        //                    canSave: false
        //                })
        //                that.dealSave()
        //            }
        //        }
        //    })
        //} else {
        //    wx.showLoading({
        //        title: '正在保存',
        //    })
        //    // disable Save button
        //    that.setData({
        //        canSave: false
        //    })
        //    that.dealSave()
        //}
        wx.showLoading({
            title: '正在保存',
        })
        // disable Save button
        that.setData({
            canSave: false
        })
        that.dealSave()
        // after change user profile, update related completed property
        wx.cloud.callFunction({
            name: 'dbupdate',
            data: {
                table: 'nexus',
                _openid: globalData.userInfo._openid,
                data: {
                    completed: globalData.nexusInfo.completed
                }
            },
            success: function (res) {
                console.log("update completed status successfully!" + JSON.stringify(res))
            },
            fail: function (err) {
                console.log("update completed status failed!" + JSON.stringify(err))
            }
        })
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
            that.updateBasicInfo()
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
    updateBasicInfo: function () {
        const that = this
        var dt = new Date()
        dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
        var timeStr = dt.toLocaleString()

        console.log(that.data.basic_info)

        // update parent page data
        globalData.userInfo.basic_info = that.data.basic_info
        globalData.userInfo.photos = that.data.imgList
        var userInfoHash = stringHash(JSON.stringify(globalData.userInfo))
        if (userInfoHash != globalData.userInfoHash) {
            globalData.userInfoHash = userInfoHash
            wx.cloud.callFunction({
                name: 'dbupdate',
                data: {
                    table: 'users',
                    _openid: globalData.userInfo._openid,
                    data: {
                        basic_info: that.data.basic_info,
                        photos: that.data.imgList,
                        time: timeStr,
                    }
                },
                success: function (res) {
                    that.setData({
                        canShare: globalData.nexusInfo.authed && globalData.nexusInfo.completed,
                        orgAllHash: that.calOrgAllHash(),
                        dataChanged: false,
                    })
                    wx.hideLoading()
                    wx.showToast({
                        title: '成功',
                        icon: 'success',
                        duration: 2000
                    })
                    // update related neuxs info
                    wx.cloud.callFunction({
                        name: 'dbupdate',
                        data: {
                            table: 'nexus',
                            _openid: globalData.userInfo._openid,
                            data: {
                                gender: globalData.userInfo.basic_info.gender,
                                name: globalData.userInfo.basic_info.nickName,
                            }
                        },
                        success: function(res) {
                            console.log("Update related nexus info successfully!",res)
                        },
                        fail: function(err) {
                            console.log("Update related nexus info failed!",err)
                        },
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
                        canSave: true,
                    })
                }
            })
        } else {
            wx.hideLoading()
            wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
            })
            that.setData({
                canSave: true
            })
        }
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
                    var delPic = this.data.imgList.splice(e.currentTarget.dataset.index, 1)
                    if (delPic[0].indexOf("cloud") != -1) {
                        this.data.delImgList.push(delPic)
                    }
                    this.setData({
                        imgList: this.data.imgList,
                        delImgList: this.data.delImgList,
                    })
                }
            }
        })
    },
    gotoAuthCorp() {
      wx.navigateTo({
        url: '/pages/authcorp/authcorp',
      })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // get basic info
        let basic_info = globalData.userInfo.basic_info
        basic_info.company = globalData.userInfo.auth_info.company_auth.company
        let imgList = globalData.userInfo.photos
        let rangeIndexObj = {
            weightIndex: 0,
            heightIndex: 0,
            educationIndex: 0,
            incomeIndex: 0
        }
        // initial range property
        for (let j = 0; j < this.data.rangeArry.length; j++) {
            let range = this.data.rangeArry[j]
            let concretRange = this.data[range + 'Range']
            // auto set height education
            if (basic_info[range] == undefined || basic_info[range] == '') {
                basic_info[range] = concretRange[0]
            }
            for (let i = 0; i < concretRange.length; i++) {
                if (concretRange[i] == basic_info[range]) {
                    rangeIndexObj[range + 'Index'] = i
                    break
                }
            }
        }
        this.setData({
            basic_info: basic_info,
            love_info: globalData.userInfo.love_info,
            imgList: imgList,
            rangeIndexObj: rangeIndexObj,
            photoDir: globalData.userInfo._openid,
            authed: globalData.nexusInfo.authed,
            canShare: globalData.nexusInfo.authed && globalData.nexusInfo.completed,
        })
        this.data.orgAllHash = this.calOrgAllHash()

        // set watcher
        app.setWatcher(this.data,this.watch, this)
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
        const that = this
        // check if love info changed
        const love_info = globalData.userInfo.love_info
        var loveInfoHash = stringHash(JSON.stringify(love_info))
        // if love_info hashcode is changed, update
        if (loveInfoHash != this.data.loveInfoHash) {
            let completePercent = 0
            for (let i = 0; i < aboutme.listItem.length; i++) {
                var loveInfo_item = love_info[aboutme.listItem[i].type]
                if (loveInfo_item != undefined && loveInfo_item.content != '') {
                    completePercent++
                }
            }
            completePercent = parseInt(completePercent / aboutme.listItem.length * 100)
            this.setData({
                completePercent: completePercent,
                loveInfoHash: loveInfoHash,
                love_info: love_info
            })
        }
        // if authed info changed, update
        const basic_info = globalData.userInfo.basic_info
        var basicInfoHash = stringHash(JSON.stringify(basic_info))
        if(basicInfoHash != that.data.basicInfoHash) {
            that.data.basicInfoHash = basicInfoHash
            if(globalData.nexusInfo.authed) {
                var checkedUserInfo = {
                    basic_info: that.data.basic_info,
                    love_info: love_info,
                }
                that.setData({
                    //'basic_info.company': globalData.userInfo.auth_info.company_auth.company,
                    //'basic_info.job_title': globalData.userInfo.auth_info.company_auth.job_title,
                    basic_info: basic_info,
                    authed: globalData.nexusInfo.authed,
                    canShare: checkComplete(checkedUserInfo),
                })
            }
        }
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
    checkShareStatus: function(res) {
        wx.showToast({
            title: '请完成认证和完善资料，否则无法分享',
            icon: 'none',
            duration: 2000
        })
    },
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        var openid = globalData.userInfo._openid
        var imageUrl = globalData.userInfo.wechat_info.avatarUrl
        if(this.data.imgList.length != 0) {
            imageUrl = this.data.imgList[0]
        }
        // generate description
        const basic_info = this.data.basic_info
        var loc = basic_info.location[0]
        if(loc.indexOf("黑龙江")!=-1 || loc.indexOf("内蒙古")!=-1) loc = loc.substring(0,3)
        else loc = loc.substring(0,2)
        var home = basic_info.hometown[0]
        if(home.indexOf("黑龙江")!=-1 || home.indexOf("内蒙古")!=-1) home = home.substring(0,3)
        else home = home.substring(0,2)
        var job = basic_info.job_title
        job = job ? job : ''
        var age = basic_info.birthday.substring(2,4)
        var desc = "「" + loc + "」" + age + "年 身高" + basic_info.height + " " + 
            job + (basic_info.gender=='male'?'小哥哥,':'小姐姐,') + 
            home + "人," + basic_info.education + "学位"
        return {
            //title: "from:" + openid + ",user:" + openid,
            title: desc,
            imageUrl: imageUrl,
            path: '/pages/member/detail/detail?sopenid=' + openid + '&topenid=' + openid,
        }
    }
})
