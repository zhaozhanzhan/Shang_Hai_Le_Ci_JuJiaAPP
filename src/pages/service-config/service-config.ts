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
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { reqObj } from "../../common/config/BaseConfig";
// import { Storage } from "@ionic/storage";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-service-config",
  templateUrl: "service-config.html"
})
export class ServiceConfigPage {
  public baseImgUrl: any = reqObj.baseImgUrl; // 基础图片URL
  public infoWay: string = ""; // 定义表单对象
  public formInfo: Array<any> = []; // 定义表单对象
  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private ionicStorage: Storage, // IonicStorage
    private httpReq: HttpReqService, // Http请求服务
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio, // 音频播放
    public modalCtrl: ModalController // Modal弹出页控制器
  ) {
    const sendData: any = {};
    this.httpReq.get(
      "home/a/server/homeServerItems/listTree",
      sendData,
      data => {
        if (_.isArray(data["data"]) && data["data"].length > 0) {
          this.formInfo = data["data"];
        } else {
          this.formInfo = [];
        }
      }
    );

    this.infoWay = this.navParams.get("intoWay");
    console.error(this.infoWay);
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ServiceConfigPage");
  }

  ionViewDidEnter() {
    console.log("ionViewDidEnter");
    console.error("this.navCtrl", this.navCtrl);
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
   * 进入配置列表
   * @param {*} obj 页面组件类名称
   * @memberof ServiceConfigPage
   */
  public gotoConfigList(obj?: any) {
    if (this.infoWay == "jumpInto") {
      this.jumpPage("ConfigListPage", obj);
    } else if (this.infoWay == "nfcScanInto") {
      this.jumpPage("ConfigListTwoPage", obj);
    } else {
      this.gloService.showMsg("未获取到进入配置列表时的状态！");
    }
  }
}
