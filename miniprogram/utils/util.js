const infoData = require('./data.js')

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const stringHash = str => {
    // if (Array.prototype.reduce) {
    //   return this.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    // }
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var character = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

const checkComplete = function (userInfo) {
    var allItemNum = Object.keys(infoData.requiredInfo).length + 1
    var acc = 0
    // compute complete
    if (userInfo.love_info) {
        var allNum = Object.keys(userInfo.love_info).length
        var completeNum = allNum
        for (var key of Object.keys(userInfo.love_info)) {
            var item = userInfo.love_info[key]
            if (item.content == undefined || item.content == "") {
                completeNum--
            }
        }
        if (completeNum / allNum >= infoData.loveInfoCompletePer) acc++
    }
    if (userInfo.basic_info) {
        for (var key of infoData.requiredInfo) {
            var value = userInfo.basic_info[key]
            if (value && value != '') {
                acc++
            }
        }
    }
    return parseInt(acc / allItemNum * 100)
}

const showWechatAuthInfo = function () {
    wx.showModal({
        title: '提示',
        content: '不授权微信登录将无法建立账号编辑信息',
        confirmText: '前去授权',
        cancelText: '暂不登录',
        success(res) {
            if (res.confirm) {
                wx.redirectTo({
                    url: '/pages/index/loading/loading',
                })
            }
        }
    })
}

const getChatID = function(ids) {
    var { talkOID, selfOID } = ids
    var idLen = Math.max(talkOID.length, selfOID.length) / 2
    var chatid = ''
    if (talkOID > selfOID) {
        chatid = talkOID.substring(0, idLen) + selfOID.substring(0, idLen)
    } else {
        chatid = selfOID.substring(0, idLen) + talkOID.substring(0, idLen)
    }
    return chatid
}

const delay = function(milSec) {

    return new Promise(resolve => {

        setTimeout(resolve, milSec)

    })

}


module.exports = {
    formatTime: formatTime,
    formatDate: formatDate,
    stringHash: stringHash,
    checkComplete: checkComplete,
    showWechatAuthInfo: showWechatAuthInfo,
    getChatID: getChatID,
    delay: delay,
}