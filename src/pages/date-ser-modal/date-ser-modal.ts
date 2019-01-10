import { Component } from "@angular/core";
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
// import { loginInfo } from "../../common/config/BaseConfig";
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { HttpReqService } from "../../common/service/HttpUtils.Service";

@IonicPage()
@Component({
  selector: "page-date-ser-modal",
  templateUrl: "date-ser-modal.html"
})
export class DateSerModalPage {
  public type: string = null; // 弹出框查询类型
  public bTime: string = null; // 开始时间
  public eTime: string = null; // 结束时间
  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private httpReq: HttpReqService, // Http请求服务
    // private ionicStorage: Storage, // IonicStorage
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public menuCtrl: MenuController, // 侧边栏控制
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    const type = this.navParams.get("type");
    if (_.isString(type) && type.length > 0) {
      this.type = type;
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad DateSerModalPage");
  }

  /**
   * 关闭弹出层
   * @memberof SelProModalPage
   */
  public closeModal() {
    this.viewCtrl.dismiss();
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @param {*} opts 转场动画
   * @memberof UserListPage
   */
  public jumpPage(ev: Event, pageName: any, obj?: any, opts?: any): void {
    if (ev) {
      ev.stopPropagation();
    }
    if (_.isObject(obj) && !_.isEmpty(obj)) {
      if (!(_.isString(obj["bTime"]) && obj["bTime"].length > 0)) {
        this.gloService.showMsg("请选择开始日期！");
        return;
      }
      if (!(_.isString(obj["eTime"]) && obj["eTime"].length > 0)) {
        this.gloService.showMsg("请选择结束日期！");
        return;
      }
      const bTime = new Date(obj["bTime"]).getTime();
      const eTime = new Date(obj["eTime"]).getTime();
      if (bTime - eTime >= 0) {
        this.gloService.showMsg("开始日期不能大于等于结束日期");
        return;
      }
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
