// 云函数入口文件
const cloud = require('wx-server-sdk')
const HttpClient = require("baidu-aip-sdk").HttpClient;
const AipOcrClient = require("baidu-aip-sdk").ocr;

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

    var statusCode = 200

    // 设置APPID/AK/SK
    var APP_ID = "17573319";
    var API_KEY = "ZYQfdG3QCGjenM8S9fEGstcb";
    var SECRET_KEY = "1xTYQm7lPTL4BV0hzeLxvnbBGLS1GBtB";
    
    // 新建一个对象，建议只保存一个对象调用服务接口
    var client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);

    // 设置request库的一些参数，例如代理服务地址，超时时间等
    // request参数请参考 https://github.com/request/request#requestoptions-callback
    HttpClient.setRequestOptions({timeout: 5000});
    
    // 也可以设置拦截每次请求（设置拦截后，调用的setRequestOptions设置的参数将不生效）,
    // 可以按需修改request参数（无论是否修改，必须返回函数调用参数）
    // request参数请参考 https://github.com/request/request#requestoptions-callback
    HttpClient.setRequestInterceptor(function(requestOptions) {
        // 查看参数
        console.log(requestOptions)
        // 修改参数
        requestOptions.timeout = 50000;
        // 返回参数
        return requestOptions;
    });

    // identifier analyze
    var resp = await cloud.downloadFile({
        fileID: event.idCardUrl,
    })
    // delete id card
    cloud.deleteFile({
        fileList: [event.idCardUrl],
    }).then(
        function(res) {
            console.log(res)
        },
        function(err) {
            console.log(err)
        },
    )
    var image = resp.fileContent.toString('base64')
    //var idCardSide = "back";
    var idCardSide = "front";
    
    // 调用身份证识别
    resp = await client.idcard(image, idCardSide).then(
        function(res) {
            console.log("success:"+JSON.stringify(res));
            return res
        },
        function(err) {
            statusCode = 500
            console.log("error:"+JSON.stringify(result));
        }
    ).catch(function(err) {
        // 如果发生网络错误
        statusCode = 501
        console.log("network error:"+JSON.stringify(result));
    });
    console.log("end:"+JSON.stringify(resp));
    var birthday = resp.words_result['出生'].words
    birthday = birthday.substr(0,4) +'-'+ birthday.substr(4,2) +'-'+ birthday.substr(6,2)
    var gender = resp.words_result['性别'].words == '男' ? 'male' : 'female'
    var data = {
        birthday: birthday,
        gender: gender
    }

    return {
        data: data,
        statusCode: statusCode
    }
    
    // 如果有可选参数
    //var options = {};
    //options["detect_direction"] = "true";
    //options["detect_risk"] = "false";
    //
    //// 带参数调用身份证识别
    //client.idcard(image, idCardSide, options).then(function(result) {
    //    console.log(JSON.stringify(result));
    //}).catch(function(err) {
    //    // 如果发生网络错误
    //    console.log(err);
    //});;
}
