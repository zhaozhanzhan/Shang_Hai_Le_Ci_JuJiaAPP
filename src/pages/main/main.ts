import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Navbar,
  ModalController,
  App
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { loginInfo } from "../../common/config/BaseConfig";
import { LoginPage } from "../login/login";
import { HomePage } from "../home/home";
import { Local } from "../../common/service/Storage";

@IonicPage()
@Component({
  selector: "page-main",
  templateUrl: "main.html"
})
export class MainPage {
  @ViewChild(Navbar)
  navBar: Navbar;

  public rootPage: any = HomePage; // 设置根页面组件

  constructor(
    public app: App, // 应用控制器
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public modalCtrl: ModalController, // Modal弹出页控制器
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService // 全局自定义服务
  ) {
    console.log("MainPage", "constructor");
  }

  ionViewCanEnter() {
    console.log("MainPage", "ionViewCanEnter");
  }

  ionViewDidLoad() {
    //获取上一次登录的信息
    this.ionicStorage.get("loginInfo").then(loginObj => {
      console.error("loginInfo", loginInfo);
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (
          !_.isNull(loginObj.LoginState) &&
          loginObj.LoginState == "success"
        ) {
          // 判断以前是否登录成功过
          let loginHour = loginObj.LoginTime; // 登录成功小时数
          let curTime = new Date().getTime(); // 当前时间
          let interHour = Math.floor((curTime - loginHour) / 1000 / 3600); // 登录间隔小时数
          if (interHour < 24) {
            // 间隔时间小于24小时,可自动登录,不需要得新登录
            loginObj.LoginTime = new Date().getTime(); // 重置登录时间
            for (const key in loginObj) {
              // 更新全局信息对象
              if (loginObj.hasOwnProperty(key)) {
                loginInfo[key] = loginObj[key];
              }
            }
            this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
            this.ionicStorage.set("userInfo", loginInfo["UserInfo"]); // 后台返回用户信息对象
            // loginInfo.UserInfo = data["data"]; // 后台返回用户信息对象
            // this.ionicStorage.set("userInfo", data["data"]); // 后台返回用户信息对象
            // loginObj.LoginTime = new Date().getTime(); // 重置登录时间
            // this.ionicStorage.set("loginInfo", loginObj); // 登录信息配置对象
            // loginInfo.LoginState = "success"; // 登录状态
            // loginInfo.UserName = formData.phone; // 用户名
            // loginInfo.Password = formData.password; // 用户密码
            // loginInfo.UserInfo = data["data"]; // 后台返回用户信息对象
            // this.ionicStorage.set("userInfo", data["data"]); // 后台返回用户信息对象
          } else {
            // 需要重新登录
            this.clearLogin(); // 清除登录信息
            this.app.getRootNav().push(LoginPage); // 跳转到主页
          }
        } else {
          // 以前未登录过
          this.clearLogin(); // 清除登录信息
          this.app.getRootNav().push(LoginPage); // 跳转到主页
        }
      } else {
        // 需要重新登录
        this.clearLogin(); // 清除登录信息
        this.app.getRootNav().push(LoginPage); // 跳转到主页
      }
    });
  }

  /**
   * 清除登录信息
   * @memberof LoginPage
   */
  public clearLogin() {
    for (const key in loginInfo) {
      if (loginInfo.hasOwnProperty(key)) {
        loginInfo[key] = null;
      }
    }
    Local.set("sessionId", "");
    this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
    this.ionicStorage.set("userInfo", loginInfo["UserInfo"]); // 后台返回用户信息对象
  }
}
