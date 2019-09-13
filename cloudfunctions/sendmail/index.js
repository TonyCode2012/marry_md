// 云函数入口文件
const cloud = require('wx-server-sdk')
const nodemailer = require("nodemailer");

cloud.init()

var transporter = nodemailer.createTransport({
  // service: 'qq',
  host: "smtpdm.aliyun.com",
  port: 465,               // SMTP 端口
  secure: true,            // 使用 SSL
  auth: {
    user: '362797060@qq.com',   //发邮件邮箱
    pass: 'rmbiksifkublbjjf'        //此处不是qq密码是
  }
});
var mailOptions = {
  from: '362797060@qq.com',   // 发件地址
  to: 'yaoz@cisco.com',    // 收件列表
  subject: 'test send email',      // 标题
  text: 'test send email',
  html: "<b>Hello world?</b>"
};

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("Start to sendemail")
  //开始发送邮件
  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: ' + info.response);
  return info
}

// // 云函数入口函数
// exports.main = async (event, context) => {
//   const wxContext = cloud.getWXContext()

//   return {
//     event,
//     openid: wxContext.OPENID,
//     appid: wxContext.APPID,
//     unionid: wxContext.UNIONID,
//   }
// }