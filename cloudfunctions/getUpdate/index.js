// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'prod-env-2019'
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    return await db.collection(event.table).where({
        _openid: event._openid
    }).get().then(
        function (res) {
            if (res.data.length != 0) {
                var result = res.data[0]
            } else {
                console.log('Get table:' + event.table + ' on _openid:' + event._openid + 'failed!')
            }
        },
        function (err) {
            console.log(err)
        }
    )
}
