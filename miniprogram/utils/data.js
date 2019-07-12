const listItem = [{
    type: 'self',
    title: '自我描述',
    desc: '介绍下自己的性格、习惯、优点、缺点'
  }, {
    type: 'background',
    title: '家庭背景',
    desc: '介绍下父母的职业，比如普通家庭、经商家庭、高知家庭'
  }, {
    type: 'hobby',
    title: '兴趣爱好',
    desc: '业余喜欢做什么，比如喜欢看什么样的书、喜欢去什么样的地方旅行等'
  }, {
    type: 'visionoflove',
    title: '爱情观',
    desc: '你期待什么样的爱情，你如何看待爱情'
  }, {
    type: 'parter',
    title: '理想的另一半',
    desc: '说出你对另一伴的期许'
  }, {
    type: 'whysingle',
    title: '我为什么单身？',
    desc: '说说单身的原因'
  }, {
    type: 'hope',
    kind: "type",
    title: '如果遇到对的人，我期待什么样的生活？',
    desc: '说出你对理想生活的期许'
  }
]
module.exports = {
  aboutme: {
    listItem: listItem
  }
}