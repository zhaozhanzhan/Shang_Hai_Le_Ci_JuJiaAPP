import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ModalController,
  Content,
  ViewController
} from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { FilePreviewService } from "../../common/service/FilePreview.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { Storage } from "@ionic/storage";
// import { ParamService } from "../../common/service/Param.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-stai-detail",
  templateUrl: "stai-detail.html"
})
export class StaiDetailPage {
  @ViewChild(Content)
  content: Content;
  public paramObj: any = {}; // 传过来的参数对象
  public sendData: any = {}; // 定义请求数据时的对象
  public formInfo: any = {}; // 数据信息
  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private ionicStorage: Storage, // IonicStorage
    private httpReq: HttpReqService, // Http请求服务
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public gloService: GlobalService, // 全局自定义服务
    public ionicStorage: Storage, // IonicStorage
    private jsUtil: JsUtilsService, // 全局自定义工具类
    public filePrevService: FilePreviewService, // PDF文件查看服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio, // 音频播放
    public viewCtrl: ViewController, // 视图控制器
    public modalCtrl: ModalController // Modal弹出页控制器
  ) {
    console.error("this.navParams", this.navParams["data"]);
    const sendData: any = {
      startTime: this.navParams["data"]["bTime"],
      endTime: this.navParams["data"]["eTime"]
    };
    this.ionicStorage.get("loginInfo").then((loginObj: any) => {
      console.error("loginInfo", loginObj);
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (
          !_.isNull(loginObj["UserInfo"]) &&
          !_.isEmpty(loginObj["UserInfo"])
        ) {
          const loginId = loginObj["LoginId"]; // 用户ID
          if (_.isString(loginId) && loginId.length > 0) {
            sendData.personCode = loginId;
            this.sendData = this.jsUtil.deepClone(sendData);
            this.httpReq.get(
              "home/a/home/homeServerWork/serviceSatisfaction",
              this.sendData,
              (data: any) => {
                if (data["data"] && data["data"]["result"] == 0) {
                  this.formInfo = data["data"]["map"];
                } else {
                  this.formInfo = {};
                  this.gloService.showMsg("获取信息失败！");
                  if (this.navCtrl.canGoBack()) {
                    this.navCtrl.pop();
                  }
                }
              }
            );
          } else {
            this.gloService.showMsg("未获取到用户ID", null, 3000);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
          }
        } else {
          this.gloService.showMsg("未获取到用户ID", null, 3000);
          if (this.navCtrl.canGoBack()) {
            this.navCtrl.pop();
          }
        }
      } else {
        this.gloService.showMsg("未获取到用户ID", null, 3000);
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        }
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad StaiDetailPage");
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
}
