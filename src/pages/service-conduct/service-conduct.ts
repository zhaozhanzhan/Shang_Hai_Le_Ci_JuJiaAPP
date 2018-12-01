import { Component } from "@angular/core";
import { UpperCasePipe } from "@angular/common";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ViewController,
  Events,
  App
} from "ionic-angular";
import _ from "underscore"; // 工具类
import { Storage } from "@ionic/storage";
import { NFC } from "@ionic-native/nfc"; // NFC
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { loginInfo } from "../../common/config/BaseConfig";
// import moment from "moment"; // 时间格式化插件
// import { FormBuilder } from "@angular/forms";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { ParamService } from "../../common/service/Param.Service";

@IonicPage()
@Component({
  selector: "page-service-conduct",
  templateUrl: "service-conduct.html"
})
export class ServiceConductPage {
  public formData: any = {}; // 数据信息
  public formInfo: any = {}; // 数据信息
  public beginDura: any = "00:00:00"; // 开始时长
  public hours: any = "00"; // 时
  public minutes: any = "00"; // 分
  public seconds: any = "00"; // 秒
  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    public app: App,
    private ionicStorage: Storage, // IonicStorage
    private httpReq: HttpReqService, // Http请求服务
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public menuCtrl: MenuController, // 侧边栏控制
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public events: Events, // 事件发布与订阅
    public nfc: NFC // NFC
  ) {
    this.ionicStorage.get("loginInfo").then(loginObj => {
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        console.error("loginObj========", loginObj);
        const loginId = loginObj.LoginId;
        if (_.isString(loginId) && loginId.length > 0) {
          const sendData: any = {};
          sendData.serverPersonID = loginId;
          this.httpReq.get(
            "home/a/home/homeServerWork/getWorking",
            sendData,
            data => {
              if (data["data"] && data["data"]["result"] == 0) {
                this.formData = data["data"]["workDetailObj"];
                this.formData.serverItemDetail = this.formData.serverItemDetail
                  .split("/")
                  .join(">");
                this.formInfo = this.formData["userArchivesObj"];
                const bTime = this.formData.startTime;
                const eTime = new Date();
                const timeVal = this.calTime(bTime, eTime);
                const isStart = this.getDuration(timeVal);
                if (isStart) {
                  this.startWatch();
                  this.initNfcListener(); // 初始化NFC监听

                  //=================订阅NFC扫描成功事件 Begin=================//
                  this.events.subscribe("nfcScanSuc", nfcId => {
                    this.closeServer(nfcId); // 关闭服务
                    // this.events.unsubscribe("nfcScanSuc");
                  });
                  //=================订阅NFC扫描成功事件 End=================//
                }
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
    // const nfcId = this.navParams.get("nfcId");
    // ParamService.setParamNfc(nfcId);
    // console.error("ParamService.getParamNfc", ParamService.getParamNfc());
    // const sendData: any = {};
    // sendData.nfcNo = nfcId;
    // this.httpReq.get(
    //   "home/a/server/homeUserArchives/getByNfcNo",
    //   sendData,
    //   data => {
    //     if (data["data"] && data["data"]["homeUserArchives"]) {
    //       this.formInfo = data["data"]["homeUserArchives"];
    //       ParamService.setParamId(data["data"]["homeUserArchives"]["id"]);
    //       this.personInfo = data["data"]["homeArchiveAddress"];
    //     } else {
    //       this.formInfo = {};
    //       this.gloService.showMsg("未获取到用户信息！");
    //       this.navCtrl.pop();
    //     }
    //   }
    // );
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ServiceConductPage");
  }

  ionViewWillLeave() {
    this.events.unsubscribe("nfcScanSuc"); // 取消NFC扫描成功事件
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

  /**
   * 计算时间差
   * @param {*} bTime
   * @param {*} eTime
   * @memberof ServiceConductPage
   */
  public calTime(bTime: any, eTime: any) {
    const bTimeStr = new Date(bTime).toString();
    const eTimeStr = new Date(eTime).toString();
    let bTimeStamp: any = null; // 起始时间时间戳
    let eTimeStamp: any = null; // 结束时间时间戳
    let timeVal = 0;
    if (bTimeStr == "Invalid Date") {
      this.gloService.showMsg("时间格式不正确");
      return;
    } else {
      bTimeStamp = new Date(bTime).getTime();
    }
    if (eTimeStr == "Invalid Date") {
      this.gloService.showMsg("时间格式不正确");
      return;
    } else {
      eTimeStamp = new Date(eTime).getTime();
    }
    console.error("bTimeStamp", bTimeStamp);
    console.error("eTimeStamp", eTimeStamp);
    if (bTimeStamp - eTimeStamp > 10000) {
      this.gloService.showMsg("开始时间不能大于结束时间");
      return;
    }
    timeVal = eTimeStamp - bTimeStamp;
    if (timeVal < 0) {
      return 0;
    }
    return timeVal;
  }

  /**
   * 获取时长计算时分秒
   * @param {*} timeVal
   * @memberof ServiceConductPage
   */
  public getDuration(timeVal: any) {
    if (_.isNumber(parseInt(timeVal)) && parseInt(timeVal) >= 0) {
      let hours: any = Math.floor((timeVal / (1000 * 60 * 60)) % 24);
      let minutes: any = Math.floor((timeVal / (1000 * 60)) % 60);
      let seconds: any = Math.floor((timeVal / 1000) % 60);
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      this.hours = hours;
      this.minutes = minutes;
      this.seconds = seconds;
      return true;
    } else {
      this.gloService.showMsg("获取时长出错！");
      return false;
    }
  }

  /**
   * 开始计时
   * @memberof ServiceConductPage
   */
  public startWatch() {
    const that = this;
    setInterval(() => {
      let hours: any = parseInt(this.hours);
      let minutes: any = parseInt(this.minutes);
      let seconds: any = parseInt(this.seconds);
      if (seconds < 59) {
        seconds += 1;
      } else {
        seconds = 0;
        if (minutes < 59) {
          minutes += 1;
        } else {
          minutes = 0;
          hours += 1;
        }
      }
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      that.hours = hours;
      that.minutes = minutes;
      that.seconds = seconds;
    }, 1000);
  }

  /**
   * 初始化NFC监听
   * @memberof MyApp
   */
  public initNfcListener() {
    let that = this;
    if (this.platform.is("android") && !this.platform.is("mobileweb")) {
      this.nfc
        .enabled()
        .then(enabled => {
          that.nfc
            .addNdefListener(() => {}, err => {})
            .subscribe(event => {
              let rfid = that.nfc.bytesToHexString(event.tag.id);
              let nfcId = rfid.replace(/(.{2})/g, "$1:").replace(/(:)$/, "");
              const upperTrans = new UpperCasePipe().transform(nfcId);
              if (loginInfo.LoginState == "success") {
                // const nfcId = event.tag.id.join(":");
                // this.gloService.showMsg(upperTrans, null, 3000);
                this.events.publish("nfcScanSuc", upperTrans);
                // this.jumpPage("CardReadPage");
              } else {
                this.gloService.showMsg("用户未登录！");
              }
              // that.events.publish(EventTag.NFCScanned, rfid);
            });
          that.nfc
            .addNdefFormatableListener(() => {}, err => {})
            .subscribe(event => {
              let rfid = that.nfc.bytesToHexString(event.tag.id);
              let nfcId = rfid.replace(/(.{2})/g, "$1:").replace(/(:)$/, "");
              const upperTrans = new UpperCasePipe().transform(nfcId);
              if (loginInfo.LoginState == "success") {
                // const nfcId = event.tag.id.join(":");
                // this.gloService.showMsg(upperTrans, null, 3000);
                this.events.publish("nfcScanSuc", upperTrans);
                // this.jumpPage("CardReadPage");
              } else {
                this.gloService.showMsg("用户未登录！");
              }
              // that.events.publish(EventTag.NFCScanned, rfid);
            });
        })
        .catch(() => {
          that.showNfcOpenConfirm();
        });
    }
  }

  /**
   * 显示去开启NFC确认提示功能
   * @memberof MyApp
   */
  public showNfcOpenConfirm() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "NFC功能未开启，请前往设置页面开启！",
      buttons: [
        {
          text: "不开启",
          handler: () => {}
        },
        {
          text: "前往设置",
          handler: () => {
            this.nfc.showSettings();
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * 关闭服务
   * @param {*} nfcId nfc16进制码
   * @memberof ServiceConductPage
   */
  public closeServer(nfcId: any) {
    setTimeout(() => {
      let rootNav = this.app.getRootNavs()[0]; // 获取根导航
      let ionicApp = rootNav._app._appRoot;
      let activePortal = ionicApp._overlayPortal.getActive();
      if (activePortal) {
        return;
      }
      const confirm = this.alertCtrl.create({
        title: "提示",
        message: "确定要关闭服务吗？",
        buttons: [
          {
            text: "取消",
            handler: () => {
              //=================订阅NFC扫描成功事件 Begin=================//
              // this.events.subscribe("nfcScanSuc", nfcId => {
              //   this.closeServer(nfcId); // 关闭服务
              //   this.events.unsubscribe("nfcScanSuc");
              // });
              //=================订阅NFC扫描成功事件 End=================//
            }
          },
          {
            text: "确定",
            handler: () => {
              const serId = this.formData.workID;
              if (_.isString(serId) && serId.length > 0) {
                const sendData: any = {};
                sendData.id = serId;
                sendData.nfcNo = nfcId;
                this.httpReq.get(
                  "home/a/home/homeServerWork/end",
                  sendData,
                  data => {
                    if (data["data"] && data["data"]["result"] == 0) {
                      this.jumpPage("ServiceCompletePage", {
                        serviceId: this.formData.workID
                      });
                    } else {
                      this.gloService.showMsg(data["data"]["message"]);
                      //=================订阅NFC扫描成功事件 Begin=================//
                      // this.events.subscribe("nfcScanSuc", nfcId => {
                      //   this.closeServer(nfcId); // 关闭服务
                      //   this.events.unsubscribe("nfcScanSuc");
                      // });
                      //=================订阅NFC扫描成功事件 End=================//
                      return;
                    }
                  }
                );
              } else {
                this.gloService.showMsg("未获取到服务ID");
                if (this.navCtrl.canGoBack()) {
                  this.navCtrl.pop();
                }
                //=================订阅NFC扫描成功事件 Begin=================//
                // this.events.subscribe("nfcScanSuc", nfcId => {
                //   this.closeServer(nfcId); // 关闭服务
                //   this.events.unsubscribe("nfcScanSuc");
                // });
                //=================订阅NFC扫描成功事件 End=================//
                return;
              }
            }
          }
        ]
      });
      confirm.present();
    }, 150);
  }
}
