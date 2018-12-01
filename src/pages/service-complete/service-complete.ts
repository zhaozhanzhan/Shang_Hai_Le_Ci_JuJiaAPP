import { Component} from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ViewController
} from "ionic-angular";
import _ from "underscore"; // 工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { ParamService } from "../../common/service/Param.Service";

@IonicPage()
@Component({
  selector: "page-service-complete",
  templateUrl: "service-complete.html"
})
export class ServiceCompletePage {
  public paramId: any = null; // 传递过来的服务ID
  public formInfo: any = null; // 页面数据对象
  constructor(
    // private ionicStorage: Storage, // IonicStorage
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    private httpReq: HttpReqService, // Http请求服务
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public menuCtrl: MenuController, // 侧边栏控制
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.paramId = this.navParams.get("serviceId");
    console.error("this.paramObj", this.paramId);
    if (_.isString(this.paramId) && this.paramId.length > 0) {
      const sendData: any = {};
      sendData.id = this.paramId;
      this.httpReq.get(
        "home/a/home/homeServerWork/workDetail",
        sendData,
        data => {
          if (data["data"] && data["data"]["result"] == 0) {
            this.formInfo = data["data"]["workDetailObj"];
          } else {
            this.formInfo = {};
          }
        }
      );
    } else {
      this.gloService.showMsg("未获取到服务ID！");
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
      return;
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ServiceCompletePage");
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
