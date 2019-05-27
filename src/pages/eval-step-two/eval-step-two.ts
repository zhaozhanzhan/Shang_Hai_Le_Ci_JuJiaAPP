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
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { pageObj } from "../../common/config/BaseConfig";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { ParamService } from "../../common/service/Param.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// declare var cordova: any;

@IonicPage()
@Component({
  selector: "page-eval-step-two",
  templateUrl: "eval-step-two.html"
})
export class EvalStepTwoPage {
  @ViewChild(Content)
  content: Content;
  public evaluState: number = null; // 评价状态
  public paramId: any = null; // 传递过来的服务ID
  // public recordState: number = 1; // 录音状态 1未录音 2正在录音 3停止
  // public soundFileName: string = null; // 声音文件名
  // public soundStorageDir: string = null; // 声音存储目录
  // public mediaObj: any = null; // 录音对象
  constructor(
    // private file: File, // 文件
    // private jsUtil: JsUtilsService, // 自定义JS工具类
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
  ) {
    this.paramId = this.navParams.get("serviceId");
    console.log("this.paramObj", this.paramId);
    if (_.isString(this.paramId) && this.paramId.length > 0) {
      const sendData: any = {};
      sendData.id = this.paramId;
    } else {
      this.gloService.showMsg("未获取到服务ID！");
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
      return;
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad EvalStepTwoPage");
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

  /**
   * 设置评价状态
   * @param {number} state
   * @memberof EvalStepTwoPage
   */
  public setEvaluState(state: number) {
    this.evaluState = state;
  }

  /**
   * 下一步
   * @memberof EvalStepTwoPage
   */
  public nextStep() {
    const upUrl = "home/a/home/homeServerWork/serviceEvaluation";
    const queryObj: any = {};
    queryObj.id = this.paramId;
    if (this.evaluState == 1) {
      queryObj.evaluation = "满意";
    } else if (this.evaluState == 2) {
      queryObj.evaluation = "一般";
    } else if (this.evaluState == 3) {
      queryObj.evaluation = "不满意";
    }

    const loading = this.gloService.showLoading("正在提交，请稍候...");
    this.httpReq.get(upUrl, queryObj, (data: any) => {
      if (data["data"] && data["data"]["result"] == 0) {
        // this.formInfo = data["data"]["workDetailObj"];
        loading.dismiss();
        this.jumpPage("EvalStepThrPage");
      } else {
        loading.dismiss();
        this.gloService.showMsg(data["message"], null, 2000);
        // this.formInfo = {};
      }
    });
  }
}
