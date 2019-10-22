// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'dev-2019-xe6cj'
});
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
    return await db.collection('nexus').where({
        chance: 0
    }).update({
        data: {
            chance: 1
        }
    }).then(
        function(res) {
            console.log("Update chance successfully"+JSON.stringify(res))
        },
        function(err) {
            console.log("Update chance failed!"+JSON.stringify(err))
        }
    )
}
