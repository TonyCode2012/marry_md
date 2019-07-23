'use strict';
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = (event, context, callback) => {

  const db = cloud.database()
  db.collection('books').get().then(value => {
    console.log(value)
  })

  db.collection('todos').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        description: "learn cloud database",
        due: new Date("2018-09-01"),
        tags: [
          "cloud",
          "database"
        ],
        location: new db.Geo.Point(113, 23),
        done: false
      }
    })
    .then(res => {
      console.log(res)
    })
};