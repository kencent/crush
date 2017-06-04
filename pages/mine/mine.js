var util = require('../../utils/util')
var users = require('../../config').users
var myFlippedwords = require('../../config').myFlippedwords
var myPubFlippedwords = require('../../config').myPubFlippedwords
// Page({
//   data: {
//     text: "Page mine"
//   },
//   onLoad: function (options) {
//     // 页面初始化 options为页面跳转所带来的参数
//     util.getRequestWithRefreshToken(users + "/1323131", "pages/mine/mine").then(
//       res => {
//         wx.showModal({
//           title: '请求成功',
//           content: res.data,
//           showCancel: false
//         })
//       }
//     )
//   },
//   onReady: function () {
//     // 页面渲染完成
//   },
//   onShow: function () {
//     // 页面显示
//   },
//   onHide: function () {
//     // 页面隐藏
//   },
//   onUnload: function () {
//     // 页面关闭
//   }
// })
// mine.js

// 自定义标签
var iconPath = "../../images/icons/"
var tabs = [
  {
    "icon": iconPath + "mark.png",
    "iconActive": iconPath + "markHL.png",
    "title": "我收",
    "extraStyle": "",
  },
  {
    "icon": iconPath + "collect.png",
    "iconActive": iconPath + "collectHL.png",
    "title": "我发",
    "extraStyle": "",
  },
  {
    "icon": iconPath + "like.png",
    "iconActive": iconPath + "likeHL.png",
    "title": "喜欢",
    "extraStyle": "",
  },
]

var app = getApp()
Page({

  // data
  data: {
    // 展示的tab标签
    tabs: tabs,

    // 当前选中的标签
    currentTab: "tab1",

    // 高亮的标签索引
    highLightIndex: "0",


    userInfo: {},
  },

  
  onShow: function () {
   
  },

  loadData : function(id){
    util.getRequestWithRefreshToken(myFlippedwords, "pages/mine/mine").then(
      res => {
        
        if (res.statusCode != 200) {
          return
        }
        wx.stopPullDownRefresh();

        this.setData({
          flippedwords: util.dealData(res.data.flippedwords.reverse())
        })
      }
    )
  },

  loadMySendData : function(){
    var that = this
    util.getRequestWithRefreshToken(myPubFlippedwords, "pages/mine/mine").then(
      res => {

        if (res.statusCode != 200) {
          return
        }
        wx.stopPullDownRefresh();

        that.setData({
          flippedwords: util.dealData(res.data.flippedwords.reverse())
        })
      }
    )
  },

  gotoDetail: function (event) {
    wx.navigateTo({
      url: '/pages/detail/detail?data=' + event.currentTarget.dataset.flippedword
    })
  },
  
  onPullDownRefresh : function(){
    this.loadData(0)
  },
  onLoad: function () {
    var that = this
    app.getUserInfo(function (userInfo) {
      //更新数据
      console.log(userInfo)
      that.setData({
        userInfo: userInfo
      })
    })
    // 页面初始化 options为页面跳转所带来的参数
    this.loadData(0)
  },

  // 点击tab项事件
  touchTab: function (event) {
    var tabIndex = parseInt(event.currentTarget.id);
    var template = "tab" + (tabIndex + 1).toString();

    this.setData({
      currentTab: template,
      highLightIndex: tabIndex.toString()
    })

    if (tabIndex == 0) {
      this.loadData(0)
    } else if (tabIndex == 1) {
      this.loadMySendData()
    }
  },

  // 新建日记
  touchAdd: function (event) {
    wx.navigateTo({
      url: "../post/post"
    });
  },
  feedback:function(e){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  }
})
