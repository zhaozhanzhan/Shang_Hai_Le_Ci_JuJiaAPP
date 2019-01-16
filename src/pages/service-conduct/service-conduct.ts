import { Component } from "@angular/core";
import { UpperCasePipe } from "@angular/common";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ViewController,
  Events,
  App,
  normalizeURL
} from "ionic-angular";
import _ from "underscore"; // 工具类
import { Storage } from "@ionic/storage";
import { NFC } from "@ionic-native/nfc"; // NFC
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { loginInfo, reqObj } from "../../common/config/BaseConfig";
import { ServiceNotification } from "../../common/service/ServiceNotification";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { File } from "@ionic-native/file"; // 文件选择
import { FilePath } from "@ionic-native/file-path";
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from "@ionic-native/file-transfer";
import { Local } from "../../common/service/Storage";
// import { ParamService } from "../../common/service/Param.Service";
// import moment from "moment"; // 时间格式化插件
// import { FormBuilder } from "@angular/forms";
// import { ParamService } from "../../common/service/Param.Service";
declare var cordova: any;

@IonicPage()
@Component({
  selector: "page-service-conduct",
  templateUrl: "service-conduct.html"
})
export class ServiceConductPage {
  public nfcId: any = null; // 是否已经开启服务
  public workID: any = null; // 服务ID
  public formData: any = {}; // 数据信息
  public formInfo: any = {}; // 数据信息
  public beginDura: any = "00:00:00"; // 开始时长
  public hours: any = "00"; // 时
  public minutes: any = "00"; // 分
  public seconds: any = "00"; // 秒

  public imgObj: any = {
    filePath: "", // 文件路径不含文件名
    fileName: "", // 文件名包含扩展名
    fileType: "", // 文件扩展名
    fileFullPath: "" // 文件完整路径
  }; // 文件初始化对象
  public imgArr: any = []; // 图片对象数组
  public pictureId: any = null; // 图片ID

