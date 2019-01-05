import { loginInfo } from "./../common/config/BaseConfig";
import { Component, ViewChild, AfterViewInit } from "@angular/core";
import {
  Nav,
  Platform,
  Keyboard,
  AlertController,
  ModalController,
  LoadingController,
  ToastController,
  IonicApp,
  Events,
  App
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // 工具类
import { GlobalService } from "../common/service/GlobalService"; // 全局公共服务
import { PushService } from "./../common/service/Push.Service"; // 极光推送
import { StatusBar } from "@ionic-native/status-bar"; // 导航条
import { SplashScreen } from "@ionic-native/splash-screen"; // 启动动画
import { Geolocation } from "@ionic-native/geolocation"; // GPS定位
import { AndroidPermissions } from "@ionic-native/android-permissions"; // Android权限控制
import { OpenNativeSettings } from "@ionic-native/open-native-settings"; // 系统设置
import { NativeAudio } from "@ionic-native/native-audio"; // 音频播放
import { LoginPage } from "./../pages/login/login"; // 登录页面
import { HttpReqService } from "../common/service/HttpUtils.Service"; // HTTP数据请求服务
import { AppUpdateService } from "../common/service/AppUpdate.Service";
import { SelectCityService } from "../common/service/SelectCity.Service";
import { LocalNotifications } from "@ionic-native/local-notifications";
import { ServiceNotification } from "../common/service/ServiceNotification";
import { Local } from "../common/service/Storage";

declare var cordova: any; //导入第三方的库定义到 TS 项目中

@Component({
  templateUrl: "app.html" // 根页面View区域
})
export class MyApp implements AfterViewInit {
  @ViewChild(Nav)
  nav: Nav;

  public rootPage: any = LoginPage; // 设置根页面组件
  public pages: Array<{ title: string; component: any }>; // 页面组件数组
  public registerBackButton: any = false; // 返回按钮状态
  public checkRootPage: any; // 判断当前是否是根页面
  public registerBackEvent: Function; // 安卓硬件返回处理方法

  constructor(
    public app: App,
    public ionicApp: IonicApp,
    public platform: Platform,
    public httpReq: HttpReqService, // Http请求服务
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public keyboard: Keyboard,
    public jGPush: PushService, // 极光推送
    public geolocation: Geolocation, // GPS定位
    public localNotifications: LocalNotifications, // 本地通知
    public alertCtrl: AlertController, // Alert消息弹出框
    public androidPermissions: AndroidPermissions, // Android权限控制
    public openNativeSettings: OpenNativeSettings, // 系统设置
    public modalCtrl: ModalController, // Modal弹出页控制器
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public appUpdate: AppUpdateService, // app升级更新
    public serNotifi: ServiceNotification, // 服务开启定时通知关闭
    public selCity: SelectCityService, // 省市区三级联动
    public nativeAudio: NativeAudio, // 音频播放
    public events: Events // 事件发布与订阅
  ) {
    console.error("window", window);
    console.error("this", this);
    console.error("this.nav：", this.nav);
    console.error("this.appUpdate：", this.appUpdate);
    console.error("this.serNotifi", this.serNotifi);
    this.initializeApp(); // 初始化APP
    this.pages = [{ title: "Login", component: LoginPage }]; // 页面组件数组
  }

  ngAfterViewInit() {
    // 视图初始化之后
  }

  private initializeApp() {
    // 初始化APP
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      // setTimeout(() => {
      // 慢一秒在隐藏splashScreen 完美解决白屏问题
      this.splashScreen.hide();
      // }, 1000);
      this.jGPush.initJpush(); // 初始化极光推送
      this.serNotifi.initSerNotif(); // 初始化护工服务时长通知

      //=================是否第一次开启应用 Begin=================//
      this.ionicStorage.get("isOpen").then(result => {
        if (result) {
          console.error("是否是第一次进入程序" + result); //不是就直接
          // this.rootPage = LoginPage;
        } else {
          this.ionicStorage.set("isOpen", true);
          console.log(this.ionicStorage.get("isOpen"));
        }
      });
      //=================是否第一次开启应用 End=================//

      //=================获取GPS权限处理 Begin=================//
      const gpsPermission = this.androidPermissions.PERMISSION
        .ACCESS_FINE_LOCATION;

      this.androidPermissions.checkPermission(gpsPermission).then(
        result => {
          const isPermission = result.hasPermission;
          if (isPermission) {
            //=================获取GPS定位信息 Begin=================//
            this.getGpsInfo(); // 提交GPS信息给后台
            //=================获取GPS定位信息 End=================//
          } else {
            this.gloService.showMsg(
              "获取定位权限失败，请开启应用权限",
              null,
              3000
            );
            this.androidPermissions.requestPermission(gpsPermission);

            //=================是否第一次开启应用 Begin=================//
            this.ionicStorage.get("isOpen").then(result => {
              if (result) {
                console.error("是否是第一次进入程序" + result); //不是就直接
                if (this.platform.is("android") || this.platform.is("ios")) {
                  try {
                    console.error("cordova=======", cordova);
                  } catch (error) {
                    console.error("==========未找到cordova=======");
                    return;
                  }
                  this.openGpsSetting(); // 打开GPS设置页面提示
                }
                // this.rootPage = LoginPage;
              } else {
                this.ionicStorage.set("isOpen", true);
                console.log(this.ionicStorage.get("isOpen"));
              }
            });
            //=================是否第一次开启应用 End=================//
          }
        },
        err => {
          this.gloService.showMsg(
            "获取定位权限失败，请开启应用权限",
            null,
            3000
          );
          this.androidPermissions.requestPermission(gpsPermission);
          //=================是否第一次开启应用 Begin=================//
          this.ionicStorage.get("isOpen").then(result => {
            if (result) {
              console.error("是否是第一次进入程序" + result); //不是就直接
              try {
                console.error("cordova=======", cordova);
              } catch (error) {
                console.error("==========未找到cordova=======");
                return;
              }
              this.openGpsSetting(); // 打开GPS设置页面提示
              // this.rootPage = LoginPage;
            } else {
              this.ionicStorage.set("isOpen", true);
              console.log(this.ionicStorage.get("isOpen"));
            }
          });
          //=================是否第一次开启应用 End=================//
        }
      );

      // setInterval(() => {
      //   this.getGpsInfo(); // 提交GPS信息给后台
      // }, 10000);
      //=================获取GPS权限处理 End=================//

      //=================获取通知权限处理 Begin=================//
      this.localNotifications.hasPermission().then(
        notifiPermission => {
          console.error("notifiPermission权限=======", notifiPermission);
          if (!notifiPermission) {
            // 没有通知权限
            try {
              console.error("cordova=======", cordova);
            } catch (error) {
              console.error("==========未找到cordova=======");
              return;
            }
            this.openNotifiSetting(); // 打开通知权限设置页面提示
          }
        },
        err => {
          // 没有通知权限
          try {
            console.error("cordova=======", cordova);
          } catch (error) {
            console.error("==========未找到cordova=======");
            return;
          }
          this.openNotifiSetting(); // 打开通知权限设置页面提示
        }
      );

      // const notifiPermission = this.androidPermissions.PERMISSION
      //   .BIND_NOTIFICATION_LISTENER_SERVICE;
      // this.androidPermissions.checkPermission(notifiPermission).then(
      //   result => {
      //     console.error(
      //       "Has permission notifiPermission?",
      //       result.hasPermission
      //     );
      //     const isPermission = result.hasPermission;
      //     try {
      //       console.error("cordova=======", cordova);
      //     } catch (error) {
      //       console.error("==========未找到cordova=======");
      //       return;
      //     }
      //     if (!isPermission) {
      //       this.openNotifiSetting(); // 打开通知权限设置页面提示
      //     }
      //   },
      //   err => {
      //     try {
      //       console.error("cordova=======", cordova);
      //     } catch (error) {
      //       console.error("==========未找到cordova=======");
      //       return;
      //     }
      //     this.openNotifiSetting(); // 打开通知权限设置页面提示
      //   }
      // );

      //=================获取通知权限处理 End=================//

      //=================安卓退出按钮 Begin=================//

      // this.registerBackEvent = this.platform.registerBackButtonAction(() => {
      //   // 安卓硬件返回处理方法
      //   if (this.keyboard.isOpen()) {
      //     //按下返回键时，先关闭键盘
      //     this.keyboard.close();
      //     return;
      //   }

      //   this.goBackLogic();
      //   console.log("监听右键Boolean值：" + this.checkRootPage);
      //   if (this.checkRootPage) {
      //     //如果是根目则按照需求1处理
      //     this.exitApp();
      //   } else {
      //     //非根目录返回上一级页面
      //     this.app.goBack();
      //   }
      // }, 10); // 后面的数字10是必要参数，如果不写默认是0，数字越大优先级越高

      //=================安卓退出按钮 End=================//

      //=================订阅极光推送通知事件 Begin=================//
      this.events.subscribe("jpush.receiveNotification", () => {
        this.jPushReceivNotification(); // 极光推送收到通知
      });

      this.events.subscribe("jpush.openNotification", () => {
        this.jPushOpenNotification(); // 极光推送打开通知
      });

      this.events.subscribe("jpush.cancelOrderNotification", () => {
        this.cancelOrderNotification(); // 取消订单通知
      });
      //=================订阅极光推送通知事件 End=================//

      //=================订阅全局退出通知事件 Begin=================//
      this.events.subscribe("exitLogin", () => {
        this.exitLogin(); // 退出登录
      });
      //=================订阅全局退出通知事件 End=================//

      //=================订阅全局服务结束事件 Begin=================//
      this.events.subscribe("serviceEndEvent", data => {
        console.error("nfcNo", data.nfcNo);
        console.error("workId", data.workId);
        // console.error("loginId", loginInfo.LoginId);
        // const loginId = loginInfo.LoginId;
        // const workId = loginInfo.LoginId;
        const sendData: any = {};
        if (_.isString(data.workId) && data.workId.length > 0) {
          sendData.id = data.workId;
        } else {
          this.gloService.showMsg("未获取到用户ID");
          return;
        }
        if (_.isString(data.nfcNo) && data.nfcNo.length > 0) {
          sendData.nfcNo = data.nfcNo;
        } else {
          this.gloService.showMsg("未获取到NFC标签");
          return;
        }
        this.httpReq.get(
          "home/a/home/homeServerWork/abnormalEnd",
          sendData,
          (data: any) => {
            if (data["data"] && data["data"]["result"] == 0) {
              console.error(
                "this.app.getActiveNavs()[0]",
                this.app.getActiveNavs()[0]
              );
              this.app.getActiveNavs()[0].setRoot("MainPage");
              this.serNotifi.closeServer(); // 关闭定时服务
            }
          }
        );
        // this.app.getActiveNavs()[0].setRoot("MainPage");
      });
      //=================订阅全局服务结束事件 End=================//

      //=================订阅全局通知点击事件 Begin=================//
      this.events.subscribe("notifiClickEvent", data => {
        this.ionicStorage.get("loginInfo").then(loginObj => {
          console.error("loginInfo", loginInfo);
          if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
            // 判断是否是空对象
            if (
              !_.isNull(loginObj.LoginState) &&
              loginObj.LoginState == "success"
            ) {
              this.app.getActiveNavs()[0].setRoot("MainPage");
              this.app.getActiveNavs()[0].push("ServiceConductPage"); // 跳转到服务进行中计时页面
            }
          }
        });
      });
      //=================订阅全局通知点击事件 End=================//
    });
  }

  //=================退出按钮重写 Begin=================//

  /**
   * 点击安卓原生返回键
   * @memberof MyApp
   */
  // public exitApp() {
  //   if (this.registerBackButton) {
  //     this.platform.exitApp(); // 退出APP应用
  //   } else {
  //     this.registerBackButton = true;
  //     this.gloService.showMsg("再按一次退出应用", null, 2000);
  //     setTimeout(() => (this.registerBackButton = false), 2000); //2秒内没有再次点击返回则将触发标志标记为false
  //   }
  // }

  /**
   * 判断当前页面是否为根页面
   * @memberof MyApp
   */
  // public goBackLogic() {
  //   console.error(this.app);

  //   const currentCmp = this.app.getActiveNav().getActive().component; // 获取当前激活的页面组件
  //   console.error(currentCmp);
  //   const isRootPage =
  //     currentCmp == LoginPage ||
  //     currentCmp == MainPage ||
  //     currentCmp == HomePage; // 判断当前页面是否为根页面

  //   if (isRootPage) {
  //     // 判断当前是否是根页面
  //     this.checkRootPage = true;
  //   } else {
  //     this.checkRootPage = false;
  //   }
  // }
  //=================退出按钮重写 End=================//

  /**
   * 获取GPS信息提交给后台
   * @memberof MyApp
   */
  public getGpsInfo() {
    const gps: any = {
      lat: null,
      lon: null
    };
    this.geolocation
      .getCurrentPosition()
      .then(resp => {
        gps.lat = resp.coords.latitude; // GPS纬度
        gps.lon = resp.coords.longitude; // GPS经度
        if (_.isNull(gps.lat) || _.isNull(gps.lon)) {
          return;
        }
        this.ionicStorage.get("loginInfo").then(loginObj => {
          if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
            if (
              !_.isNull(loginObj.LoginState) &&
              loginObj.LoginState == "success"
            ) {
              gps.id = loginObj["UserInfo"]["id"]; // 拉包工信息ID
              this.httpReq.post("workerUser/saveLatAndLon", null, gps, data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                  } else {
                    this.gloService.showMsg(data["message"], null, 3000);
                  }
                } else {
                  // this.gloService.showMsg("请求服务器出错", null, 3000);
                }
              });
            }
          }
        });
      })
      .catch(error => {
        // console.log("获取位置信息失败", error);
      });
  }

  // openPage(page) {
  //   this.nav.setRoot(page.component); // 设置根组件无后退按钮
  // }

  /**
   * 打开GPS设置页面提示
   * @memberof MyApp
   */
  public openGpsSetting() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "应用GPS定位权限功能未开启，请前往设置页面开启！",
      buttons: [
        {
          text: "不开启",
          handler: () => {}
        },
        {
          text: "前往设置",
          handler: () => {
            this.openNativeSettings.open("location");
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * 打开通知权限设置页面提示
   * @memberof MyApp
   */
  public openNotifiSetting() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "检测到应用通知权限未开启，请前往设置页面开启！",
      buttons: [
        {
          text: "不开启",
          handler: () => {}
        },
        {
          text: "前往设置",
          handler: () => {
            this.openNativeSettings.open("application_details");
            // this.openNativeSettings.open("application_development");
            // this.openNativeSettings.open("application");
            // this.openNativeSettings.open("notification_id");
          }
        }
      ]
    });
    let rootNav = this.app.getRootNavs()[0]; // 获取根导航
    let ionicApp = rootNav._app._appRoot;
    let activePortal = ionicApp._overlayPortal.getActive();
    if (activePortal) {
    } else {
      confirm.present();
    }
  }

  /**
   * 极光推送收到通知
   * @memberof MyApp
   */
  public jPushReceivNotification() {
    this.jPushNotificationAlert(); // 收到通知出现弹出提示框
  }

  /**
   * 极光推送打开通知
   * @memberof MyApp
   */
  public jPushOpenNotification() {
    // this.jPushNotificationAlert(); // 打开通知出现弹出提示框
    // const activeView = this.nav.getActive(); // 返回活动页面的视图控制器
    // const activeNav = activeView.getNav(); // 返回活动页面的视图控制器
    // console.log("%c 收到通知出现弹出提示框", "color:#DB0039;", activeNav);
    // activeNav.popToRoot().then(suc => {
    //   // 页面返回到根页面
    //   this.nav.push("MyTaskPage");
    // });
  }

  /**
   * 收到通知出现弹出提示框
   * @memberof MyApp
   */
  public jPushNotificationAlert() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "收到订单，是否进入我的任务查看？",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确定",
          handler: () => {
            const activeView = this.nav.getActive(); // 返回活动页面的视图控制器
            const activeNav = activeView.getNav(); // 返回活动页面的视图控制器
            console.log(
              "%c 收到通知出现弹出提示框",
              "color:#DB0039;",
              activeNav
            );
            activeNav.popToRoot().then(suc => {
              // 页面返回到根页面
              this.nav.push("MyTaskPage");
            });
          }
        }
      ]
    });
    this.ionicStorage.get("loginInfo").then(loginObj => {
      console.error("loginInfo", loginInfo);
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (
          !_.isNull(loginObj.LoginState) &&
          loginObj.LoginState == "success"
        ) {
          let rootNav = this.app.getRootNavs()[0]; // 获取根导航
          let ionicApp = rootNav._app._appRoot;
          let activePortal = ionicApp._overlayPortal.getActive();
          if (activePortal) {
          } else {
            confirm.present();
          }
        }
      }
    });
  }

  /**
   *  取消订单通知
   * @memberof MyApp
   */
  public cancelOrderNotification() {
    let alert = this.alertCtrl.create({
      title: "提示",
      subTitle: "商户取消了订单，请刷新我的任务列表！",
      buttons: ["确定"]
    });
    let rootNav = this.app.getRootNavs()[0]; // 获取根导航
    let ionicApp = rootNav._app._appRoot;
    let activePortal = ionicApp._overlayPortal.getActive();
    if (activePortal) {
    } else {
      alert.present();
    }
  }

  /**
   * 清除登录信息
   * @memberof LoginPage
   */
  public clearLogin() {
    for (const key in loginInfo) {
      if (loginInfo.hasOwnProperty(key) && key !== "UserName") {
        loginInfo[key] = null;
      }
    }
    Local.set("sessionId", "");
    this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
    this.ionicStorage.set("userInfo", loginInfo["UserInfo"]); // 后台返回用户信息对象
  }

  /**
   * 退出登录
   * @memberof SideMenuPage
   */
  public exitLogin() {
    this.clearLogin(); // 清除登录信息
    this.app.getActiveNavs()[0].setRoot(LoginPage);
    // this.navCtrl.setRoot(LoginPage); // 跳转到主页
    // this.navCtrl.goToRoot({ animate: false }); // 跳转到主页
    // this.app.getRootNav().push(LoginPage); // 跳转到登录页面
    // this.viewCtrl.dismiss(); // 销毁当前视图
  }
}
