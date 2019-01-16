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
import { CameraOptions, Camera } from "@ionic-native/camera";
import { FilePath } from "@ionic-native/file-path";
import { Local } from "../../common/service/Storage";
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";
declare var cordova: any;

@IonicPage()
@Component({
  selector: "page-select-service",
  templateUrl: "select-service.html"
})
export class SelectServicePage {
  public paramObj: any = null; // 传递过来的参数对象
  public hierarchy: any = ""; // 层级
  public formInfo: any = {}; // 数据信息
  public personInfo: any = {}; // 人员信息

  public imgObj: any = {
    filePath: "", // 文件路径不含文件名
    fileName: "", // 文件名包含扩展名
    fileType: "", // 文件扩展名
    fileFullPath: "" // 文件完整路径
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
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    for (let i = 0; i < 1; i++) {
      // 初始化图片上传数组
      const fileObj = this.jsUtil.deepClone(this.imgObj);
      this.imgArr.push(fileObj);
    }
    this.paramObj = this.jsUtil.deepClone(this.navParams["data"]);
    this.hierarchy = this.navParams.get("hierarchy");
    delete this.paramObj["hierarchy"];
    console.error("this.paramObj", this.paramObj, this.hierarchy);
    const nfcId = ParamService.getParamNfc();
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
            console.error("ParamService.getParamId", ParamService.getParamId());
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
  public getPicture(sourceType: number) {
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
                  queryObj.bizType = "homeServerWork_before"; // 开启服务图片标识

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
                        const sendData = this.jsUtil.deepClone(this.paramObj);
                        const nfcId = ParamService.getParamNfc();
                        sendData.nfcNo = nfcId;
                        sendData.pictureId = this.pictureId;
                        this.httpReq.get(
                          "home/a/home/homeServerWork/start",
                          sendData,
                          (data: any) => {
                            if (data["data"] && data["data"]["result"] == 0) {
                              this.jumpPage("ServiceConductPage");
                              // this.formInfo = data["data"]["homeUserArchives"];
                              // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
                              // this.personInfo = data["data"]["homeArchiveAddress"];
                            } else {
                              if (data["data"] && data["data"]["message"]) {
                                this.gloService.showMsg(
                                  data["data"]["message"]
                                );
                              } else {
                                this.gloService.showMsg("请求数据出错！");
                              }
                            }
                          }
                        );
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
              queryObj.bizType = "homeServerWork_before"; // 开启服务图片标识

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
                    const sendData = this.jsUtil.deepClone(this.paramObj);
                    const nfcId = ParamService.getParamNfc();
                    sendData.nfcNo = nfcId;
                    sendData.pictureId = this.pictureId;
                    this.httpReq.get(
                      "home/a/home/homeServerWork/start",
                      sendData,
                      (data: any) => {
                        if (data["data"] && data["data"]["result"] == 0) {
                          this.jumpPage("ServiceConductPage");
                          // this.formInfo = data["data"]["homeUserArchives"];
                          // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
                          // this.personInfo = data["data"]["homeArchiveAddress"];
                        } else {
                          if (data["data"] && data["data"]["message"]) {
                            this.gloService.showMsg(data["data"]["message"]);
                          } else {
                            this.gloService.showMsg("请求数据出错！");
                          }
                        }
                      }
                    );
                  }
                  // this.jumpPage("EvalStepTwoPage", { serviceId: this.paramId });
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
   * 开启服务
   * @memberof SelectServicePage
   */
  public openServer() {
    const photograph = this.alertCtrl.create({
      title: "提示",
      message: "开启该服务必须要拍照！",
      buttons: [
        {
          text: "确定",
          handler: () => {
            console.error("进入拍照页面");
            this.getPicture(this.camera.PictureSourceType.CAMERA);
          }
        }
      ]
    });

    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "确定要开启服务吗？",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确定",
          handler: () => {
            if (this.formInfo.photoFlag) {
              // 需要拍照
              photograph.present();
            } else {
              // 不需要拍照
              const sendData = this.jsUtil.deepClone(this.paramObj);
              const nfcId = ParamService.getParamNfc();
              sendData.nfcNo = nfcId;
              this.httpReq.get(
                "home/a/home/homeServerWork/start",
                sendData,
                (data: any) => {
                  if (data["data"] && data["data"]["result"] == 0) {
                    this.jumpPage("ServiceConductPage");
                    // this.formInfo = data["data"]["homeUserArchives"];
                    // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
                    // this.personInfo = data["data"]["homeArchiveAddress"];
                  } else {
                    if (data["data"] && data["data"]["message"]) {
                      this.gloService.showMsg(data["data"]["message"]);
                    } else {
                      this.gloService.showMsg("请求数据出错！");
                    }
                  }
                }
              );
            }
          }
        }
      ]
    });
    if (this.paramObj.billingMethod == 1) {
      // 按小时
      if (
        this.paramObj.minWorktime >
        this.formInfo.homeArchiveWorktime.appWorkTimeRest
      ) {
        // 应服务最小工时大于剩余时长，剩余时长不足
        confirm.setMessage("剩余时长小于服务最小时长，是否开启服务？");
        confirm.present();
      } else {
        console.error("========confirm======", confirm);
        confirm.setMessage("是否开启服务？");
        confirm.present();
      }
    } else if (this.paramObj.billingMethod == 2) {
      // 按项目化
      if (
        this.paramObj.oneTime >
        this.formInfo.homeArchiveWorktime.appWorkTimeRest
      ) {
        // 应服务时项目最小时长大于剩余时长，剩余时长不足
        confirm.setMessage("剩余时长小于服务最小时长，是否开启服务？");
        confirm.present();
      } else {
        console.error("========confirm======", confirm);
        confirm.setMessage("是否开启服务？");
        confirm.present();
      }
    }
  }
}
