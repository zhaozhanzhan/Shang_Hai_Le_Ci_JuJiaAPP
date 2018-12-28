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
import { loginInfo } from "../../common/config/BaseConfig";
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { HttpReqService } from "../../common/service/HttpUtils.Service";

@IonicPage()
@Component({
  selector: "page-sel-pro-modal",
  templateUrl: "sel-pro-modal.html"
})
export class SelProModalPage {
  public hierarchy: any = ""; // 层级
  public serverItemCode: any = ""; // 项目ID
  public userCode: any = null; // 用户ID
  public typeArr: any = null; // 项目类型数组
  public minWorktime: number = null; // 计时方式最小工时
  public oneTime: number = null; // 一次项目最小工时
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
    console.error("this.navParams", this.navParams);
    const caption = this.navParams.get("caption");
    this.minWorktime = this.navParams.get("minWorktime"); // 计时方式最小工时
    this.oneTime = this.navParams.get("oneTime"); // 一次项目最小工时
    if (
      _.isString(this.navParams.get("treeNames")) &&
      this.navParams.get("treeNames") != ""
    ) {
      const treeArr = this.navParams.get("treeNames").split("/");
      if (_.isArray(treeArr)) {
        treeArr.push(caption);
        this.hierarchy = treeArr.join(">");
      }
      console.error("this.hierarchy", treeArr, this.hierarchy);
    }
    this.serverItemCode = this.navParams.get("serverItemCode");
    this.userCode = this.navParams.get("userCode");
    console.error(
      "this.serverItemCode,this.userCode",
      this.serverItemCode,
      this.userCode
    );
    this.typeArr = this.navParams.get("typeArr");
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SelProModalPage");
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
   * 选择类型计算方式
   * @param {Event} ev 事件对象
   * @param {string} type 选择类型 hour 按小时 number 按次数
   * @memberof SelProModalPage
   */
  public selType(ev: Event, type: string) {
    if (ev) {
      ev.stopPropagation();
    }

    const paramObj: any = {};
    paramObj.hierarchy = this.hierarchy; // 选择的服务层级
    paramObj.personCode = loginInfo.LoginId;
    paramObj.userCode = this.userCode;
    paramObj.serverItemCode = this.serverItemCode;
    paramObj.minWorktime = this.minWorktime; // 计时方式最小工时
    paramObj.oneTime = this.oneTime; // 一次项目最小工时
    this.closeModal(); // 关闭弹出层
    if (type == "hour") {
      // 按小时
      paramObj.billingMethod = 1;
    } else if (type == "number") {
      // 按次数
      paramObj.billingMethod = 2;
    }
    this.jumpPage("SelectServicePage", paramObj);
    console.error(type);
  }
}
