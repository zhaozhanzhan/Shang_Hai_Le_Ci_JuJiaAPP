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
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
import { loginInfo } from "../../common/config/BaseConfig";

@IonicPage()
@Component({
  selector: "page-select-service",
  templateUrl: "select-service.html"
})
export class SelectServicePage {
  public paramObj: any = null; // 传递过来的参数对象
  public hierarchy: any = ""; // 层级
  public formInfo: any = {}; // 数据信息
  public personInfo: any = {}; // 人员信息
  constructor(
    // private ionicStorage: Storage, // IonicStorage
    private httpReq: HttpReqService, // Http请求服务
    private jsUtil: JsUtilsService, // 自定义JS工具类
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public menuCtrl: MenuController, // 侧边栏控制
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.paramObj = this.jsUtil.deepClone(this.navParams["data"]);
    this.hierarchy = this.navParams.get("hierarchy");
    delete this.paramObj["hierarchy"];
    console.error("this.paramObj", this.paramObj, this.hierarchy);
    const nfcId = ParamService.getParamNfc();
    const sendData: any = {};
    sendData.nfcNo = nfcId;
    this.httpReq.get(
      "home/a/server/homeUserArchives/getByNfcNo",
      sendData,
      data => {
        if (data["data"] && data["data"]["homeUserArchives"]) {
          this.formInfo = data["data"]["homeUserArchives"];
          // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
          this.personInfo = data["data"]["homeArchiveAddress"];
        } else {
          this.formInfo = {};
        }
      }
    );
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SelectServicePage");
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
   * 开启服务
   * @memberof SelectServicePage
   */
  public openServer() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "确定要开启服务吗？",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确定",
          handler: () => {
            // this.jumpPage("ServiceConductPage");
            const sendData = this.jsUtil.deepClone(this.paramObj);
            this.httpReq.get(
              "home/a/home/homeServerWork/start",
              sendData,
              data => {
                // if (data["data"] && data["data"]["homeUserArchives"]) {
                //   this.formInfo = data["data"]["homeUserArchives"];
                //   ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
                //   this.personInfo = data["data"]["homeArchiveAddress"];
                // } else {
                //   this.formInfo = {};
                // }
              }
            );
          }
        }
      ]
    });
    confirm.present();
  }
}
