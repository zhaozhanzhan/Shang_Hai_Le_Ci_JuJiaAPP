import { Component } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ViewController,
  normalizeURL
} from "ionic-angular";
import _ from "underscore"; // 工具类
import { File } from "@ionic-native/file"; // 文件选择
import {
  FileTransfer,
  FileTransferObject,
  FileUploadOptions
} from "@ionic-native/file-transfer";
import { GlobalService } from "../../common/service/GlobalService";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
import { loginInfo, reqObj } from "../../common/config/BaseConfig";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { Camera } from "@ionic-native/camera";
import { FilePath } from "@ionic-native/file-path";
// import { Local } from "../../common/service/Storage";
import { DomSanitizer } from "@angular/platform-browser";
import { AppUpdateService } from "../../common/service/AppUpdate.Service";
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";
declare var cordova: any;

@IonicPage()
@Component({
  selector: "page-add-disco-ser",
  templateUrl: "add-disco-ser.html"
})
export class AddDiscoSerPage {
  public paramObj: any = null; // 传递过来的参数对象
  public hierarchy: any = ""; // 层级
  public formInfo: any = {}; // 数据信息
  public personInfo: any = {}; // 人员信息
  public cameraIndex: any = null; // 当前点击图标索引值
  public gloParam: any = null; // 全局参数对象

  public imgObj: any = {
    imgData: "", // 图片数据，base64
    imgDateTime: "" // 图片日期时间
  }; // 文件初始化对象
  public imgArr: any = []; // 图片对象数组
  public pictureId: any = null; // 图片ID

