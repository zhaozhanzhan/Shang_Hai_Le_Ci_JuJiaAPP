import { Component, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  ViewController,
  App,
  ModalController,
  Content
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { FormValidService } from "../../common/service/FormValid.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { GlobalMethod } from "./../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { loginInfo } from "../../common/config/BaseConfig";
import { PushService } from "../../common/service/Push.Service";
// import { MainPage } from "../main/main";
@Component({
  selector: "page-fast-login",
  templateUrl: "fast-login.html"
})
export class FastLoginPage {
  @ViewChild(Content)
  content: Content;
  public verifiText: string = "获取验证码"; // 获取验证码按钮文本
  public verifiState: Boolean = false; // 获取验证码按钮状态
  public smsTime: number = 60; // 获取验证码间隔时间
  public interObj: any = null; // 定时对象
  public remnantTime: number = null; //当前剩余秒数
  public formData: FormGroup; // 定义表单对象
  constructor(
    public app: App, // 应用控制器
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public modalCtrl: ModalController, // Modal弹出页控制器
    private jsUtil: JsUtilsService, // 自定义JS工具类
    private httpReq: HttpReqService, // Http请求服务
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public jGPush: PushService, // 极光推送
    private fb: FormBuilder // 响应式表单
  ) {
    this.formData = this.fb.group({
      phone: ["", [Validators.required, FormValidService.mobileValid]], // 手机
      securityCode: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)]
      ] // 验证码
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ForgetPasswordPage");
  }

  /**
   * 单击关闭当前Modal页面
   * @memberof ForgetPasswordPage
   */
  public clickClose() {
    this.viewCtrl.dismiss();
  }

  /**
   * 获取短信验证码
   * @memberof RegisterPage
   */
  public getVerifiSms() {
    const phoneNumState = this.formData.get("phone").invalid;
    if (phoneNumState) {
      this.gloService.showMsg("手机号码格式不正确", null, 3000);
      return;
    }

    this.remnantTime = this.smsTime; // 初始化剩余时间
    const phoneObj: any = {
      phone: this.formData.get("phone").value
    };

    phoneObj.type = 2; // 1：商户APP 2:拉包工APP
    this.httpReq.post("workerUser/getSecurityCode", null, phoneObj, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.gloService.showMsg("验证码已发送，请注意查收", null, 3000);
          this.interObj = window.setInterval(() => {
            // console.error(this.remnantTime);
            if (this.remnantTime == 0) {
              window.clearInterval(this.interObj); // 停止计时器
              this.verifiState = false; // 启用按钮
              this.verifiText = "重新发送"; // 获取验证码按钮文本
            } else {
              this.remnantTime--; // 当前剩余秒数
              this.verifiState = true; // 启用按钮
              this.verifiText = this.remnantTime + "秒再获取"; // 获取验证码按钮文本
            }
          }, 1000); //启动计时器，1秒执行一次
        } else if (data["code"] == -1) {
          this.viewCtrl.dismiss();
          const formData = this.jsUtil.deepClone(this.formData.value); // 深度拷贝表单数据
          this.gloService.showMsg(data["message"], null, 3000);
          this.navCtrl.push("RegisterPage", {
            phoneNum: formData.phone,
            securityCode: formData.securityCode
          });
          formData.securityCode = ""; // 清除验证码
          GlobalMethod.setForm(this.formData, formData); // 重新设置表单
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
        }
        // GlobalMethod.setForm(this.formData, data["data"]); // 表单赋值
      }
    });
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
    this.httpReq.post(
      "workerUser/workerUserLoginForCode",
      null,
      formData,
      data => {
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            loading.dismiss();
            this.gloService.showMsg("登录成功", null, 3000);
            this.clickClose(); // 关闭快速登录页面组件
            loginInfo.LoginState = "success"; // 登录状态
            loginInfo.LoginTime = new Date().getTime(); // 登录时间
            loginInfo.UserName = formData.phone; // 用户名
            // loginInfo.Password = formData.password; // 用户密码
            loginInfo.UserInfo = data["data"]; // 后台返回用户信息对象
            // if (data["data"] && data["data"]["token"]) {
            //   loginInfo.Token = data["data"]["token"]; // 登录者Token
            // }
            this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
            this.ionicStorage.set("userInfo", data["data"]); //
            this.jGPush.setTags(); // 极光推送设置标签 IOS或Android
            this.jGPush.setAlias(loginInfo["UserInfo"]["id"]); // 极光推送设置别名用户唯一
            this.jGPush.getRegistrationId(); // 获取设备唯一标识RegistrationId
            this.navCtrl.setRoot("MainPage"); // 跳转到主页
            // this.app.getRootNav().push(MainPage); // 跳转到主页
            // this.viewCtrl.dismiss(); // 销毁当前视图
          } else {
            loading.dismiss();
            this.viewCtrl.dismiss();
            this.gloService.showMsg(data["message"], null, 3000);
            this.navCtrl.push("RegisterPage", {
              phoneNum: formData.phone,
              securityCode: formData.securityCode
            });
            formData.securityCode = ""; // 清除验证码
            GlobalMethod.setForm(this.formData, formData); // 重新设置表单
          }
        } else {
          loading.dismiss();
          this.gloService.showMsg("请求服务器出错", null, 3000);
          formData.securityCode = ""; // 清除验证码
          GlobalMethod.setForm(this.formData, formData); // 重新设置表单
        }
      }
    );
    console.error(formData);
  }
}
