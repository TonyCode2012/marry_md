// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'dev-2019-xe6cj'
});
const _ = db.command;


// 云函数入口函数
exports.main = async (event, context) => {
  var to_openid = event.to_openid
  var from_openid = event.from_openid
  var relationship = event.relationship
  var resObj = {}
  var ids = [{_openid: to_openid},{_openid: from_openid}]
  await db.collection('zy_nexus').where(_.or(ids)).
  get().then(
    async function(res) {
      var nexusArry = res.data
      var fromNexus = null
      var toNexus = null
      if(nexusArry[0]._openid == to_openid) {
        toNexus = nexusArry[0]
        fromNexus = nexusArry[1]
      } else {
        toNexus = nexusArry[1]
        fromNexus = nexusArry[0]
      }
      if(toNexus['friends'][from_openid] == undefined) {
        toNexus['friends'][from_openid] = {
          relationship: relationship,
          completed: fromNexus.completed,
          gender: fromNexus.gender,
          name: fromNexus.name
        }
      } else {
        toNexus['friends'][from_openid]['relationship'] = relationship
      }
      if (fromNexus['friends'][to_openid] == undefined) {
        fromNexus['friends'][to_openid] = {
          relationship: relationship,
          completed: toNexus.completed,
          gender: toNexus.gender,
          name: toNexus.name
        }
      } else {
        fromNexus['friends'][to_openid]['relationship'] = relationship
      }
      // update to user info
      await db.collection('zy_nexus').where({
        _openid: to_openid
      }).update({
        data: {
          friends: toNexus['friends']
        }
      }).then(
        function(res) {
          console.log(res)
        },
        function(err) {
          console.log(err)
        }
      )
      // update from user info
      await db.collection('zy_nexus').where({
        _openid: from_openid
      }).update({
        data: {
          friends: fromNexus['friends']
        }
      }).then(
        function(res) {
          console.log(res)
        },
        function(err) {
          console.log(err)
        }
      )
      resObj = {
        statusCode: 200,
      }
    },
    function(err) {
      resObj = {
        statusCode: 500,
        errMsg: err
      }
    }
  )

  return resObj
}
