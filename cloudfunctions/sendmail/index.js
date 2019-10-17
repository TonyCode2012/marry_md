// 云函数入口文件
const cloud = require('wx-server-sdk')
const nodemailer = require("nodemailer");

cloud.init({
  env: 'dev-2019-xe6cj'
})
const db = cloud.database()
const _ = db.command

exports.main = async(event, context) => {
  let openid = cloud.getWXContext().OPENID
  let emailTo = event.email
  let auth_code = Math.floor(Math.random() * 899999 + 100000)

  console.log(event, openid)

  await db.collection('auth').where({
    _openid: openid,
    is_active: true
  }).update({
    data: {
      is_active: false
    }
  })

  await db.collection('auth').add({
    data: {
      _openid: openid,
      auth_code: auth_code.toString(),
      create_date: new Date(),
      is_active: true
    }
  })

  let transporter = nodemailer.createTransport({
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'auth@zouheart.com',
      pass: 'GGWq8tHkLp8AXqvt'
    }
  })

  let info = await transporter.sendMail({
    from: '"zouheart" <auth@zouheart.com>',
    to: emailTo,
    subject: '工作认证校验码',
    text: `您的校验码是：${auth_code}`,
    html: `您的校验码是：<b>${auth_code}</b>`
  })

  console.log('send email:', auth_code, info) 
}
