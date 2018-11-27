import { reqObj } from "./../../common/config/BaseConfig";
import { Component, ViewChild, ElementRef } from "@angular/core";
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
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { loginInfo } from "../../common/config/BaseConfig";

@IonicPage()
@Component({
  selector: "page-sel-pro-modal",
  templateUrl: "sel-pro-modal.html"
})
export class SelProModalPage {
  public hierarchy: any = ""; // 层级
  public serverItemCode: any = ""; // 项目ID
  public userCode: any = null; // 用户ID
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
    this.closeModal(); // 关闭弹出层
    this.jumpPage("SelectServicePage", paramObj);
    if (type == "hour") {
      // 按小时
    } else if (type == "number") {
      // 按次数
    }
  }
}
