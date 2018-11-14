import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Content,
  ActionSheetController,
  Platform,
  AlertController,
  ModalController
  // Refresher,
  // Slides,
  // InfiniteScroll,
} from "ionic-angular";
// import Swiper from "swiper"; // 滑动js库
import { Storage } from "@ionic/storage";
// import { Geolocation } from "@ionic-native/geolocation"; // GPS定位
// import { AndroidPermissions } from "@ionic-native/android-permissions"; // Android权限控制
import { OpenNativeSettings } from "@ionic-native/open-native-settings"; // 系统设置
import { QRScanner } from "@ionic-native/qr-scanner"; // 条码、二维码扫描
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
// import { pageObj } from "../../common/config/BaseConfig";
// import { ParamService } from "../../common/service/Param.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { ParamService } from "../../common/service/Param.Service";

@IonicPage()
@Component({
  selector: "page-cancle-collage",
  templateUrl: "cancle-collage.html"
})
export class CancleCollagePage {
  @ViewChild(Content)
  content: Content;

  public paramId: any = null; // 参数对象
  public dataList: Array<any> = []; // 数据列表
  public formData: any = {}; // 表单数据对象

  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public httpReq: HttpReqService, // Http请求服务
    public jsUtil: JsUtilsService, // 自定义JS工具类
    public ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public modalCtrl: ModalController, // Modal弹出页控制器
    // private geolocation: Geolocation, // GPS定位
    // private androidPermissions: AndroidPermissions, // Android权限控制
    public openNativeSettings: OpenNativeSettings, // 系统设置
    public qrScanner: QRScanner // 条码、二维码扫描
  ) {
    this.paramId = this.navParams.get("id");
    console.log("%c 传过来的ID", "color:#DEDE3F", this.paramId);
    if (!_.isNull(this.paramId) && !_.isUndefined(this.paramId)) {
      this.httpReq.post(
        "workerUser/getForPackageList",
        null,
        { packageId: this.paramId },
        data => {
          if (data["status"] == 200) {
            if (data["code"] == 0) {
              console.error(data);
              // this.sendData.totalPage = GlobalMethod.calTotalPage(
              //   data["data"]["objectMap"]["count"],
              //   this.sendData.size
              // ); //定义当前总页数
              // suc(data["data"]["list"]);
              this.dataList = data["data"];
            } else {
              this.gloService.showMsg(data["message"], null, 2000);
              if (this.navCtrl.canGoBack()) {
                this.navCtrl.pop();
              }
            }
          } else {
            this.gloService.showMsg("请求服务器出错", null, 2000);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
          }
        }
      );
    } else {
      this.gloService.showMsg("未获取到ID", null, 2000);
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CancleCollagePage");
  }

  /**
   * 取消拼包
   * @memberof ScanCollagePage
   */
  public saveForm() {
    this.formData.packageId = this.paramId; // 拉包工信息ID
    const backRefreshObj = ParamService.getParamObj();
    console.error("this.formData====", this.formData);

    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "确认取消拼好的包？",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确认",
          handler: () => {
            const loading = this.gloService.showLoading("正在提交，请稍候...");
            const formData: any = this.jsUtil.deepClone(this.formData);

            this.httpReq.post(
              "workerUser/cancelPackage",
              null,
              formData,
              data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    this.gloService.showMsg("取消成功", null, 2000);
                    loading.dismiss();
                    if (_.isFunction(backRefreshObj.backRefreshAllEvent)) {
                      console.error("执行返回刷新事件");
                      backRefreshObj.backRefreshAllEvent(backRefreshObj.that); // 执行返回刷新事件
                    }
                    this.navCtrl.pop();
                  } else {
                    this.gloService.showMsg(data["message"], null, 2000);
                    loading.dismiss();
                  }
                } else {
                  loading.dismiss();
                  this.gloService.showMsg("请求服务器出错", null, 2000);
                }
              }
            );
          }
        }
      ]
    });
    confirm.present();
  }
}
