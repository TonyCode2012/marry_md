'use strict';

const request = require('request-promise')


exports.main = async(event, context) => {
  // for demo
  if (event.method === 'getBook') {
    return request('https://douban.uieee.com/v2/book/isbn/' + event.isbn).then(json => {
      console.log(json)
      return json;
    }).catch(err => {
      console.log(err)
    })
  } else {
    return {
      event,
      context
    }
  }
  
}


// client side
/*
wx.cloud.callFunction({
  name: 'requestapi',
  data: {
    isbn: '9787111128069',
    method: 'getBook'
  },
  complete: res => {
    console.log('callFunction test result: ', res)
  },
}) 

*/