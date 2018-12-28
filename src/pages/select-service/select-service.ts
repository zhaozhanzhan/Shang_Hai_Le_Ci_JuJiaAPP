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
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
import { loginInfo } from "../../common/config/BaseConfig";
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";

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
    if (_.isString(nfcId) && nfcId.length > 0) {
      const sendData: any = {};
      sendData.nfcNo = nfcId;
      if (_.isString(loginInfo.LoginId) && loginInfo.LoginId.length > 0) {
        sendData.personID = loginInfo.LoginId;
      } else {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        }
        return;
      }

      this.httpReq.get(
        "home/a/server/homeUserArchives/getByNfcNo",
        sendData,
        data => {
          if (data["data"] && data["data"]["result"] == 0) {
            this.formInfo = data["data"]["userArchivesObj"];
            ParamService.setParamId(data["data"]["userArchivesObj"]["userID"]);
            console.error("ParamService.getParamId", ParamService.getParamId());
          } else {
            this.formInfo = {};
            this.gloService.showMsg(data["data"]["message"]);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
          }
          // if (data["data"] && data["data"]["homeUserArchives"]) {
          //   this.formInfo = data["data"]["homeUserArchives"];
          //   // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
          //   this.personInfo = data["data"]["homeArchiveAddress"];
          // } else {
          //   this.formInfo = {};
          // }
        }
      );
    } else {
      this.gloService.showMsg("未获取到标签ID！");
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
      return;
    }
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
            const sendData = this.jsUtil.deepClone(this.paramObj);
            const nfcId = ParamService.getParamNfc();
            sendData.nfcNo = nfcId;
            this.httpReq.get(
              "home/a/home/homeServerWork/start",
              sendData,
              (data: any) => {
                if (data["data"] && data["data"]["result"] == 0) {
                  this.jumpPage("ServiceConductPage");
                  // this.formInfo = data["data"]["homeUserArchives"];
                  // ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
                  // this.personInfo = data["data"]["homeArchiveAddress"];
                } else {
                  // this.formInfo = {};
                  if (data["data"] && data["data"]["message"]) {
                    this.gloService.showMsg(data["data"]["message"]);
                  } else {
                    this.gloService.showMsg("请求数据出错！");
                  }
                }
              }
            );
          }
        }
      ]
    });
    if (this.paramObj.billingMethod == 1) {
      // 按小时
      if (
        this.paramObj.minWorktime >
        this.formInfo.homeArchiveWorktime.appWorkTimeRest
      ) {
        // 应服务最小工时大于剩余时长，剩余时长不足
        confirm.setMessage("剩余时长小于服务最小时长，是否开启服务？");
        confirm.present();
      } else {
        console.error("========confirm======", confirm);
        confirm.setMessage("是否开启服务？");
        confirm.present();
      }
    } else if (this.paramObj.billingMethod == 2) {
      // 按项目化
      if (
        this.paramObj.oneTime >
        this.formInfo.homeArchiveWorktime.appWorkTimeRest
      ) {
        // 应服务时项目最小时长大于剩余时长，剩余时长不足
        confirm.setMessage("剩余时长小于服务最小时长，是否开启服务？");
        confirm.present();
      } else {
        console.error("========confirm======", confirm);
        confirm.setMessage("是否开启服务？");
        confirm.present();
      }
    }
  }
}
