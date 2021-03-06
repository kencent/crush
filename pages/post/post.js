var util = require('../../utils/util')
const postflippedwords = require('../../config').postflippedwords
const uploadFileUrl = require('../../config').uploadFileUrl
const uploadImageUrl = require('../../config').uploadImageUrl
const signUlr = require('../../config').signUlr
const appid = require('../../config').appid
const buket = require('../../config').buket
// new.js

//录音
var playTimeInterval
var recordTimeInterval

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasLocation: false,
    phone: "",
    text: "",
    image: "",
    video: "",
    audio:"",
    buttonEnable: true,

    //录音相关数据
    recording: false,
    playing: false,
    hasRecord: false,
    recordTime: 0,
    playTime: 0,
    formatedRecordTime: '00:00:00',
    formatedPlayTime: '00:00:00'
  },
  onPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  onTextInput: function (e) {
    this.setData({
      text: e.detail.value
    })
  },
  onSendData: function () {
    wx.showToast({
      title: '发送中..',
      icon: 'loading'
    })
    if (!(/\d{11}/.test(this.data.phone))){
      wx.showToast({
        title: '请输入正确的手机号',
      })
      return
    }
    if(!this.data.text || this.data.text == ""){
      wx.showToast({
        title: '请输入你想对他说的话',
      })
      return
    }
    var that = this;
    this.setData({
      buttonEnable: false
    })
    let data = {}
    data.sendto = this.data.phone
    data.contents = []
    let textContent = {}
    textContent.type = "text"
    textContent.text = this.data.text
    textContent.link = ""
    data.contents.push(textContent)

    if (this.data.image && this.data.image != "") {
      let imageContent = {}
      imageContent.type = "picture"
      imageContent.text = this.data.image
      data.contents.push(imageContent)
    }
    if (this.data.video && this.data.video != "") {
      let videoContent = {}
      videoContent.type = "video"
      videoContent.text = this.data.video
      data.contents.push(videoContent)
    }
    if (this.data.audio && this.data.audio != "") {
      let audioContent = {}
      audioContent.type = "audio"
      audioContent.text = this.data.audio
      audioContent.duration = this.data.recordTime
      data.contents.push(audioContent)
    }

    var lng = wx.getStorageSync('lng')
    var lat = wx.getStorageSync('lat')
    if (!lng) {
      lng = 0
    }
    if (!lat) {
      lat = 0
    }

    data.lng = parseFloat(lng)
    data.lat = parseFloat(lat)
    util.postRequestWithRereshToken(postflippedwords, data).then(
      res => {
        console.log(res)
        if (res.statusCode < 300) {
          wx.hideToast()
          wx.showModal({
            title: '发送成功',
            content: '快去看看吧~',
            showCancel: false,
            complete: function (res) { 
              wx.reLaunch({
                url: '/pages/mine/mine',
              })
            }
          })
        } else {
          if (res.data && res.data.err){
            wx.hideToast()
            wx.showModal({
              title: '发送失败',
              showCancel:false,
              content: res.data.err,
              success:function(res){
                  // wx.reLaunch({
                  //   url: '/pages/mine/mine',
                  // })
              }
            })
          }
        }
      }
    ).catch(function (res) {
      wx.showToast({
        title: '发布失败',
        icon: 'loading'
      })
    }).finally(res => {
      
      
      that.setData({
        buttonEnable: true
      })
      // wx.hideToast();
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取经纬度存储在本地
    util.getLocation().then(res => {
      var location = util.formatLocation(res.longitude, res.latitude)
      wx.setStorage({
        key: 'lng',
        data: location.lng,
      })
      wx.setStorage({
        key: 'lat',
        data: location.lat,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.data.playing) {
      this.stopVoice()
    } else if (this.data.recording) {
      this.stopRecordUnexpectedly()
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  videoTaped: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (e) {
        // console.log(e.tapIndex)
        if (e.tapIndex == 0) {
          that.setData({
            video: ""
          })
        }
      }
    })
  },
  imageTaped: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (e) {
        // console.log(e.tapIndex)
        if (e.tapIndex == 0) {
          that.setData({
            image: ""
          })
        }
      }
    })
  },
  chooseImage: function () {
    var that = this
    var userKey = wx.getStorageSync("username");
    let fileName = userKey + new Date().getTime()
    util.chooseImage(1).then(res => {
      that.setData(
        {
          filePath: res.tempFilePaths[0],
        }
      )
     let imageSignUrl = signUlr + '?fileid=/' +appid+'/'+buket+'/images/'+fileName
     return util.getRequestWithRefreshToken(imageSignUrl, 'page/post/post')

    }).catch(res => {
      //放弃选择
    }).then(res => {
      console.log(res)
      return util.uploadImage(res.data.sig, that.data.filePath, fileName)
    }).catch(res => {
      //上传失败
      console.log(res)
    }).then(res => {
      console.log(res)
      var data = JSON.parse(res.data)
      if (data.code == 0) {//成功了
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          image: data.data.access_url.replace(/file/,'image')
        })
      } else {
        //这里出现了错误，可能是签名过期了
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'loading',
          duration: 3000
        })
      }
    })
  },
  chooseVideo: function () {
    var that = this
    var userKey = wx.getStorageSync("username");
    let fileName = userKey + new Date().getTime()
    util.chooseVideo(30).then(res => {
      that.setData(
        {
          filePath: res.tempFilePath,
        }
      )
      let videoSignUrl = signUlr + '?fileid=/' + appid + '/' + buket + '/videos/' + fileName
      return util.getRequestWithRefreshToken(videoSignUrl, 'page/post/post')

    }).catch(res => {
      //放弃选择
    }).then(res => {
      console.log(res)
      return util.uploadVideo(res.data.sig, that.data.filePath, fileName)
    }).catch(res => {
      //签名获取失败了
      console.log(res)
    }).then(res => {
      console.log(res)
      var data = JSON.parse(res.data)
      if (data.code == 0) {//成功了
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          video: data.data.access_url
        })
      } else {
        //这里出现了错误，可能是签名过期了
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'loading',
          duration: 3000
        })
      }
    }).catch(res=>{
      //上传失败
      console.log(res)
    })
  },
  //下面是录音相关
  startRecord: function () {
    this.setData({ recording: true })

    var that = this
    recordTimeInterval = setInterval(function () {
      var recordTime = that.data.recordTime += 1
      that.setData({
        formatedRecordTime: util.formatTime(that.data.recordTime),
        recordTime: recordTime
      })
    }, 1000)
    wx.startRecord({
      success: function (res) {
        that.setData({
          hasRecord: true,
          tempFilePath: res.tempFilePath,
          formatedPlayTime: util.formatTime(that.data.playTime)
        })

        var userKey = wx.getStorageSync("username");
        let fileName = userKey + new Date().getTime() + ".silk"
        let audioSignUrl = signUlr + '?fileid=/' + appid + '/' + buket + '/audios/' + fileName
        util.getRequestWithRefreshToken(audioSignUrl, 'page/post/post').then(
          res => {
            var sign = res.data.sig
            return util.uploadAudio(sign, that.data.tempFilePath, fileName)
          }
        ).catch(res => {
            //获取签名失败
            console.log(res)
        }).then(res => {
          var data = JSON.parse(res.data)
          if (data.code == 0) {//成功了
            wx.showToast({
              title: '上传录音成功',
              icon: 'success',
              duration: 1000
            })
            that.setData({
              audio: data.data.access_url
            })
          } else {
            //这里出现了错误，可能是签名过期了
            wx.showToast({
              title: '上传录音失败，请重试',
              icon: 'loading',
              duration: 3000
            })
          }
        }).catch(res =>{
          //上传录音失败
          console.log(res)
        })

      },
      complete: function () {
        that.setData({ recording: false })
        clearInterval(recordTimeInterval)
      }
    })
  },
  stopRecord: function () {
    wx.stopRecord()
  },
  stopRecordUnexpectedly: function () {
    var that = this
    wx.stopRecord({
      success: function () {
        console.log('stop record success')
        clearInterval(recordTimeInterval)
        that.setData({
          recording: false,
          hasRecord: false,
          recordTime: 0,
          formatedRecordTime: util.formatTime(0)
        })
      }
    })
  },
  playVoice: function () {
    var that = this
    playTimeInterval = setInterval(function () {
      var playTime = that.data.playTime + 1
      console.log('update playTime', playTime)
      that.setData({
        playing: true,
        formatedPlayTime: util.formatTime(playTime),
        playTime: playTime
      })
    }, 1000)
    wx.playVoice({
      filePath: this.data.tempFilePath,
      success: function () {
        clearInterval(playTimeInterval)
        var playTime = 0
        console.log('play voice finished')
        that.setData({
          playing: false,
          formatedPlayTime: util.formatTime(playTime),
          playTime: playTime
        })
      }
    })
  },
  pauseVoice: function () {
    clearInterval(playTimeInterval)
    wx.pauseVoice()
    this.setData({
      playing: false
    })
  },
  stopVoice: function () {
    clearInterval(playTimeInterval)
    this.setData({
      playing: false,
      formatedPlayTime: util.formatTime(0),
      playTime: 0
    })
    wx.stopVoice()
  },
  clear: function () {
    clearInterval(playTimeInterval)
    wx.stopVoice()
    this.setData({
      playing: false,
      hasRecord: false,
      tempFilePath: '',
      formatedRecordTime: util.formatTime(0),
      recordTime: 0,
      playTime: 0,
      audio:''
    })
  },

  //去帮助页面
  gotoHelp: function(){
    wx.navigateTo({
      url: '/pages/help/help',
    })
  }
})