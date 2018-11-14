import { Component, ViewChild } from "@angular/core";
import {
  Content,
  NavController,
  NavParams,
  ModalController,
  App,
  ViewController,
  Platform
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { FormValidService } from "../../common/service/FormValid.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { GlobalMethod } from "./../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { loginInfo } from "../../common/config/BaseConfig";
import { ForgetPasswordPage } from "./../forget-password/forget-password"; // 忘记密码
import { FastLoginPage } from "../fast-login/fast-login"; // 快速登录
import { PushService } from "../../common/service/Push.Service";
import { BackButtonService } from "../../common/service/BackButton.Service";
// import { MainPage } from "../main/main";

@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  @ViewChild(Content)
  content: Content;

  public formData: FormGroup; // 定义表单对象
  constructor(
    public app: App, // 应用控制器
    public platform: Platform, // 平台控制器
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public modalCtrl: ModalController, // Modal弹出页控制器
    public jsUtil: JsUtilsService, // 自定义JS工具类
    public httpReq: HttpReqService, // Http请求服务
    public ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public fb: FormBuilder, // 响应式表单
    public jGPush: PushService, // 极光推送
    private backBtnService: BackButtonService // 返回按钮处理
  ) {
    this.platform.ready().then(() => {
      this.backBtnService.registerBackButtonAction(null); // 返回事件特殊处理
    });

    this.formData = this.fb.group({
      phone: ["", [Validators.required, FormValidService.mobileValid]], // 手机
      password: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(16)]
      ] // 密码
    });
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
            this.jGPush.setTags(); // 极光推送设置标签 IOS或Android
            this.jGPush.setAlias(loginInfo["UserInfo"]["id"]); // 极光推送设置别名用户唯一
            this.jGPush.getRegistrationId(); // 获取设备唯一标识RegistrationId

            this.updateUserInfo(
              loginInfo["UserInfo"]["id"],
              () => {
                //  请求成功时
                this.navCtrl.setRoot("MainPage"); // 跳转到主页
              },
              () => {
                // 请求失败时
                // this.navCtrl.setRoot(LoginPage); // 跳转到主页
              }
            ); // 更新用户信息数据

            // this.app.getRootNav().push(MainPage); // 跳转到主页
            // this.viewCtrl.dismiss(); // 销毁当前视图
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
          }
        } else {
          // 以前未登录过
          this.clearLogin(); // 清除登录信息
        }
      }
    });
  }

  ionViewDidEnter() {
    this.ionicStorage.get("loginInfo").then(loginObj => {
      console.error("loginInfo", loginInfo);
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (!_.isNull(loginObj.UserName)) {
          GlobalMethod.setForm(this.formData, {
            phone: loginInfo["UserName"]
          }); // 重新设置表单
        }
      }
    });

    //=================手机键盘遮住输入框处理 Begin=================//
    GlobalMethod.keyboardHandle(this.content);
    //=================手机键盘遮住输入框处理 End=================//
  }

  /**
   * 以Modal形式打开新页面
   * @param {string} pageName 页面名称
   * @memberof LoginPage
   */
  public openModalPage(pageName: string): void {
    let modalPage: any = "";
    if (pageName == "ForgetPasswordPage") {
      // 忘记密码
      modalPage = this.modalCtrl.create(ForgetPasswordPage, {
        userId: ""
      });
    } else if (pageName == "FastLoginPage") {
      // 快速登录
      modalPage = this.modalCtrl.create(FastLoginPage, {
        userId: ""
      });
    }
    modalPage.present(); // 打开Modal页
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @memberof LoginPage
   */
  public jumpPage(pageName: any): void {
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
    this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
    this.ionicStorage.set("userInfo", loginInfo["UserInfo"]); // 后台返回用户信息对象
  }

  /**
   * 单击登录
   * @returns
   * @memberof RegisterPage
   */
  public clickLogin() {
    console.error("this.formData.value:", this.formData.value);
    const formDataCtrl = this.formData.controls;
    const formData = this.jsUtil.deepClone(this.formData.value); // 深度拷贝表单数据
    for (const i in formDataCtrl) {
      // 较验整个表单标记非法字段
      formDataCtrl[i].markAsDirty();
      formDataCtrl[i].updateValueAndValidity();
    }

    if (this.formData.invalid) {
      // 表单较验未通过
      return;
    }

    const loading = this.gloService.showLoading("正在登录，请稍候...");
    this.httpReq.post("workerUser/workerUserLogin", null, formData, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.gloService.showMsg("登录成功", null, 1000);
          loading.dismiss();
          loginInfo.LoginState = "success"; // 登录状态
          loginInfo.LoginTime = new Date().getTime(); // 登录时间
          loginInfo.UserName = formData.phone; // 用户名
          loginInfo.Password = formData.password; // 用户密码
          loginInfo.UserInfo = data["data"]; // 后台返回用户信息对象
          if (data["data"] && data["data"]["token"]) {
            loginInfo.Token = data["data"]["token"]; // 登录者Token
          }
          this.ionicStorage.set("userInfo", data["data"]); // 后台返回用户信息对象
          this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
          this.jGPush.setTags(); // 极光推送设置标签 IOS或Android
          this.jGPush.setAlias(loginInfo["UserInfo"]["id"]); // 极光推送设置别名用户唯一
          this.jGPush.getRegistrationId(); // 获取设备唯一标识RegistrationId
          this.navCtrl.setRoot("MainPage"); // 跳转到主页
          // this.app.getRootNav().push("MainPage"); // 跳转到主页
          // this.viewCtrl.dismiss(); // 销毁当前视图
        } else {
          loading.dismiss();
          this.gloService.showMsg(data["message"], null, 3000);
          formData.password = ""; // 清除登录密码
          GlobalMethod.setForm(this.formData, formData); // 重新设置表单
        }
      } else {
        loading.dismiss();
        this.gloService.showMsg("请求服务器出错", null, 3000);
        formData.password = ""; // 清除登录密码
        GlobalMethod.setForm(this.formData, formData); // 重新设置表单
      }
    });
    console.error(formData);
  }

  /**
   * 通过用户ID更新用户个人信息
   * @param {string} id 用户ID
   * @param {Function} suc 请求成功时的回调
   * @param {Function} err 请求失败时的回调
   * @memberof LoginPage
   */
  public updateUserInfo(id: string, suc: Function, err: Function) {
    const sendData: any = {};
    sendData.id = id; // 用户ID
    this.httpReq.post("workerUser/getMessageForLogin", null, sendData, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          // this.gloService.showMsg("登录成功", null, 1000);
          loginInfo.LoginState = "success"; // 登录状态
          loginInfo.LoginTime = new Date().getTime(); // 登录时间
          this.ionicStorage.get("loginInfo").then(loginObj => {
            loginInfo.UserName = loginObj.UserName; // 用户名
            loginInfo.Password = loginObj.Password; // 用户密码
          });
          loginInfo.UserInfo = data["data"]; // 后台返回用户信息对象
          if (data["data"] && data["data"]["token"]) {
            loginInfo.Token = data["data"]["token"]; // 登录者Token
          }
          this.ionicStorage.set("userInfo", data["data"]); // 后台返回用户信息对象
          this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
          this.jGPush.setTags(); // 极光推送设置标签 IOS或Android
          this.jGPush.setAlias(loginInfo["UserInfo"]["id"]); // 极光推送设置别名用户唯一
          this.jGPush.getRegistrationId(); // 获取设备唯一标识RegistrationId
          suc();
          // this.navCtrl.setRoot("MainPage"); // 跳转到主页
          // this.app.getRootNav().push("MainPage"); // 跳转到主页
          // this.viewCtrl.dismiss(); // 销毁当前视图
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
          this.clearLogin(); // 清除登录信息
          err();
          // GlobalMethod.setForm(this.formData, formData); // 重新设置表单
        }
      } else {
        this.clearLogin(); // 清除登录信息
        err();
        // this.gloService.showMsg("请求服务器出错", null, 3000);
        // GlobalMethod.setForm(this.formData, formData); // 重新设置表单
      }
    });
  }
}
