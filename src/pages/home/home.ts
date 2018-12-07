import { Component, ViewChild } from "@angular/core";
import { UpperCasePipe } from "@angular/common";
import {
  Slides,
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  Events,
  App
} from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio";
import { Storage } from "@ionic/storage";
import { NFC } from "@ionic-native/nfc"; // NFC
import _ from "underscore"; // 工具类
import { GlobalService } from "../../common/service/GlobalService";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
import { ServiceNotification } from "../../common/service/ServiceNotification";
import { loginInfo } from "../../common/config/BaseConfig";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  @ViewChild(Slides)
  slides: Slides;

  public recOrderState: boolean = false; // 定义接单状态
  public noHandleOrderNum: any = null; // 未处理订单数量
  public isOpenSer: boolean = false; // 是否已经开启服务
  public nfcId: any = null; // 是否已经开启服务
  public timerInter: any = null; // 定时器

  // public beginTime: any = null; // 服务开始时间
  // public endTime: any = null; // 服务终止时间
  // public nowTime: any = null; // 服务当前时间
  // public maxTime: any = null; // 服务最大超时时间
  // public manyMinutes: any = 2; // 多少分钟后应该结束服务
  // public remindMinutes: any = 1; // 每隔几分钟提醒
  // public remindTimeArr: any = []; // 提醒时间点时间戳数组
  // public totalRemind: any = 3; // 总提醒次数
  // public remindNum: any = null; // 剩于提醒次数
  public beginDura: any = "00:00:00"; // 时长
  public hours: any = "00"; // 时
  public minutes: any = "00"; // 分
  public seconds: any = "00"; // 秒

  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    public app: App,
    private httpReq: HttpReqService, // Http请求服务
    private ionicStorage: Storage, // IonicStorage
    public nfc: NFC, // NFC
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio, // 音频播放
    public events: Events, // 事件发布与订阅
    public serNotifi: ServiceNotification // 服务开启定时通知关闭
  ) {}

  ionViewDidLoad() {}

  ionViewDidEnter() {
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
                this.isOpenSer = true;
                if (
                  data["data"]["workDetailObj"] &&
                  data["data"]["workDetailObj"]["startTime"]
                ) {
                  this.nfcId = data["data"]["workDetailObj"]["nfcNo"];
                  const bTime = data["data"]["workDetailObj"]["startTime"];

                  this.serNotifi.bTimeStamp(bTime); // 将开始时间转换为时间戳
                  this.serNotifi.calTimeStamp(); // 计算各种所需要的时间戳
                  this.serNotifi.getRemindArr(); // 获取提醒对象数组

                  this.serNotifi.getHms(data => {
                    // 获取时分秒并回调
                    console.error("data", data);
                    this.hours = data.hours;
                    this.minutes = data.minutes;
                    this.seconds = data.seconds;
                    this.startWatch();
                    this.serNotifi.openServer(); // 开启定时服务
                    // this.serNotifi.startWatch(data => {}); // 开启时长计时
                  }); // 获取服务时长服务

                  // this.serNotifi.openServer();
                  // const beginTimeStr =
                  //   data["data"]["workDetailObj"]["startTime"];
                  // this.beginTime = new Date(beginTimeStr).getTime(); // 服务开始时间时间戳
                  // this.endTime = this.beginTime + this.manyMinutes * 60 * 1000;
                  // console.error(
                  //   "this.beginTime,this.endTime",
                  //   this.beginTime,
                  //   this.endTime
                  // );
                  // this.maxTime =
                  //   this.endTime +
                  //   this.totalRemind * this.remindMinutes * 60 * 1000; // 最大超时时间戳
                  // this.nowTime = new Date().getTime(); // 系统当前时间时间戳
                  // this.remindNum = this.totalRemind; // 剩于提醒次数初始化为总提醒数
                  // if (this.nowTime < this.endTime) {
                  //   // 现在时间小于服务应该结束时间
                  //   // 不处理
                  // } else if (this.nowTime == this.endTime) {
                  //   // 现在时间等于服务应该结束时间
                  //   // 开始提醒一次
                  // } else if (this.nowTime > this.endTime) {
                  //   // 现在时间大于服务应该结束时间
                  //   this.remindTimeArr.push(this.endTime);
                  //   for (let i = 1; i <= this.totalRemind; i++) {
                  //     const timeStamp =
                  //       this.endTime + i * this.remindMinutes * 60 * 1000;
                  //     this.remindTimeArr.push(timeStamp);
                  //   }
                  //   console.error("this.remindTimeArr", this.remindTimeArr);
                  //   let subsection: any = null; // 当前处于第几段
                  //   for (let i = 0; i < this.remindTimeArr.length; i++) {
                  //     if (this.nowTime > this.remindTimeArr[i]) {
                  //       // 当前时间大于某个点
                  //       subsection = i;
                  //       break;
                  //     } else {
                  //       // 当前时间小于等于某个点
                  //       this.remindNum--;
                  //     }
                  //   }
                  // }
                  // const timeVal = this.calTime(this.beginTime, this.endTime);
                  // const isStart = this.getDuration(timeVal);
                  // if (isStart) {
                  //   this.startWatch();
                  // }
                  // if (true) {
                  //   this.startWatch();
                  // }
                }
              } else {
                this.isOpenSer = false;
                // this.gloService.showMsg(data["data"]["message"]);
              }
            }
          );
        } else {
          this.isOpenSer = false;
          this.gloService.showMsg("未获取到用户ID!");
        }
      } else {
        this.isOpenSer = false;
        this.gloService.showMsg("未获取到用户ID!");
      }
    });
    console.error("this.navCtrl", this.navCtrl);
    this.initNfcListener(); // 初始化NFC监听

    //=================订阅NFC扫描成功事件 Begin=================//
    this.events.subscribe("nfcScanSuc", nfcId => {
      if (this.isOpenSer) {
        // 已经开启
        if (nfcId == this.nfcId) {
          // 已经服务标签与扫描标签相同
          this.events.unsubscribe("nfcScanSuc");
          this.jumpPage("ServiceConductPage");
        } else {
          setTimeout(() => {
            let rootNav = this.app.getRootNavs()[0]; // 获取根导航
            let ionicApp = rootNav._app._appRoot;
            let activePortal = ionicApp._toastPortal.getActive();
            if (activePortal) {
            } else {
              this.gloService.showMsg("扫描标签与已开服务标签不一致！");
            }
          }, 300);
        }
      } else {
        this.events.unsubscribe("nfcScanSuc");
        this.jumpPage("CardReadPage", { nfcId: nfcId });
      }
    });
    //=================订阅NFC扫描成功事件 End=================//

    ParamService.setParamNfc(null);
    ParamService.setParamId(null);
    console.error("ParamService.getParamNfc", ParamService.getParamNfc());
    // setTimeout(() => {
    //   this.navCtrl.push("MyTaskPage");
    // }, 3000);
  }

  ionViewWillLeave() {
    this.events.unsubscribe("nfcScanSuc"); // 取消NFC扫描成功事件
  }

  /**
   * 切换侧滑菜单
   * @memberof HomePage
   */
  public toggleMenu() {
    this.menuCtrl.toggle();
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
   * 打开确认提示对话框
   * @param {Object} titObj 按钮提示信息对象
   * @param {*} confirm 点击确认执行的操作
   * @param {*} cancel 点击取消执行的操作
   * @memberof HomePage
   */
  public openAlert(titObj: Object, confirm: any, cancel: any) {
    let alert = this.alertCtrl.create({
      title: titObj["title"],
      message: titObj["message"],
      buttons: [
        {
          text: titObj["buttonTxt1"],
          role: "cancel",
          handler: cancel
        },
        {
          text: titObj["buttonTxt2"],
          handler: confirm
        }
      ]
    });
    alert.present();
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
    this.timerInter = setInterval(() => {
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
   * 关闭计时
   * @memberof HomePage
   */
  public closeWatch() {
    window.clearInterval(this.timerInter); // 清除定时器
  }

  /**
   * 未开发提示
   * @memberof HomePage
   */
  public noDevTit() {
    this.gloService.showMsg("该功能暂未开发", null, 2000);
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
}
