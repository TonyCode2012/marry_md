// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
    env: 'prod-env-2019'
});
const _ = db.command;


exports.main = async (event, context) => {
    console.log(event)
    try {
        var res1 = await db.collection(event.userTable).add({
            data: event.userInfo
        }).then(
            function (res) {
                console.log("add user successfully!" + res)
            },
            function (err) {
                console.log("add user failed!" + res)
            }
        )
        var res2 = await db.collection(event.nexusTable).add({
            data: event.nexusInfo
        }).then(
            function (res) {
                console.log("add user successfully!" + res)
            },
            function (err) {
                console.log("add user failed!" + res)
            }
        )
        return {
            user_table_info: res1,
            nexus_table_info: res2
        }
    } catch (e) {
        console.error(e);
    }
}

