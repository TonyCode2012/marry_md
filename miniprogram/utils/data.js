const listItem = [{
    type: 'selfIntro',
    title: '自我描述',
    desc: '介绍下自己的性格、习惯、优点、缺点'
  }, {
    type: 'homeBg',
    title: '家庭背景',
    desc: '介绍下父母的职业，比如普通家庭、经商家庭、高知家庭'
  }, {
    type: 'hobby',
    title: '兴趣爱好',
    desc: '业余喜欢做什么，比如喜欢看什么样的书、喜欢去什么样的地方旅行等'
  }, {
    type: 'aboutLove',
    title: '爱情观',
    desc: '你期待什么样的爱情，你如何看待爱情'
  }, {
    type: 'idealLover',
    title: '理想的另一半',
    desc: '说出你对另一伴的期许'
  }, {
    type: 'singleReason',
    title: '我为什么单身？',
    desc: '说说单身的原因'
  }, {
    type: 'idealLife',
    kind: "type",
    title: '如果遇到对的人，我期待什么样的生活？',
    desc: '说出你对理想生活的期许'
  }
]


const relationMap = {
    family: '亲戚',
    friend: '朋友',
    schoolmate: '同学',
    colleague: '同事'
}


const basic_item = [
    "birthday",
    "college",
    "company",
    "education",
    "gender",
    "height",
    "weight",
    "hometown",
    "location",
    "nickName",
    "profession",
    "wechat",
]

const requiredInfo = [
    'birthday',
    'company',
    'education',
    'gender',
    'height',
    'hometown',
    'location',
    'marryStatus',
    'job_title',
    'wechat',
]

//const weightRange = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];
const weightStart = 30
const weightEnd = 120
var weightStep = weightStart - 1
const weightRange = Array.apply(null,{length:weightEnd-weightStart+1}).map(function (v,i){weightStep++;return weightStep;})

const heightStart = 150
const heightEnd = 220
var heightStep = heightStart - 1
const heightRange = Array.apply(null,{length:heightEnd-heightStart+1}).map(function (v,i){heightStep++;return heightStep;})

//const heightRange = [150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229];


const educationRange = ['大专', '本科', '硕士', '博士'];
const incomeRange = ['5-15W', '15-30W', '30-50W', '50-100W'];
const jobRange = ['手动填写', '产品经理', '程序员', '设计师', '运营'];

const loveInfoCompletePer = 0.8

module.exports = {
  aboutme: {
    listItem: listItem
  },
  weightRange,
  heightRange,
  educationRange,
  incomeRange,
  jobRange,
  loveInfoCompletePer,
  requiredInfo,
  relationMap,
  basic_item
}
