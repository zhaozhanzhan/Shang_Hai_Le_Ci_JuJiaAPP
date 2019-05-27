import { Component } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ModalController
} from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { Storage } from "@ionic/storage";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { reqObj } from "../../common/config/BaseConfig";

@IonicPage()
@Component({
  selector: "page-sati-query",
  templateUrl: "sati-query.html"
})
export class SatiQueryPage {
  public sendData: any = {}; // 定义请求数据时的对象
  public formData: any = {}; // 数据信息
  public formInfo: any = {}; // 数据信息

  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private ionicStorage: Storage, // IonicStorage
    private httpReq: HttpReqService, // Http请求服务
    public navCtrl: NavController, // 导航控制器
    public ionicStorage: Storage, // IonicStorage
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio, // 音频播放
    public modalCtrl: ModalController // Modal弹出页控制器
  ) {
    this.ionicStorage.get("loginInfo").then(loginObj => {
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        console.log("loginObj========", loginObj);
        const loginId = loginObj.LoginId;
        if (_.isString(loginId) && loginId.length > 0) {
          const sendData: any = {};
          sendData.personCode = loginId;
          this.httpReq.get(
            "home/a/home/homeServerWork/serviceSatisfaction",
            sendData,
            (data: any) => {
              if (data["data"] && data["data"]["result"] == 0) {
                this.formInfo = data["data"]["map"];
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
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SatiQueryPage");
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
   * 打开Modal框
   * @param {string} pageName 页面
   * @param {any} obj 传递对象
   * @memberof ServiceConfigPage
   */
  public openModal(pageName: string, obj?: any) {
    console.log("打开弹出层");
    if (obj) {
      this.modalCtrl.create(pageName, obj).present();
    } else {
      this.modalCtrl.create(pageName).present();
    }
  }
}
