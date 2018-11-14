import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController,
  normalizeURL
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { File } from "@ionic-native/file";
import { FilePath } from "@ionic-native/file-path";
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from "@ionic-native/file-transfer";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { reqObj } from "../../common/config/BaseConfig";
import { JsUtilsService } from "../../common/service/JsUtils.Service";

declare var cordova: any; //导入第三方的库定义到 TS 项目中

@IonicPage()
@Component({
  selector: "page-upload-id-card",
  templateUrl: "upload-id-card.html"
})
export class UploadIdCardPage {
  public uploadUrl = reqObj.baseUrl + "workerUser/getIdCardMessageForOCR"; // 上传文件地址URL
  public cameraIndex: any = null; // 当前点击图标索引值
  public imgObj: any = {
    filePath: "", // 文件路径不含文件名
    fileName: "", // 文件名包含扩展名
    fileType: "", // 文件扩展名
    fileFullPath: "" // 文件完整路径
  }; // 文件初始化对象

  public imgArr: any = []; // 图片对象数组
  public idCardArr: any = []; // 后台返回的身份证信息

  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    private jsUtil: JsUtilsService, // 全局自定义工具类
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public camera: Camera, // 相机
    public file: File, // 文件
    public filePath: FilePath, // 文件路径
    public transfer: FileTransfer // 文件上传
  ) {
    if (this.platform.is("android") || this.platform.is("ios")) {
      try {
        console.error("cordova=======", cordova);
      } catch (error) {
        console.error("==========未找到cordova=======");
      }
    }
    for (let i = 0; i < 2; i++) {
      // 初始化图片上传数组
      const fileObj = this.jsUtil.deepClone(this.imgObj);
      this.imgArr.push(fileObj);
    }
    // fileObj.filePath = correctPath; // 文件路径
    // fileObj.fileName = correctNameType; // 文件名包含扩展名
    // fileObj.fileType = correctType; // 文件类型扩展名
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad UploadIdCardPage");
  }

  /**
   * 单击相机图标选择相册或拍照
   * @param index 当前点击相机图标的索引值
   * @memberof RegisterPage
   */
  public clickCamera(index) {
    this.cameraIndex = index; // 当前点击相机图标的索引值
    const actionSheet = this.actionSheetCtrl.create({
      title: "选择图片",
      buttons: [
        {
          text: "从相册中选择",
          handler: () => {
            this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: "使用相机",
          handler: () => {
            this.getPicture(this.camera.PictureSourceType.CAMERA);
          }
        },
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

      // return this.webview.convertFileSrc(cordova.file.dataDirectory + imgName);
      // return window.Ionic.WebView.convertFileSrc(
      //   cordova.file.dataDirectory + imgName
      // );
    }
  }
  /**
   * 将获取到的图片或者相机拍摄到的图片进行一下另存为，用于后期的图片上传使用
   * @param {*} path 文件路径
   * @param {*} currentName 文件名
   * @param {*} newFileName 新文件名
   * @memberof RegisterPage
   */
  public copyFileToLocalDir(filePath, fileName, newFileName: any) {
    this.file
      .copyFile(filePath, fileName, cordova.file.dataDirectory, newFileName)
      .then(
        success => {
          // this.lastImg = newFileName;
          this.imgArr[this.cameraIndex]["filePath"] =
            cordova.file.dataDirectory; // 文件路径
          this.imgArr[this.cameraIndex]["fileName"] = newFileName; // 文件名包含扩展名
          this.imgArr[this.cameraIndex]["fileFullPath"] = normalizeURL(
            cordova.file.dataDirectory + newFileName
          ); // 文件完整路径
        },
        error => {
          this.gloService.showMsg("存储图片到本地图库出现错误", null, 3000);
        }
      );
  }

  /**
   * 获取图片
   * @param {number} sourceType 获取图片的方式 PHOTOLIBRARY：0，CAMERA：1
   * @memberof RegisterPage
   */
  public getPicture(sourceType: number) {
    const options: CameraOptions = {
      quality: 50, // 图片质量范围为0-100。默认值为50
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
              this.imgArr[this.cameraIndex]["fileType"] = correctType; // 文件类型扩展名
              this.copyFileToLocalDir(
                correctPath,
                correctNameType,
                this.createFileName(correctType)
              );
              // this.uploadImg(correctPath + correctNameType, correctNameType);
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
          this.imgArr[this.cameraIndex]["fileType"] = correctType; // 文件类型扩展名
          this.copyFileToLocalDir(
            correctPath,
            correctNameType,
            this.createFileName(correctType)
          );
          // this.uploadImg(correctPath + correctNameType, correctNameType);
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
   * 多文件连续上传Promise
   * @param {string} fileKey 后台需要取值的key,input标签类型file上的name
   * @param {string} fileName 文件名称
   * @param {string} filePath 文件设备路径
   * @param {string} uploadUrl 上传文件地址URL
   * @returns {Promise}
   * @memberof UploadIdCardPage
   */
  public uploadPromise(
    fileKey: string,
    fileName: string,
    filePath: string,
    uploadUrl: string
  ): Promise<any> {
    const options: FileUploadOptions = {
      fileKey: fileKey,
      fileName: fileName,
      chunkedMode: false,
      mimeType: "multipart/form-data"
    };

    const fileTransfer: FileTransferObject = this.transfer.create();
    let receivePromise = null;

    receivePromise = new Promise((resolve, reject) => {
      // 正式上传文件
      fileTransfer
        .upload(filePath, uploadUrl, options)
        .then(data => {
          resolve(data);
          // loading.dismiss();
          // this.gloService.showMsg("图片上传成功", null, 3000);
        })
        .catch(err => {
          this.gloService.showMsg("图片上传发生错误,请重试", null, 3000);
          reject(err);
        });
    });
    return receivePromise;
  }

  /**
   * 清空图片对象数组
   * @param {number} [index]
   * @memberof UploadIdCardPage
   */
  public clearImgArr(index?: number) {
    if (_.isNumber(index)) {
      this.imgArr[index]["filePath"] = ""; // 文件路径不含文件名
      this.imgArr[index]["fileName"] = ""; // 文件名包含扩展名
      this.imgArr[index]["fileType"] = ""; // 文件扩展名
      this.imgArr[index]["fileFullPath"] = ""; // 文件完整路径
    } else {
      for (let i = 0; i < this.imgArr.length; i++) {
        this.imgArr[i]["filePath"] = ""; // 文件路径不含文件名
        this.imgArr[i]["fileName"] = ""; // 文件名包含扩展名
        this.imgArr[i]["fileType"] = ""; // 文件扩展名
        this.imgArr[i]["fileFullPath"] = ""; // 文件完整路径
      }
    }
  }

  /**
   * 上传图片
   * @memberof RegisterPage
   */
  public uploadImg() {
    for (let i = 0; i < this.imgArr.length; i++) {
      if (!this.imgArr[0]["fileFullPath"]) {
        this.gloService.showMsg("请选择或拍摄本人身份证正面照", null, 3000);
        return;
      } else if (!this.imgArr[1]["fileFullPath"]) {
        this.gloService.showMsg("请选择或拍摄本人身份证反面照", null, 3000);
        return;
      }
    }
    const loading = this.gloService.showLoading("上传中...");
    const promiseArray = [];

    for (let i = 0; i < this.imgArr.length; i++) {
      promiseArray.push(
        this.uploadPromise(
          "file",
          this.imgArr[i].fileName,
          this.imgArr[i].fileFullPath,
          this.uploadUrl
        )
      );
    }
    Promise.all(promiseArray)
      .then(
        data => {
          for (let i = 0; i < data.length; i++) {
            if (data[i].responseCode == 200) {
              const resData = JSON.parse(data[i].response);
              if (resData.code == 0) {
                // 上传成功，身份证信息解析成功
                if (i == this.imgArr.length - 1) {
                  // 最后一张图片上传解析成功，关闭上传动画
                  loading.dismiss();
                }
                this.idCardArr.push(resData.data);
              } else {
                // 上传成功，身份证信息解析失败
                loading.dismiss();
                if (i == this.imgArr.length - 1) {
                  // 最后一张图片上传解析失败，关闭上传动画
                  this.clearImgArr(this.imgArr.length - 1); // 清除最后一张图片对象
                } else {
                  this.clearImgArr(); // 清空图片对象数组
                }
                this.idCardArr = []; // 上传失败清空身份证信息数组
                this.gloService.showMsg(resData.message, null, 3000);
                break;
              }
            } else {
              // 上传失败
              loading.dismiss();
              this.clearImgArr(); // 清空图片对象数组
              this.idCardArr = []; // 上传失败清空身份证信息数组
              this.gloService.showMsg("图片上传发生错误,请重试", null, 3000);
              break;
            }
          }

          // 比较两张照片是同一面
          if (this.idCardArr.length == 2) {
            if (
              (_.isNull(this.idCardArr[0]["name"]) &&
                !_.isNull(this.idCardArr[1]["name"])) ||
              (!_.isNull(this.idCardArr[0]["name"]) &&
                _.isNull(this.idCardArr[1]["name"]))
            ) {
              // 正确情况
              this.ionicStorage.set("idCardInfo", this.idCardArr);
              this.navCtrl.pop();
            } else {
              // 错误情况
              this.clearImgArr(); // 清空图片对象数组
              this.idCardArr = []; // 上传失败清空身份证信息数组
              this.gloService.showMsg(
                "身份证较验未通过，请重新选择上传",
                null,
                3000
              );
            }
          } else {
            // 错误情况
            this.clearImgArr(); // 清空图片对象数组
            this.idCardArr = []; // 上传失败清空身份证信息数组
            this.gloService.showMsg(
              "身份证较验未通过，请重新选择上传",
              null,
              3000
            );
          }

          console.error("this.idCardArr: ", this.idCardArr);
        },
        reason => {
          loading.dismiss();
          this.clearImgArr(); // 清空图片对象数组
          this.idCardArr = []; // 上传失败清空身份证信息数组
          this.gloService.showMsg("图片上传发生错误,请重试", null, 3000);
        }
      )
      .catch(err => {
        // 请求服务器出错
        loading.dismiss();
        this.clearImgArr(); // 清空图片对象数组
        this.idCardArr = []; // 上传失败清空身份证信息数组
        this.gloService.showMsg("图片上传发生错误,请重试", null, 3000);
        console.error("err:", err);
      });
  }
}
