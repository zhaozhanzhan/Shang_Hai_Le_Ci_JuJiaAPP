import { Component, OnInit } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  App,
  ViewController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { loginInfo } from "../../common/config/BaseConfig";
import { LoginPage } from "../login/login";
import { BackButtonService } from "../../common/service/BackButton.Service";
import { Local } from "../../common/service/Storage";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { HttpReqService } from "../../common/service/HttpUtils.Service";
@Component({
  selector: "side-menu",
  templateUrl: "side-menu.html"
})
export class SideMenuPage implements OnInit {
  public loginName: string = null; // 登录者姓名
  public loginPhone: string = null; // 登录者手机

  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private httpReq: HttpReqService, // Http请求服务
    // private fb: FormBuilder, // 响应式表单
    public app: App, // 应用控制器
    public platform: Platform, // 平台控制器
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public menuCtrl: MenuController, // 侧边栏控制
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public alertCtrl: AlertController, // Alert消息弹出框
    private backBtnService: BackButtonService // 返回按钮处理
  ) {
    this.platform.ready().then(() => {
      this.backBtnService.registerBackButtonAction(null); // 返回事件特殊处理
    });
    console.log("Hello SideMenuComponent Component");
  }

  ngOnInit(): void {
    this.ionicStorage.get("loginInfo").then(loginObj => {
      console.error("loginInfo", loginInfo);
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (!_.isNull(loginObj["UserName"])) {
          this.loginPhone = loginObj["UserName"];
        }
        if (!_.isNull(loginObj["UserInfo"])) {
          this.loginName = loginObj["UserInfo"]["workerName"];
        }
      }
    });
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @memberof LoginPage
   */
  public jumpPage(pageName: any): void {
    this.menuCtrl.close();
    this.navCtrl.push(pageName);
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
   * 退出提示
   * @param {string} type
   * @memberof SideMenuPage
   */
  public exit(type: string) {
    const titArr = [
      {
        title: "退出账号",
        message: "确认退出当前账号吗?",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      },
      {
        title: "退出应用",
        message: "确认退出当前应用吗?",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      }
    ];
    this.menuCtrl.close(); // 关闭侧滑菜单
    if (type == "login") {
      this.openAlert(
        titArr[0],
        () => {
          this.exitLogin(); // 退出登录
        },
        () => {}
      );
    } else if (type == "app") {
      this.openAlert(
        titArr[1],
        () => {
          this.exitApp(); // 退出应用
        },
        () => {}
      );
    }
  }

  /**
   * 退出登录
   * @memberof SideMenuPage
   */
  public exitLogin() {
    this.clearLogin(); // 清除登录信息
    this.navCtrl.setRoot(LoginPage); // 跳转到主页
    // this.navCtrl.goToRoot({ animate: false }); // 跳转到主页
    // this.app.getRootNav().push(LoginPage); // 跳转到登录页面
    // this.viewCtrl.dismiss(); // 销毁当前视图
  }

  /**
   * 退出APP应用
   * @memberof SideMenuPage
   */
  public exitApp() {
    this.menuCtrl.close(); // 关闭侧滑菜单
    this.platform.exitApp(); // 退出APP应用
  }

  /**
   * 未开发提示
   * @memberof SideMenuPage
   */
  public noDevTit() {
    this.gloService.showMsg("该功能暂未开发", null, 2000);
  }
}
