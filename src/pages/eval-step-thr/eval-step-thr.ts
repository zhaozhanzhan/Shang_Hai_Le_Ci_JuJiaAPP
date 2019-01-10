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
import { Media } from "@ionic-native/media";
import { FileTransfer } from "@ionic-native/file-transfer";
import _ from "underscore"; // 工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { FilePreviewService } from "../../common/service/FilePreview.Service";
import { BackButtonService } from "../../common/service/BackButton.Service";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
// import { File } from "@ionic-native/file"; // 文件选择
// import { pageObj } from "../../common/config/BaseConfig";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { ParamService } from "../../common/service/Param.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// declare var cordova: any;

@IonicPage()
@Component({
  selector: "page-eval-step-thr",
  templateUrl: "eval-step-thr.html"
})
export class EvalStepThrPage {
  @ViewChild(Content)
  content: Content;
  public evaluState: number = null; // 评价状态

  constructor(
    // private file: File, // 文件
    public app: App,
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
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad EvalStepThrPage");
  }

  ionViewWillEnter() {
    this.backBtn.setDisabled(true); // 禁用物理返回键
  }

  ionViewWillLeave() {
    this.backBtn.setDisabled(false); // 启用物理返回键
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
}
