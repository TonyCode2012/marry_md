// miniprogram/pages/authcorp/authcorp.js

const app = getApp()
const {
    db,
    globalData
} = app
const _ = db.command

Page({

    /**
     * 页面的初始数据
     */
    data: {

        imgList: [],
        TabCur: 0,
        scrollLeft: 0,
        corp: ['思科','宣伟'],
        // corp: ['思科', '腾讯', '阿里巴巴'],
        emailSuffixMap: {
            '思科': '@cisco.com',
            '腾讯': '@tencent.com',
            '阿里巴巴': '@alibaba.com',
            '宣伟': '@sherwin.com',
        },
        corpMap: {
            '思科': 'cisco',
            '腾讯': 'tencent',
            '阿里巴巴': 'alibaba',
            '宣伟': 'Sherwin-Willinms',
        },
        index_corp: 0,
        email: '',
        emailSuffix: '',
        jobTitle: '',
        authCode: '',
        authed: globalData.nexusInfo.authed
    },
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60
        })
    },
    submitAuthCorp: async function () {
        const that = this
        let email = this.data.email + this.data.emailSuffix
        let authCode = this.data.authCode
        let corp = this.data.corp[this.data.index_corp]
        corp = this.data.corpMap[corp]
        let jobTitle = this.data.jobTitle

        if (!(email && authCode && corp && jobTitle)) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
                duration: 2000
            })
            return
        }

        let res = await db.collection("auth").where({
            _openid: globalData.userInfo.openid,
            auth_code: authCode,
            is_active: true
        }).get()

        if (!res.data || res.data.length == 0) {
            wx.showToast({
                title: '校验码无效',
                icon: 'none',
                duration: 2000
            })
            return
        }
        let auth = res.data[0];

        wx.cloud.callFunction({
            name: 'dbupdate',
            data: {
                table: 'auth',
                idKey: '_openid',
                idVal: auth._openid,
                data: {
                    is_active: false,
                    status: 'success'
                }
            },
            success: function (res) {
                console.log("update pincode status successfully" + res)
            },
            fail: function (err) {
                console.log("update pincode status failed!" + err)
            }
        })

        wx.showLoading({
            title: '正在认证',
        })
        wx.cloud.callFunction({
            name: 'authCompany',
            data: {
                _openid: auth._openid,
                usersData: {
                    auth_info: {
                        company_auth: {
                            authed: true,
                            company: corp,
                            job_title: jobTitle
                        }
                    }
                },
                nexusData: {
                    authed: true,
                    company: corp,
                },
                authedEmailData: {
                    _openid: auth._openid,
                    email: email,
                    auth_date: new Date()
                }
            },
            success: function(res) {
                if(res.result.statusCode != 200) {
                    if(res.result.statusCode == 401) {
                        wx.showToast({
                            title: '该邮箱已经认证!',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                    console.log("Auth failed!" + JSON.stringify(res))
                } else {
                    wx.showToast({
                        title: '认证成功',
                        icon: 'success',
                        duration: 2000
                    })
                    globalData.userInfo.auth_info.company_auth = {
                        authed: true,
                        company: corp,
                        job_title: jobTitle
                    }
                    globalData.userInfo.basic_info.company = corp
                    globalData.userInfo.basic_info.job_title = jobTitle
                    globalData.nexusInfo.authed = true
                    globalData.nexusInfo.company = corp
                    that.setData({
                        authed: globalData.nexusInfo.authed
                    })
                }
            },
            fail: function(err) {
                console.log("Auth failed!" + JSON.stringify(err))
            },
            complete: function(res) {
                wx.hideLoading()
            }
        })
    },

    getAuthCode: async function () {
        let regx = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
        let email = this.data.email + this.data.emailSuffix
        if (!(email && regx.test(email))) {
            wx.showToast({
                title: '请填写正确的企业邮箱',
                icon: 'none',
                duration: 2000
            })
            return
        }
        wx.showToast({
            title: '校验码发送中...',
            icon: 'loading'
        })
        db.collection('authedEmail').where({
            email: email
        }).get().then(
            function(res) {
                if(res.data.length == 0) {
                    wx.cloud.callFunction({
                        name: "sendmail",
                        data: {
                            email: email
                        }
                    }).then(res => {
                        wx.showToast({
                            title: '校验码已发送',
                            icon: 'success'
                        })
                        console.log(res)
                    }, res => {
                        wx.showToast({
                            title: '校验码发送失败',
                            icon: 'success'
                        })
                        console.log(res)
                    })
                } else {
                    wx.showToast({
                        title: '该邮箱已经认证!',
                        icon: 'none',
                        duration: 2000,
                    })
                }
            },
            function(err) {
                console.log("网络问题，请重试")
            }
        )
    },
    corpPickerChange: function (e) {
        let corp = this.data.corp[e.detail.value]
        let emailSuffix = this.data.emailSuffixMap[corp]
        this.setData({
            index_corp: e.detail.value,
            email: '',
            emailSuffix: emailSuffix
        })
    },
    inputCode: function (e) {
        this.setData({
            authCode: e.detail.value
        })
    },
    inputEmail: function (e) {
        this.setData({
            email: e.detail.value
        })
    },
    inputJobTitle: function (e) {
        this.setData({
            jobTitle: e.detail.value
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        let corp = this.data.corp[0]
        let emailSuffix = this.data.emailSuffixMap[corp]
        this.setData({
            emailSuffix: emailSuffix
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (globalData.nexusInfo.authed) {
            this.setData({
                authed: true
            })
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
    onShareAppMessage: function () {

    }
})