  constructor(
    // private ionicStorage: Storage, // IonicStorage
    public camera: Camera, // 相机
    public file: File, // 文件
    public filePath: FilePath, // 文件路径
    public transfer: FileTransfer, // 文件上传
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
    public domSanitizer: DomSanitizer, // 图片安全转换
    public appUpdate: AppUpdateService // app升级更新
  ) {
    if (this.platform.is("android") || this.platform.is("ios")) {
      try {
        console.log("cordova=======", cordova);
      } catch (error) {
        console.log("==========未找到cordova=======");
      }
    }

    for (let i = 0; i <= 1; i++) {
      // 初始化图片上传数组
      const fileObj = this.jsUtil.deepClone(this.imgObj);
      this.imgArr.push(fileObj);
    }
    this.paramObj = this.jsUtil.deepClone(this.navParams["data"]);
    this.hierarchy = this.navParams.get("hierarchy");
    delete this.paramObj["hierarchy"];
    console.log("this.paramObj", this.paramObj, this.hierarchy);
    const nfcId = ParamService.getParamNfc();

    this.gloParam = ParamService.getParamObj();

    if (_.isString(nfcId) && nfcId.length > 0) {
      const sendData: any = {};
      sendData.nfcNo = nfcId;
      sendData.serverItemCode = this.paramObj.serverItemCode;
      if (_.isString(loginInfo.LoginId) && loginInfo.LoginId.length > 0) {
        sendData.personID = loginInfo.LoginId;
      } else {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        }
        return;
      }

      this.httpReq.get(
        "home/a/server/homeUserArchives/getByNfcNo",
        sendData,
        data => {
          if (data["data"] && data["data"]["result"] == 0) {
            this.formInfo = data["data"]["userArchivesObj"];
            ParamService.setParamId(data["data"]["userArchivesObj"]["userID"]);
            console.log("ParamService.getParamId", ParamService.getParamId());
          } else {
            this.formInfo = {};
            this.gloService.showMsg(data["data"]["message"]);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
          }
          // if (data["data"] && data["data"]["homeUserArchives"]) {
          //   this.formInfo = data["data"]["homeUserArchives"];
          //   // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
          //   this.personInfo = data["data"]["homeArchiveAddress"];
          // } else {
          //   this.formInfo = {};
          // }
        }
      );
    } else {
      this.gloService.showMsg("未获取到标签ID！");
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
      return;
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SelectServicePage");
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
   * 单击相机图标选择相册或拍照
   * @param index 当前点击相机图标的索引值
   * @memberof RegisterPage
   */
  public clickCamera(index: number) {
    this.cameraIndex = index; // 当前点击相机图标的索引值
    const actionSheet = this.actionSheetCtrl.create({
      title: "选择图片",
      buttons: [
        {
          text: "从相册中选择",
          handler: () => {
            this.getPicture(index);
          }
        },
        // {
        //   text: "使用相机",
        //   handler: () => {
        //     this.getPicture(this.camera.PictureSourceType.CAMERA);
        //   }
        // },
        {
          text: "取消",
          role: "cancel",
          handler: () => {
            console.log("取消");
          }
        }
      ]
    });
    actionSheet.present();
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
  public getFullUrl(url: string): string {
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
    console.log("filePath:" + filePath);
    console.log("uploadUrl:" + uploadUrl);
    console.log("options:", options);
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
   * 日期转换
   * @param {string} date
   * @memberof AddDiscoSerPage
   */
  public dateFormat(date: string) {
    let dateStr: string = "";
    if (_.isString(date) && date.length > 0) {
      const dateAyy = date.split(":");
      dateStr = `${dateAyy[0]}-${dateAyy[1]}-${dateAyy[2]}:${dateAyy[3]}:${
        dateAyy[4]
      }`;
    }
    return dateStr;
  }

  /**
   * 获取图片
   * @memberof RegisterPage
   */
  public getPicture(i: number) {
    const isAndroid = this.platform.is("android"); // 判断是否是安卓
    if (isAndroid) {
      if (cordova["plugins"] && cordova["plugins"]["imgData"]) {
        cordova["plugins"]["imgData"].getImgData(
          (success: any) => {
            console.log("==========获取图片信息========", success);
            const loading = this.gloService.showLoading("请稍候...");
            if (i == 0) {
              this.gloParam.startTime = this.dateFormat(success.datetime);
            } else if (i == 1) {
              this.gloParam.endTime = this.dateFormat(success.datetime);
            }
            this.imgArr[i]["imgData"] =
              "data:image/jpeg;base64," + success.image;
            setTimeout(() => {
              loading.dismiss();
            }, 1000);
            this.imgArr[i]["imgDateTime"] = this.dateFormat(success.datetime);
          },
          (error: any) => {
            console.log("==========获取图片信息失败！========");
            this.gloService.showMsg("获取图片失败", null, 3000);
          }
        );
      } else {
        this.gloService.showMsg("请更新APP至最新版本", null, 3000);
        this.appUpdate.presentLoadingDefault();
      }
    }

    // const options: CameraOptions = {
    //   quality: 40, // 图片质量范围为0-100。默认值为50
    //   destinationType: this.camera.DestinationType.FILE_URI, //返回的数据类型，默认DATA_URL,FILE_URI
    //   encodingType: this.camera.EncodingType.JPEG,
    //   // mediaType: this.camera.MediaType.PICTURE,
    //   sourceType: sourceType, // 设置图片的来源。在Camera.PictureSourceType中定义。默认是CAMERA。PHOTOLIBRARY：0，CAMERA：1，SAVEDPHOTOALBUM：2
    //   saveToPhotoAlbum: false, //是否保存拍摄的照片到相册中去
    //   correctOrientation: true //是否纠正拍摄的照片的方向
    // };

    // this.camera.getPicture(options).then(
    //   imagePath => {
    //     // let base64Image = "data:image/jpeg;base64," + imageData;
    //     const isAndroid = this.platform.is("android"); // 判断是否是安卓
    //     const isPhotoLib =
    //       sourceType === this.camera.PictureSourceType.PHOTOLIBRARY; // 判断是否是相册

    //     const upUrl = "home/a/home/homeServerWork/fileUpload";
    //     const queryObj: any = {};
    //     queryObj.isPicture = true; // 文件类型

    //     const sid: any = Local.get("sessionId");
    //     if (_.isString(sid) && sid.length > 0) {
    //       queryObj.__sid = sid;
    //     } else {
    //       this.gloService.showMsg("未获取到sessionId", "top");
    //       return;
    //     }

    //     //===========安卓平台文件路径特殊处理 Begin===========//
    //     if (isAndroid && isPhotoLib) {
    //       //特别处理 android 平台的文件路径问题
    //       // Android相册
    //       this.filePath
    //         .resolveNativePath(imagePath) //获取 android 平台下的真实路径
    //         .then(filePath => {
    //           // 解析获取Android真实路径

    //           // 获取图片正确的路径;
    //           const correctPath = GlobalMethod.getFilePath(filePath);
    //           // 获取图片文件名和文件类型;
    //           const correctNameType = GlobalMethod.getFileNameAndType(
    //             imagePath
    //           );
    //           // 获取图片文件名;
    //           // const correctName = GlobalMethod.getFileName(filePath);

    //           // 获取图片文件类型;
    //           const correctType = GlobalMethod.getFileType(filePath);
    //           console.log("correctPath", correctPath);
    //           console.log("correctNameType", correctNameType);
    //           console.log("correctType", correctType);
    //           // alert(correctPath + correctNameType);
    //           const deviceImgUrl: string = correctPath + correctNameType;

    //           // this.imgArr[0]["fileType"] = correctType; // 文件类型扩展名

    //           // this.copyFileToLocalDir(
    //           //   correctPath,
    //           //   correctNameType,
    //           //   this.createFileName(correctType)
    //           // ).then(
    //           //   suc => {
    //           //     queryObj.fileName = this.imgArr[0]["fileName"]; // 文件名称
    //           //     queryObj.bizType = "homeServerWork_before"; // 开启服务图片标识

    //           //     const queryParam = this.jsUtil.queryStr(queryObj);
    //           //     let uploadUrl: string =
    //           //       this.getFullUrl(upUrl) + "?" + queryParam;

    //           //     const loading = this.gloService.showLoading("上传中...");

    //           //     // queryObj.bizKey = this.paramId; // 服务ID
    //           //     this.uploadFile(
    //           //       "multipartFile",
    //           //       this.imgArr[0]["fileName"],
    //           //       this.imgArr[0]["fileFullPath"],
    //           //       uploadUrl
    //           //     ).then(
    //           //       upSuc => {
    //           //         console.log("upSuc", upSuc);
    //           //         loading.dismiss();
    //           //         console.log("JSON", JSON.parse(upSuc.response));
    //           //         this.pictureId = JSON.parse(upSuc.response).pictureId;
    //           //         if (
    //           //           _.isString(this.pictureId) &&
    //           //           this.pictureId.length > 0
    //           //         ) {
    //           //           const sendData = this.jsUtil.deepClone(this.paramObj);
    //           //           const nfcId = ParamService.getParamNfc();
    //           //           sendData.nfcNo = nfcId;
    //           //           sendData.pictureId = this.pictureId;
    //           //           this.httpReq.get(
    //           //             "home/a/home/homeServerWork/start",
    //           //             sendData,
    //           //             (data: any) => {
    //           //               if (data["data"] && data["data"]["result"] == 0) {
    //           //                 this.jumpPage("ServiceConductPage");
    //           //                 // this.formInfo = data["data"]["homeUserArchives"];
    //           //                 // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
    //           //                 // this.personInfo = data["data"]["homeArchiveAddress"];
    //           //               } else {
    //           //                 if (data["data"] && data["data"]["message"]) {
    //           //                   this.gloService.showMsg(
    //           //                     data["data"]["message"]
    //           //                   );
    //           //                 } else {
    //           //                   this.gloService.showMsg("请求数据出错！");
    //           //                 }
    //           //               }
    //           //             }
    //           //           );
    //           //         }
    //           //       },
    //           //       upErr => {
    //           //         console.log("upErr", upErr);
    //           //         loading.dismiss();
    //           //       }
    //           //     );
    //           //   },
    //           //   err => {}
    //           // );
    //         });
    //     } else {
    //       // 非安卓Android平台及相册
    //       console.log(window);
    //       // 获取图片正确的路径;
    //       const correctPath = GlobalMethod.getFilePath(imagePath);
    //       // 获取图片文件名和文件类型;
    //       const correctNameType = GlobalMethod.getFileNameAndType(imagePath);
    //       // 获取图片文件名;
    //       // const correctName = GlobalMethod.getFileName(imagePath);
    //       // 获取图片文件类型;
    //       const correctType = GlobalMethod.getFileType(imagePath);
    //       // this.imgArr[0]["fileType"] = correctType; // 文件类型扩展名
    //       console.log("correctPath", correctPath);
    //       console.log("correctNameType", correctNameType);
    //       console.log("correctType", correctType);
    //       this.imgArr[0]["fileType"] = correctType; // 文件类型扩展名

    //       // this.copyFileToLocalDir(
    //       //   correctPath,
    //       //   correctNameType,
    //       //   this.createFileName(correctType)
    //       // ).then(
    //       //   suc => {
    //       //     queryObj.fileName = this.imgArr[0]["fileName"]; // 文件名称
    //       //     queryObj.bizType = "homeServerWork_before"; // 开启服务图片标识

    //       //     const queryParam = this.jsUtil.queryStr(queryObj);
    //       //     let uploadUrl: string = this.getFullUrl(upUrl) + "?" + queryParam;

    //       //     const loading = this.gloService.showLoading("上传中...");

    //       //     // queryObj.bizKey = this.paramId; // 服务ID
    //       //     this.uploadFile(
    //       //       "multipartFile",
    //       //       this.imgArr[0]["fileName"],
    //       //       this.imgArr[0]["fileFullPath"],
    //       //       uploadUrl
    //       //     ).then(
    //       //       upSuc => {
    //       //         console.log("upSuc", upSuc);
    //       //         loading.dismiss();
    //       //         console.log("JSON", JSON.parse(upSuc.response));
    //       //         this.pictureId = JSON.parse(upSuc.response).pictureId;
    //       //         if (_.isString(this.pictureId) && this.pictureId.length > 0) {
    //       //           const sendData = this.jsUtil.deepClone(this.paramObj);
    //       //           const nfcId = ParamService.getParamNfc();
    //       //           sendData.nfcNo = nfcId;
    //       //           sendData.pictureId = this.pictureId;
    //       //           this.httpReq.get(
    //       //             "home/a/home/homeServerWork/start",
    //       //             sendData,
    //       //             (data: any) => {
    //       //               if (data["data"] && data["data"]["result"] == 0) {
    //       //                 this.jumpPage("ServiceConductPage");
    //       //                 // this.formInfo = data["data"]["homeUserArchives"];
    //       //                 // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
    //       //                 // this.personInfo = data["data"]["homeArchiveAddress"];
    //       //               } else {
    //       //                 if (data["data"] && data["data"]["message"]) {
    //       //                   this.gloService.showMsg(data["data"]["message"]);
    //       //                 } else {
    //       //                   this.gloService.showMsg("请求数据出错！");
    //       //                 }
    //       //               }
    //       //             }
    //       //           );
    //       //         }
    //       //         // this.jumpPage("EvalStepTwoPage", { serviceId: this.paramId });
    //       //       },
    //       //       upErr => {
    //       //         console.log("upErr", upErr);
    //       //         loading.dismiss();
    //       //       }
    //       //     );
    //       //   },
    //       //   err => {}
    //       // );
    //     }

    //     //===========安卓平台文件路径特殊处理 End===========//
    //   },
    //   err => {
    //     console.log(err);
    //     this.gloService.showMsg("未获取到图片", null, 3000);
    //   }
    // );
  }

  /**
   * 开启服务
   * @memberof SelectServicePage
   */
  public openServer() {
    console.log("this.gloParam", this.gloParam);
    console.log("this.imgArr", this.imgArr);
    const start: any = new Date(this.gloParam.startTime);
    const end: any = new Date(this.gloParam.endTime);
    let startTime: any;
    let endTime: any;

    for (let i = 0; i < this.imgArr.length; i++) {
      if (
        !(
          _.isString(this.imgArr[i]["imgData"]) &&
          this.imgArr[i]["imgData"].length > 0
        )
      ) {
        this.gloService.showMsg(`获取第${i + 1}张照片失败，请重新选择！`);
        return;
      }
    }

    if (!(start == "Invalid Date")) {
      startTime = start.getTime();
    } else {
      this.gloService.showMsg("获取服务开始时间失败！");
      return;
    }

    if (!(end == "Invalid Date")) {
      endTime = end.getTime();
    } else {
      this.gloService.showMsg("获取服务结束时间失败！");
      return;
    }

    if (startTime >= endTime) {
      this.gloService.showMsg(
        "服务前照片拍摄时间不能大于或等于服务后照片拍摄时间！"
      );
      return;
    }
    const sendData = this.jsUtil.deepClone(this.gloParam);
    sendData.data1 = this.imgArr[0]["imgData"];
    sendData.data2 = this.imgArr[1]["imgData"];
    // sendData.datas = [];
    // for (let i = 0; i < this.imgArr.length; i++) {
    //   sendData.datas.push(this.imgArr[i]["imgData"]);
    // }
    const loading = this.gloService.showLoading("正在提交，请稍候...");
    console.log(sendData);
    this.httpReq.post(
      "home/a/home/homeServerWork/whetherOfflineWork",
      null,
      sendData,
      (data: any) => {
        if (data && data["data"]) {
          if (data["data"] && data["data"]["result"] == 0) {
            loading.dismiss();
            this.navCtrl.pop(); // 跳转到主页
            this.gloService.showMsg("保存成功！");
            // this.jumpPage("ServiceConductPage");
            // this.formInfo = data["data"]["homeUserArchives"];
            // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
            // this.personInfo = data["data"]["homeArchiveAddress"];
          } else {
            loading.dismiss();
            if (data["data"] && data["data"]["message"]) {
              this.gloService.showMsg(data["data"]["message"]);
            } else {
              this.gloService.showMsg("请求数据出错！");
            }
          }
        } else {
          loading.dismiss();
          this.gloService.showMsg("后台返回数据异常！");
        }
      }
    );

    // Invalid Date
    // const photograph = this.alertCtrl.create({
    //   title: "提示",
    //   message: "开启该服务必须要拍照！",
    //   buttons: [
    //     {
    //       text: "确定",
    //       handler: () => {
    //         console.log("进入拍照页面");
    //         this.getPicture(0);
    //       }
    //     }
    //   ]
    // });

    // const confirm = this.alertCtrl.create({
    //   title: "提示",
    //   message: "确定要开启服务吗？",
    //   buttons: [
    //     {
    //       text: "取消",
    //       handler: () => {}
    //     },
    //     {
    //       text: "确定",
    //       handler: () => {
    //         if (this.formInfo.photoFlag) {
    //           // 需要拍照
    //           photograph.present();
    //         } else {
    //           // 不需要拍照
    //           const sendData = this.jsUtil.deepClone(this.paramObj);
    //           const nfcId = ParamService.getParamNfc();
    //           sendData.nfcNo = nfcId;
    //           this.httpReq.get(
    //             "home/a/home/homeServerWork/start",
    //             sendData,
    //             (data: any) => {
    //               if (data && data["data"]) {
    //                 if (data["data"] && data["data"]["result"] == 0) {
    //                   this.jumpPage("ServiceConductPage");
    //                   // this.formInfo = data["data"]["homeUserArchives"];
    //                   // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
    //                   // this.personInfo = data["data"]["homeArchiveAddress"];
    //                 } else {
    //                   if (data["data"] && data["data"]["message"]) {
    //                     this.gloService.showMsg(data["data"]["message"]);
    //                   } else {
    //                     this.gloService.showMsg("请求数据出错！");
    //                   }
    //                 }
    //               } else {
    //                 this.gloService.showMsg("后台返回数据异常！");
    //               }
    //             }
    //           );
    //         }
    //       }
    //     }
    //   ]
    // });

    // if (
    //   this.formInfo.homeArchiveWorktime &&
    //   _.isNumber(this.formInfo.homeArchiveWorktime.appWorkTimeRest)
    // ) {
    //   if (this.paramObj.billingMethod == 1) {
    //     // 按小时
    //     if (
    //       this.paramObj.minWorktime >
    //       this.formInfo.homeArchiveWorktime.appWorkTimeRest
    //     ) {
    //       // 应服务最小工时大于剩余时长，剩余时长不足
    //       confirm.setMessage("剩余时长小于服务最小时长，是否开启服务？");
    //       confirm.present();
    //     } else {
    //       console.log("========confirm======", confirm);
    //       confirm.setMessage("是否开启服务？");
    //       confirm.present();
    //     }
    //   } else if (this.paramObj.billingMethod == 2) {
    //     // 按项目化
    //     if (
    //       this.paramObj.oneTime >
    //       this.formInfo.homeArchiveWorktime.appWorkTimeRest
    //     ) {
    //       // 应服务时项目最小时长大于剩余时长，剩余时长不足
    //       confirm.setMessage("剩余时长小于服务最小时长，是否开启服务？");
    //       confirm.present();
    //     } else {
    //       console.log("========confirm======", confirm);
    //       confirm.setMessage("是否开启服务？");
    //       confirm.present();
    //     }
    //   }
    // } else {
    //   this.gloService.showMsg("未获取到剩于时长，无法开启！");
    // }
  }
}
