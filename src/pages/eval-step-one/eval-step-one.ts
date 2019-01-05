import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController,
  Content,
  App
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Media, MediaObject } from "@ionic-native/media";
import { File } from "@ionic-native/file"; // 文件选择
import { FileTransfer } from "@ionic-native/file-transfer";
import _ from "underscore"; // 工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { FilePreviewService } from "../../common/service/FilePreview.Service";
import { BackButtonService } from "../../common/service/BackButton.Service";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
import { pageObj } from "../../common/config/BaseConfig";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { ParamService } from "../../common/service/Param.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
declare var cordova: any;

@IonicPage()
@Component({
  selector: "page-eval-step-one",
  templateUrl: "eval-step-one.html"
})
export class EvalStepOnePage {
  @ViewChild(Content)
  content: Content;
  public recordState: number = 1; // 录音状态 1未录音 2正在录音 3停止
  public soundFileName: string = null; // 声音文件名
  public soundStorageDir: string = null; // 声音存储目录
  public mediaObj: any = null; // 录音对象

  // public paramType: any = null; // 传递过来的参数类型
  // public baseImgUrl: any = reqObj.baseImgUrl; // 基础图片URL
  // public reqUrl: string = "home/a/internal/homeTrain/listTrains"; // 请求数据URL
  // public sendData: any = {}; // 定义请求数据时的对象
  // public dataList: Array<any> = []; // 数据列表
  // public isShowNoData: boolean = false; // 给客户提示没有更多数据
  // public infiniteScroll: InfiniteScroll = null; // 上拉加载事件对象
  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    public app: App,
    private file: File, // 文件
    public openNativeSettings: OpenNativeSettings, // 系统设置
    public transfer: FileTransfer, // 文件上传下载
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public httpReq: HttpReqService, // Http请求服务
    public ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public androidPermissions: AndroidPermissions, // Android权限控制
    public filePrevService: FilePreviewService, // PDF文件查看服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public media: Media, // 录音插件
    public backBtn: BackButtonService, // 物理返回键控制
    public iab: InAppBrowser // 打开内置浏览器
  ) {
    if (!this.platform.is("cordova")) {
      this.gloService.showMsg("非真机运行环境", "top");
    } else {
      if (this.platform.is("ios")) {
        this.soundStorageDir = cordova.file.tempDirectory;
      } else if (this.platform.is("android")) {
        this.soundStorageDir = cordova.file.dataDirectory;
      }

      const recPermission = this.androidPermissions.PERMISSION.RECORD_AUDIO; // 录音权限
      this.androidPermissions.checkPermission(recPermission).then(result => {
        const isPermission = result.hasPermission;
        if (isPermission) {
          console.error("已经获取到录音权限");
        } else {
          this.gloService.showMsg("获取录音权限失败，请开启应用权限", "top");
          this.androidPermissions.requestPermission(recPermission);
        }
      });
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad EvalStepOnePage");
    // this.sendData.datumType = this.paramType; // 列表类型
    // this.sendData.pageNo = pageObj.currentPage; // 定义当前页码
    // this.sendData.pageSize = pageObj.everyItem; // 定义当前页面请求条数
    // this.sendData.totalPage = pageObj.totalPage; // 定义当前页面请求条数
    // 请求列表数据
    // this.reqData(
    //   this.reqUrl,
    //   this.sendData,
    //   (res: any) => {
    //     // 请求数据成功
    //     this.dataList = this.dataList.concat(res);
    //     if (this.dataList.length == 0) {
    //       this.gloService.showMsg("该列表暂无数据！");
    //     }
    //     console.error("this.sendData", this.sendData);
    //   },
    //   (err: any) => {
    //     // 请求数据失败
    //     this.dataList = this.dataList.concat(err);
    //   }
    // );
  }

  ionViewWillEnter() {
    this.backBtn.setDisabled(true); // 禁用物理返回键
  }

  ionViewWillLeave() {
    this.backBtn.setDisabled(false); // 启用物理返回键
    if (this.platform.is("android")) {
      // applicationDirectory: "file:///android_asset/"
      // applicationStorageDirectory: "file:///data/user/0/com.mirrortech.jujiaapp/"
      // cacheDirectory: "file:///data/user/0/com.mirrortech.jujiaapp/cache/"
      // dataDirectory: "file:///data/user/0/com.mirrortech.jujiaapp/files/"
      // documentsDirectory: null
      // externalApplicationStorageDirectory: "file:///storage/emulated/0/Android/data/com.mirrortech.jujiaapp/"
      // externalCacheDirectory: "file:///storage/emulated/0/Android/data/com.mirrortech.jujiaapp/cache/"
      // externalDataDirectory: "file:///storage/emulated/0/Android/data/com.mirrortech.jujiaapp/files/"
      // externalRootDirectory: "file:///storage/emulated/0/"
      // sharedDirectory: null
      // syncedDataDirectory: null
      // tempDirectory: null
      const fs: string = cordova.file.externalRootDirectory; // 音频文件存储目录
      console.error(fs);
      this.file.listDir(fs, "").then(
        listDirSuc => {
          console.error("查看文件夹下文件成功", listDirSuc);
          if (_.isArray(listDirSuc) && listDirSuc.length > 0) {
            for (let i = 0; i < listDirSuc.length; i++) {
              // console.error(listDirSuc[i].hasOwnProperty("name"));
              // console.error(listDirSuc[i]["name"]);
              const fileNameArr: Array<string> = listDirSuc[i]["name"].split(
                "."
              );
              if (
                fileNameArr.length == 2 &&
                fileNameArr[0].length == 14 &&
                fileNameArr[1] == "wav"
              ) {
                console.error(fs);
                console.error(listDirSuc[i]["name"]);
                this.file.removeFile(fs, listDirSuc[i]["name"]).then(
                  rmFileSuc => {
                    console.error("删除文件成功", rmFileSuc);
                  },
                  rmFileErr => {
                    console.error("删除文件失败", rmFileErr);
                  }
                );
              }
            }
          }
        },
        listDirErr => {
          console.error("查看文件夹下文件失败", listDirErr);
        }
      );
    }
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
   * @memberof ServiceConfigPage
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
   * 生成录音文件名的方法：yyyymmddhhmmss(月和日不足两位补0)
   * @param {*} n
   * @returns
   * @memberof EvalStepOnePage
   */
  public complement(n: any): any {
    return n < 10 ? "0" + n : n;
  }

  /**
   * 创建录音文件名
   * @returns
   * @memberof EvalStepOnePage
   */
  public generateFileName() {
    let date = new Date();
    return (
      date.getFullYear().toString() +
      this.complement(date.getMonth() + 1) +
      this.complement(date.getDate()) +
      this.complement(date.getHours()) +
      this.complement(date.getMinutes()) +
      this.complement(date.getSeconds())
    );
  }
  /**
   * 录制声音控制
   * @param {MediaObject} mediaObj
   * @memberof EvalStepOnePage
   */
  public doRecordMedia(mediaObj: MediaObject) {
    // mediaObj.startRecord(); // 开始录音
    mediaObj.onStatusUpdate.subscribe(status => this.showRecordStatus(status)); // 监测录音状态的回调
    mediaObj.onSuccess.subscribe(() => {
      // 录音成功后的处理，如上传录音
      console.error("录制或播放完成");
      // this.uploadFile(
      //   this.file.documentsDirectory.replace(/^file:\/\//, "") +
      //     this.soundFileName
      // )
    });
    mediaObj.onError.subscribe(error => {
      // 录音失败后的处理，如提示错误码
      console.error("录制或播放失败", error);
    });
    window.setTimeout(() => mediaObj.stopRecord(), 10 * 1000); // 设置录音的长度，单位毫秒，ios / android 均有效
    // startRecord() // 开始录制音频文件。
    // pauseRecord() // 暂停录音
    // resumeRecord() // 恢复录制
    // stopRecord() // 停止录音
    // play() // 开始或恢复播放音频文件。
    // pause() // 暂停播放音频文件。
    // stop() // 停止播放音频文件。
    // setVolume(volume) // 设置音频文件的音量。
    // seekTo(milliseconds) // 设置音频文件中的当前位置。
    // release() // 释放底层操作系统的音频资源。
    // getCurrentPosition(); // 获取音频文件中的当前位置。
    // getDuration() // 以秒为单位获取音频文件的持续时间。如果持续时间未知，则返回值-1。
  }

  /**
   * 根据录音状态码返回录音状态的方法
   * @param {*} status
   * @memberof EvalStepOnePage
   */
  public showRecordStatus(status: any) {
    let statusStr = "";
    switch (status) {
      case 0:
        statusStr = "None";
        break;
      case 1:
        statusStr = "Start";
        break;
      case 2:
        statusStr = "Running";
        break;
      case 3:
        statusStr = "Paused";
        break;
      case 4:
        statusStr = "Stopped";
        break;
      default:
        statusStr = "None";
    }
    console.error("status: " + statusStr);
  }
  /**
   * 长按录音
   * @memberof EvalStepOnePage
   */
  public longPress() {
    try {
      console.error("cordova=======", cordova);
    } catch (error) {
      console.error("==========未找到cordova=======");
      return;
    }

    const recPermission = this.androidPermissions.PERMISSION.RECORD_AUDIO; // 录音权限
    this.androidPermissions.checkPermission(recPermission).then(result => {
      const isPermission = result.hasPermission;
      if (isPermission) {
        console.error("已经获取到录音权限");
        if (this.recordState == 1 || this.recordState == 3) {
          this.recordState = 2; // 设置状态为正在录制
          if (!_.isNull(this.soundStorageDir)) {
            // 判断是否获取到存储目录
            if (!_.isNull(this.mediaObj)) {
              // 已有录音对象
              console.error("恢复录制");
              this.gloService.showMsg("已有录音，如需重录请删除录音！", "top");
              this.recordState = 3; // 录制完成
              return;
              // this.mediaObj.resumeRecord(); // 恢复录制
              // this.doRecordMedia(this.mediaObj); // 录制声音控制
            } else {
              // 没有录音对象
              if (!_.isNull(this.soundFileName)) {
                // 已有文件名
              } else {
                // 没有文件名
                this.soundFileName = this.generateFileName() + ".wav"; // 设置声音文件名
              }

              if (this.platform.is("ios")) {
                const docDir = this.file.documentsDirectory; // 创建的文件所在目录
                this.file
                  .createFile(docDir, this.soundFileName, true)
                  .then(() => {
                    this.mediaObj = this.media.create(
                      docDir.replace(/^file:\/\//, "") + this.soundFileName
                    ); // IOS录音对象
                    this.mediaObj.startRecord(); // 开始录音
                    this.doRecordMedia(this.mediaObj); // 录制声音控制
                  });
              } else if (this.platform.is("android")) {
                this.mediaObj = this.media.create(this.soundFileName); // Android录音对象
                this.mediaObj.startRecord(); // 开始录音
                this.doRecordMedia(this.mediaObj); // 录制声音控制
              } else {
                this.gloService.showMsg("非真实设备上运行！", "top");
                return;
              }
            }
          } else {
            this.gloService.showMsg("未获取到存储目录", "top");
            return;
          }
        }
      } else {
        this.gloService.showMsg("获取录音权限失败，请开启应用权限", "top");
        this.androidPermissions.requestPermission(recPermission);
        this.openPermiSetting(); // 打开权限设置页面
        return;
      }
    });
  }

  /**
   * 打开权限设置页面提示
   * @memberof MyApp
   */
  public openPermiSetting() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "检测到应用录音权限未开启，请前往开启！",
      buttons: [
        {
          text: "不开启",
          handler: () => {}
        },
        {
          text: "前往",
          handler: () => {
            this.openNativeSettings.open("application_details");
            // this.openNativeSettings.open("application_development");
            // this.openNativeSettings.open("application");
            // this.openNativeSettings.open("notification_id");
          }
        }
      ]
    });
    let rootNav = this.app.getRootNavs()[0]; // 获取根导航
    let ionicApp = rootNav._app._appRoot;
    let activePortal = ionicApp._overlayPortal.getActive();
    if (activePortal) {
    } else {
      confirm.present();
    }
  }

  /**
   * 松开图标
   * @memberof EvalStepOnePage
   */
  public stopPress() {
    this.recordState = 3;
    this.mediaObj.stopRecord(); // 暂停录音
    console.error("暂停录音");
  }

  /**
   * 播放录音
   *
   * @memberof EvalStepOnePage
   */
  public playSound() {
    this.mediaObj.play(); // 开始或恢复播放音频文件
    console.error("插放录音", this.mediaObj);
  }

  /**
   * 删除录音
   * @memberof EvalStepOnePage
   */
  public delSound() {
    let alert = this.alertCtrl.create({
      title: "提示",
      message: "确认删除录制的音频文件？",
      buttons: [
        {
          text: "取消",
          role: "cancel",
          handler: () => {}
        },
        {
          text: "确认",
          handler: () => {
            this.recordState = 1; // 重置为未录音状态
            this.soundFileName = null; // 声音文件名
            this.mediaObj = null; // 录音对象
          }
        }
      ]
    });
    alert.present();
  }

  /**
   * 上传声音文件使用
   * @param {*} filePath
   * @memberof EvalStepOnePage
   */
  // public uploadFile(filePath: string) {
  //   // 设置上传参数
  //   let options: FileUploadOptions = {
  //     fileKey: "file",
  //     fileName: this.soundFileName,
  //     mimeType: "audio/wav"
  //   };

  //   const fileTransfer: FileTransferObject = this.transfer.create();
  //   alert("filePath:" + filePath);
  //   fileTransfer
  //     .upload(
  //       filePath,
  //       "http://ec2-52-87-177-182.compute.amazonaws.com/upload.php",
  //       options
  //     )
  //     .then(data => {
  //       // resolve(data);
  //       // loading.dismiss();
  //       // this.gloService.showMsg("图片上传成功", null, 3000);
  //     })
  //     .catch(err => {
  //       this.gloService.showMsg("录音上传发生错误,请重试", null, 3000);
  //       // reject(err);
  //     });
  //   // fileTransfer.upload(filePath,
  //   //     encodeURI("http://ec2-52-87-177-182.compute.amazonaws.com/upload.php"), options).then(
  //   //     (data) => {
  //   //         alert("File upload success!");
  //   //     },
  //   //     (err) => {
  //   //         alert("File upload fail! error:" + err.code);
  //   //     });
  // }

  /**
   * 添加成功返回刷新列表
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @returns
   * @memberof ConsignorListPage
   */
  public backRefresh(that: any) {
    console.error("backRefresh");
    console.error(that);
    // console.error(this.reqUrl, this.sendData);
    const url = that.reqUrl;
    const reqObj = that.sendData;
    reqObj.page = pageObj.currentPage; //重置当前页码
    reqObj.size = pageObj.everyItem; //重置当前页面请求条数
    console.error("reqObj", reqObj);
  }

  /**
   * 打开文档
   * @memberof TrainDocListPage
   */
  public openDoc(url: string) {
    if (_.isString(url) && url.length > 0) {
      // const fileUrl: string = this.baseImgUrl + url; // 文件在服务器上的地址
      // this.filePrevService.previewFile(fileUrl);
    } else {
      this.gloService.showMsg("文件地址错误！");
    }
  }
}