  constructor(
    public app: App,
    public camera: Camera, // 相机
    public file: File, // 文件
    public filePath: FilePath, // 文件路径
    public transfer: FileTransfer, // 文件上传
    public ionicStorage: Storage, // IonicStorage
    public httpReq: HttpReqService, // Http请求服务
    public jsUtil: JsUtilsService, // 自定义JS工具类
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public menuCtrl: MenuController, // 侧边栏控制
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public events: Events, // 事件发布与订阅
    public nfc: NFC, // NFC
    public serNotifi: ServiceNotification // 服务开启定时通知关闭
  ) {
    for (let i = 0; i < 1; i++) {
      // 初始化图片上传数组
      const fileObj = this.jsUtil.deepClone(this.imgObj);
      this.imgArr.push(fileObj);
    }
    this.ionicStorage.get("loginInfo").then(loginObj => {
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        console.error("loginObj========", loginObj);
        const loginId = loginObj.LoginId;
        if (_.isString(loginId) && loginId.length > 0) {
          const sendData: any = {};
          sendData.serverPersonID = loginId;
          this.httpReq.get(
            "home/a/home/homeServerWork/getWorking",
            sendData,
            data => {
              if (data["data"] && data["data"]["result"] == 0) {
                this.nfcId = data["data"]["workDetailObj"]["nfcNo"];
                this.workID = data["data"]["workDetailObj"]["workID"];
                this.formData = data["data"]["workDetailObj"];
                this.formData.serverItemDetail = this.formData.serverItemDetail
                  .split("/")
                  .join(">");
                this.formInfo = this.formData["userArchivesObj"];
                const bTime = this.formData.startTime;
                const eTime = new Date();
                const timeVal = this.calTime(bTime, eTime);
                const isStart = this.getDuration(timeVal);

                this.serNotifi.setManyMin(
                  data["data"]["workDetailObj"]["maxWorktime"]
                );
                this.serNotifi.setXMin(
                  data["data"]["workDetailObj"]["warnFrequency"]
                );

                this.serNotifi.setNfcNo(this.nfcId);
                this.serNotifi.setWorkId(this.workID);
                this.serNotifi.bTimeStamp(bTime); // 将开始时间转换为时间戳
                this.serNotifi.calTimeStamp(); // 计算各种所需要的时间戳
                this.serNotifi.getRemindArr(); // 获取提醒对象数组

                if (isStart) {
                  this.startWatch();
                  this.serNotifi.openServer(); // 开启定时服务
                  this.serNotifi.clickNotifi(); // 单击通知
                  this.initNfcListener(); // 初始化NFC监听

                  //=================订阅NFC扫描成功事件 Begin=================//
                  this.events.subscribe("nfcScanSuc", nfcId => {
                    this.closeServer(nfcId); // 关闭服务
                    // this.events.unsubscribe("nfcScanSuc");
                  });
                  //=================订阅NFC扫描成功事件 End=================//
                }
              } else {
                this.formData = {};
                this.formInfo = {};
                this.gloService.showMsg("获取信息失败！");
                if (this.navCtrl.canGoBack()) {
                  this.navCtrl.pop();
                }
              }
            }
          );
        } else {
          this.gloService.showMsg("未获取到用户ID!");
          if (this.navCtrl.canGoBack()) {
            this.navCtrl.pop();
          }
        }
      } else {
        this.gloService.showMsg("未获取到用户ID!");
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        }
      }
    });
    // const nfcId = this.navParams.get("nfcId");
    // ParamService.setParamNfc(nfcId);
    // console.error("ParamService.getParamNfc", ParamService.getParamNfc());
    // const sendData: any = {};
    // sendData.nfcNo = nfcId;
    // this.httpReq.get(
    //   "home/a/server/homeUserArchives/getByNfcNo",
    //   sendData,
    //   data => {
    //     if (data["data"] && data["data"]["homeUserArchives"]) {
    //       this.formInfo = data["data"]["homeUserArchives"];
    //       ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
    //       this.personInfo = data["data"]["homeArchiveAddress"];
    //     } else {
    //       this.formInfo = {};
    //       this.gloService.showMsg("未获取到用户信息！");
    //       this.navCtrl.pop();
    //     }
    //   }
    // );
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ServiceConductPage");
  }

  ionViewWillLeave() {
    this.events.unsubscribe("nfcScanSuc"); // 取消NFC扫描成功事件
  }

  /**
   * 返回到主页
   * @memberof PersonInfoPage
   */
  public backHome() {
    this.navCtrl.setRoot("MainPage", null, { animate: true }); // 跳转到主页
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @param {*} opts 转场动画
   * @memberof UserListPage
   */
  public jumpPage(pageName: any, obj?: any, opts?: any): void {
    if (_.isObject(obj) && !_.isEmpty(obj)) {
      this.navCtrl.push(pageName, obj);
    } else {
      if (pageName == "ScanPage") {
        this.navCtrl.push(pageName, null, opts);
      } else {
        this.navCtrl.push(pageName);
      }
    }
  }

  /**
   * 计算时间差
   * @param {*} bTime
   * @param {*} eTime
   * @memberof ServiceConductPage
   */
  public calTime(bTime: any, eTime: any) {
    const bTimeStr = new Date(bTime).toString();
    const eTimeStr = new Date(eTime).toString();
    let bTimeStamp: any = null; // 起始时间时间戳
    let eTimeStamp: any = null; // 结束时间时间戳
    let timeVal = 0;
    if (bTimeStr == "Invalid Date") {
      this.gloService.showMsg("时间格式不正确");
      return;
    } else {
      bTimeStamp = new Date(bTime).getTime();
    }
    if (eTimeStr == "Invalid Date") {
      this.gloService.showMsg("时间格式不正确");
      return;
    } else {
      eTimeStamp = new Date(eTime).getTime();
    }
    console.error("bTimeStamp", bTimeStamp);
    console.error("eTimeStamp", eTimeStamp);
    if (bTimeStamp - eTimeStamp > 10000) {
      this.gloService.showMsg("开始时间不能大于结束时间");
      return;
    }
    timeVal = eTimeStamp - bTimeStamp;
    if (timeVal < 0) {
      return 0;
    }
    return timeVal;
  }

  /**
   * 获取时长计算时分秒
   * @param {*} timeVal
   * @memberof ServiceConductPage
   */
  public getDuration(timeVal: any) {
    if (_.isNumber(parseInt(timeVal)) && parseInt(timeVal) >= 0) {
      let hours: any = Math.floor((timeVal / (1000 * 60 * 60)) % 24);
      let minutes: any = Math.floor((timeVal / (1000 * 60)) % 60);
      let seconds: any = Math.floor((timeVal / 1000) % 60);
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      this.hours = hours;
      this.minutes = minutes;
      this.seconds = seconds;
      return true;
    } else {
      this.gloService.showMsg("获取时长出错！");
      return false;
    }
  }

  /**
   * 开始计时
   * @memberof ServiceConductPage
   */
  public startWatch() {
    const that = this;
    setInterval(() => {
      let hours: any = parseInt(this.hours);
      let minutes: any = parseInt(this.minutes);
      let seconds: any = parseInt(this.seconds);
      if (seconds < 59) {
        seconds += 1;
      } else {
        seconds = 0;
        if (minutes < 59) {
          minutes += 1;
        } else {
          minutes = 0;
          hours += 1;
        }
      }
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      that.hours = hours;
      that.minutes = minutes;
      that.seconds = seconds;
    }, 1000);
  }

  /**
   * 初始化NFC监听
   * @memberof MyApp
   */
  public initNfcListener() {
    let that = this;
    if (this.platform.is("android") && !this.platform.is("mobileweb")) {
      this.nfc
        .enabled()
        .then(enabled => {
          that.nfc
            .addNdefListener(() => {}, err => {})
            .subscribe(event => {
              let rfid = that.nfc.bytesToHexString(event.tag.id);
              let nfcId = rfid.replace(/(.{2})/g, "$1:").replace(/(:)$/, "");
              const upperTrans = new UpperCasePipe().transform(nfcId);
              if (loginInfo.LoginState == "success") {
                // const nfcId = event.tag.id.join(":");
                // this.gloService.showMsg(upperTrans, null, 3000);
                this.events.publish("nfcScanSuc", upperTrans);
                // this.jumpPage("CardReadPage");
              } else {
                this.gloService.showMsg("用户未登录！");
              }
              // that.events.publish(EventTag.NFCScanned, rfid);
            });
          that.nfc
            .addNdefFormatableListener(() => {}, err => {})
            .subscribe(event => {
              let rfid = that.nfc.bytesToHexString(event.tag.id);
              let nfcId = rfid.replace(/(.{2})/g, "$1:").replace(/(:)$/, "");
              const upperTrans = new UpperCasePipe().transform(nfcId);
              if (loginInfo.LoginState == "success") {
                // const nfcId = event.tag.id.join(":");
                // this.gloService.showMsg(upperTrans, null, 3000);
                this.events.publish("nfcScanSuc", upperTrans);
                // this.jumpPage("CardReadPage");
              } else {
                this.gloService.showMsg("用户未登录！");
              }
              // that.events.publish(EventTag.NFCScanned, rfid);
            });
        })
        .catch(() => {
          that.showNfcOpenConfirm();
        });
    }
  }

  /**
   * 显示去开启NFC确认提示功能
   * @memberof MyApp
   */
  public showNfcOpenConfirm() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "NFC功能未开启，请前往设置页面开启！",
      buttons: [
        {
          text: "不开启",
          handler: () => {}
        },
        {
          text: "前往设置",
          handler: () => {
            this.nfc.showSettings();
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * 为文件生成一个新的文件名
   * @returns
   * @memberof RegisterPage
   */
  public createFileName(fileType: string) {
    let dateObj = new Date();
    let timeMill = dateObj.getTime(); // 时间戳
    let newFileName = timeMill + "." + fileType; //拼接文件名
    console.error("新文件名AAAAAAAAAAA");
    return newFileName;
  }

  /**
   * 处理图片的路径为当前设备可上传路径
   * @param {*} imgName 图片名称
   * @memberof RegisterPage
   */
  public imgUploadPath(imgName: any) {
    if (!imgName) {
      return "";
    } else {
      // window.Ionic.WebView.convertFileSrc
      return GlobalMethod.rmFileStr(
        normalizeURL(cordova.file.dataDirectory + imgName)
      );
    }
  }

  /**
   * 将获取到的图片或者相机拍摄到的图片进行一下另存为，用于后期的图片上传使用
   * @param {*} path 文件路径
   * @param {*} currentName 文件名
   * @param {*} newFileName 新文件名
   * @memberof RegisterPage
   */
  public copyFileToLocalDir(
    filePath: string,
    fileName: string,
    newFileName: any
  ) {
    return new Promise((resolve, reject) => {
      this.file
        .copyFile(filePath, fileName, cordova.file.dataDirectory, newFileName)
        .then(
          success => {
            // this.lastImg = newFileName;
            console.error(
              "cordova.file.dataDirectory",
              cordova.file.dataDirectory
            );
            console.error("newFileNameCCCCCCCCCCCCCCCCCC", newFileName);
            console.error(
              "fileFullPathDDDDDDDDDDDDDDDDDDD",
              normalizeURL(cordova.file.dataDirectory + newFileName)
            );
            this.imgArr[0]["filePath"] = cordova.file.dataDirectory; // 文件路径
            this.imgArr[0]["fileName"] = newFileName; // 文件名包含扩展名
            this.imgArr[0]["fileFullPath"] = normalizeURL(
              cordova.file.dataDirectory + newFileName
            ); // 文件完整路径
            resolve();
          },
          error => {
            this.gloService.showMsg("存储图片到本地图库出现错误", null, 3000);
            reject();
          }
        );
    });
  }

  /**
   * 拼接完整请求URL
   * @param url 传入接口的部分URL
   */
  private getFullUrl(url: string): string {
    const baseUrl: String = reqObj.baseUrl;
    return baseUrl + url;
  }

  /**
   * 上传声音文件
   * @param {string} fileKey 后台需要取值的key,input标签类型file上的name
   * @param {string} fileName 文件名称
   * @param {string} filePath 文件设备路径
   * @param {string} uploadUrl 上传文件地址URL
   * @returns {Promise<any>}
   * @memberof EvalStepOnePage
   */
  public uploadFile(
    fileKey: string,
    fileName: string,
    filePath: string,
    uploadUrl: string
  ): Promise<any> {
    // 设置上传参数
    const options: FileUploadOptions = {
      fileKey: fileKey,
      fileName: fileName,
      chunkedMode: false,
      mimeType: "multipart/form-data"
    };

    const fileTransfer: FileTransferObject = this.transfer.create();
    console.error("filePath:" + filePath);
    console.error("uploadUrl:" + uploadUrl);
    console.error("options:", options);
    return new Promise((resolve, reject) => {
      fileTransfer
        .upload(filePath, uploadUrl, options)
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          this.gloService.showMsg("上传发生错误,请重试", "top", 3000);
          reject(err);
        });
    });
  }

  /**
   * 获取图片
   * @param {number} sourceType 获取图片的方式 PHOTOLIBRARY：0，CAMERA：1
   * @memberof RegisterPage
   */
  public getPicture(sourceType: number, nfcId: string) {
    const options: CameraOptions = {
      quality: 40, // 图片质量范围为0-100。默认值为50
      destinationType: this.camera.DestinationType.FILE_URI, //返回的数据类型，默认DATA_URL
      // encodingType: this.camera.EncodingType.JPEG,
      // mediaType: this.camera.MediaType.PICTURE,
      sourceType: sourceType, // 设置图片的来源。在Camera.PictureSourceType中定义。默认是CAMERA。PHOTOLIBRARY：0，CAMERA：1，SAVEDPHOTOALBUM：2
      saveToPhotoAlbum: false, //是否保存拍摄的照片到相册中去
      correctOrientation: true //是否纠正拍摄的照片的方向
    };

    this.camera.getPicture(options).then(
      imagePath => {
        // let base64Image = "data:image/jpeg;base64," + imageData;
        const isAndroid = this.platform.is("android"); // 判断是否是安卓
        const isPhotoLib =
          sourceType === this.camera.PictureSourceType.PHOTOLIBRARY; // 判断是否是相册

        const upUrl = "home/a/home/homeServerWork/fileUpload";
        const queryObj: any = {};
        queryObj.isPicture = true; // 文件类型

        const sid: any = Local.get("sessionId");
        if (_.isString(sid) && sid.length > 0) {
          queryObj.__sid = sid;
        } else {
          this.gloService.showMsg("未获取到sessionId", "top");
          return;
        }

        //===========安卓平台文件路径特殊处理 Begin===========//
        if (isAndroid && isPhotoLib) {
          //特别处理 android 平台的文件路径问题
          // Android相册
          this.filePath
            .resolveNativePath(imagePath) //获取 android 平台下的真实路径
            .then(filePath => {
              // 解析获取Android真实路径
              console.error(window);
              // 获取图片正确的路径;
              const correctPath = GlobalMethod.getFilePath(filePath);
              // 获取图片文件名和文件类型;
              const correctNameType = GlobalMethod.getFileNameAndType(
                imagePath
              );
              // 获取图片文件名;
              // const correctName = GlobalMethod.getFileName(filePath);

              // 获取图片文件类型;
              const correctType = GlobalMethod.getFileType(filePath);
              console.error("correctPath", correctPath);
              console.error("correctNameType", correctNameType);
              console.error("correctType", correctType);
              this.imgArr[0]["fileType"] = correctType; // 文件类型扩展名

              this.copyFileToLocalDir(
                correctPath,
                correctNameType,
                this.createFileName(correctType)
              ).then(
                suc => {
                  queryObj.fileName = this.imgArr[0]["fileName"]; // 文件名称
                  queryObj.bizType = "homeServerWork_after"; // 关闭服务图片标识

                  const queryParam = this.jsUtil.queryStr(queryObj);
                  let uploadUrl: string =
                    this.getFullUrl(upUrl) + "?" + queryParam;

                  const loading = this.gloService.showLoading("上传中...");

                  // queryObj.bizKey = this.paramId; // 服务ID
                  this.uploadFile(
                    "multipartFile",
                    this.imgArr[0]["fileName"],
                    this.imgArr[0]["fileFullPath"],
                    uploadUrl
                  ).then(
                    upSuc => {
                      console.error("upSuc", upSuc);
                      loading.dismiss();
                      console.error("JSON", JSON.parse(upSuc.response));
                      this.pictureId = JSON.parse(upSuc.response).pictureId;
                      if (
                        _.isString(this.pictureId) &&
                        this.pictureId.length > 0
                      ) {
                        const serId = this.formData.workID;
                        if (_.isString(serId) && serId.length > 0) {
                          const sendData: any = {};
                          sendData.id = serId;
                          sendData.nfcNo = nfcId;
                          sendData.pictureId = this.pictureId;
                          this.httpReq.get(
                            "home/a/home/homeServerWork/end",
                            sendData,
                            (data: any) => {
                              if (data["data"] && data["data"]["result"] == 0) {
                                this.serNotifi.closeServer(); // 关闭定时服务
                                this.jumpPage("ServiceCompletePage", {
                                  serviceId: this.formData.workID
                                });
                              } else {
                                this.gloService.showMsg(
                                  data["data"]["message"]
                                );
                                return;
                              }
                            }
                          );
                        } else {
                          this.gloService.showMsg("未获取到服务ID");
                          if (this.navCtrl.canGoBack()) {
                            this.navCtrl.pop();
                          }
                          return;
                        }

                        // const sendData = this.jsUtil.deepClone(this.paramObj);
                        // const nfcId = ParamService.getParamNfc();
                        // sendData.nfcNo = nfcId;
                        // sendData.pictureId = this.pictureId;
                        // this.httpReq.get(
                        //   "home/a/home/homeServerWork/start",
                        //   sendData,
                        //   (data: any) => {
                        //     if (data["data"] && data["data"]["result"] == 0) {
                        //       this.jumpPage("ServiceConductPage");
                        //     } else {
                        //       if (data["data"] && data["data"]["message"]) {
                        //         this.gloService.showMsg(
                        //           data["data"]["message"]
                        //         );
                        //       } else {
                        //         this.gloService.showMsg("请求数据出错！");
                        //       }
                        //     }
                        //   }
                        // );
                      }
                    },
                    upErr => {
                      console.error("upErr", upErr);
                      loading.dismiss();
                    }
                  );
                },
                err => {}
              );
            });
        } else {
          // 非安卓Android平台及相册
          console.error(window);
          // 获取图片正确的路径;
          const correctPath = GlobalMethod.getFilePath(imagePath);
          // 获取图片文件名和文件类型;
          const correctNameType = GlobalMethod.getFileNameAndType(imagePath);
          // 获取图片文件名;
          // const correctName = GlobalMethod.getFileName(imagePath);
          // 获取图片文件类型;
          const correctType = GlobalMethod.getFileType(imagePath);
          // this.imgArr[0]["fileType"] = correctType; // 文件类型扩展名
          console.error("correctPath", correctPath);
          console.error("correctNameType", correctNameType);
          console.error("correctType", correctType);
          this.imgArr[0]["fileType"] = correctType; // 文件类型扩展名

          this.copyFileToLocalDir(
            correctPath,
            correctNameType,
            this.createFileName(correctType)
          ).then(
            suc => {
              queryObj.fileName = this.imgArr[0]["fileName"]; // 文件名称
              queryObj.bizType = "homeServerWork_after"; // 关闭服务图片标识

              const queryParam = this.jsUtil.queryStr(queryObj);
              let uploadUrl: string = this.getFullUrl(upUrl) + "?" + queryParam;

              const loading = this.gloService.showLoading("上传中...");

              // queryObj.bizKey = this.paramId; // 服务ID
              this.uploadFile(
                "multipartFile",
                this.imgArr[0]["fileName"],
                this.imgArr[0]["fileFullPath"],
                uploadUrl
              ).then(
                upSuc => {
                  console.error("upSuc", upSuc);
                  loading.dismiss();
                  console.error("JSON", JSON.parse(upSuc.response));
                  this.pictureId = JSON.parse(upSuc.response).pictureId;
                  if (_.isString(this.pictureId) && this.pictureId.length > 0) {
                    const serId = this.formData.workID;
                    if (_.isString(serId) && serId.length > 0) {
                      const sendData: any = {};
                      sendData.id = serId;
                      sendData.nfcNo = nfcId;
                      sendData.pictureId = this.pictureId;
                      this.httpReq.get(
                        "home/a/home/homeServerWork/end",
                        sendData,
                        (data: any) => {
                          if (data["data"] && data["data"]["result"] == 0) {
                            this.serNotifi.closeServer(); // 关闭定时服务
                            this.jumpPage("ServiceCompletePage", {
                              serviceId: this.formData.workID
                            });
                          } else {
                            this.gloService.showMsg(data["data"]["message"]);
                            return;
                          }
                        }
                      );
                    } else {
                      this.gloService.showMsg("未获取到服务ID");
                      if (this.navCtrl.canGoBack()) {
                        this.navCtrl.pop();
                      }
                      return;
                    }
                  }
                },
                upErr => {
                  console.error("upErr", upErr);
                  loading.dismiss();
                }
              );
            },
            err => {}
          );
        }

        //===========安卓平台文件路径特殊处理 End===========//
      },
      err => {
        console.log(err);
        this.gloService.showMsg("未获取到图片", null, 3000);
      }
    );
  }

  /**
   * 关闭服务
   * @param {*} nfcId nfc16进制码
   * @memberof ServiceConductPage
   */
  public closeServer(nfcId: any) {
    const photograph = this.alertCtrl.create({
      title: "提示",
      message: "关闭该服务必须要拍照！",
      buttons: [
        {
          text: "确定",
          handler: () => {
            console.error("进入拍照页面");
            this.getPicture(this.camera.PictureSourceType.CAMERA, nfcId);
          }
        }
      ]
    });
    setTimeout(() => {
      let rootNav = this.app.getRootNavs()[0]; // 获取根导航
      let ionicApp = rootNav._app._appRoot;
      let activePortal = ionicApp._overlayPortal.getActive();
      if (activePortal) {
        return;
      }
      const confirm = this.alertCtrl.create({
        title: "提示",
        message: "确定要关闭服务吗？",
        buttons: [
          {
            text: "取消",
            handler: () => {
              //=================订阅NFC扫描成功事件 Begin=================//
              // this.events.subscribe("nfcScanSuc", nfcId => {
              //   this.closeServer(nfcId); // 关闭服务
              //   this.events.unsubscribe("nfcScanSuc");
              // });
              //=================订阅NFC扫描成功事件 End=================//
            }
          },
          {
            text: "确定",
            handler: () => {
              if (this.formData.photoFlag) {
                // 需要拍照
                photograph.present();
              } else {
                // 不需要拍照
                const serId = this.formData.workID;
                if (_.isString(serId) && serId.length > 0) {
                  const sendData: any = {};
                  sendData.id = serId;
                  sendData.nfcNo = nfcId;
                  this.httpReq.get(
                    "home/a/home/homeServerWork/end",
                    sendData,
                    (data: any) => {
                      if (data["data"] && data["data"]["result"] == 0) {
                        this.serNotifi.closeServer(); // 关闭定时服务
                        this.jumpPage("ServiceCompletePage", {
                          serviceId: this.formData.workID
                        });
                      } else {
                        this.gloService.showMsg(data["data"]["message"]);
                        return;
                      }
                    }
                  );
                } else {
                  this.gloService.showMsg("未获取到服务ID");
                  if (this.navCtrl.canGoBack()) {
                    this.navCtrl.pop();
                  }
                  return;
                }
              }
            }
          }
        ]
      });
      confirm.present();
    }, 150);
  }
}
