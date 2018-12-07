import { Component } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  Events,
  IonicPage
} from "ionic-angular";
import _ from "underscore"; // underscore工具类
import { NativeAudio } from "@ionic-native/native-audio";
import { NFC } from "@ionic-native/nfc"; // NFC
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
import { loginInfo } from "../../common/config/BaseConfig";
// import { Storage } from "@ionic/storage";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { loginInfo } from "../../common/config/BaseConfig";

@IonicPage()
@Component({
  selector: "page-card-read",
  templateUrl: "card-read.html"
})
export class CardReadPage {
  public formInfo: any = {}; // 数据信息
  public personInfo: any = {}; // 人员信息
  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private ionicStorage: Storage, // IonicStorage
    private httpReq: HttpReqService, // Http请求服务
    public nfc: NFC, // NFC
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio, // 音频播放
    public events: Events // 事件发布与订阅
  ) {
    const nfcId = this.navParams.get("nfcId");
    ParamService.setParamNfc(nfcId);
    console.error("ParamService.getParamNfc", ParamService.getParamNfc());
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
          //   ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
          //   this.personInfo = data["data"]["homeArchiveAddress"];
          // } else {
          //   this.formInfo = {};
          //   this.gloService.showMsg("未获取到用户信息！");
          //   if (this.navCtrl.canGoBack()) {
          //     this.navCtrl.pop();
          //   }
          // }
        }
      );
    } else {
      this.gloService.showMsg("未获取到用户ID！");
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
      return;
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CardReadPage");
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
