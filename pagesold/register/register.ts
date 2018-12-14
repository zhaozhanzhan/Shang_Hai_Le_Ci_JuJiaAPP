import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  Content,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { FormValidService } from "../../common/service/FormValid.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";

// declare var cordova: any; //导入第三方的库定义到 TS 项目中

@IonicPage()
@Component({
  selector: "page-register",
  templateUrl: "register.html"
})
export class RegisterPage {
  @ViewChild(Content)
  content: Content;

  public paramObj: any; // 传递过来的参数对象
  public verifiText: string = "获取验证码"; // 获取验证码按钮文本
  public verifiState: Boolean = false; // 获取验证码按钮状态
  public smsTime: number = 60; // 获取验证码间隔时间
  public interObj: any = null; // 定时对象
  public remnantTime: number = null; //当前剩余秒数
  public formData: FormGroup; // 定义表单对象
  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    private jsUtil: JsUtilsService, // 自定义JS工具类
    private httpReq: HttpReqService, // Http请求服务
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    private fb: FormBuilder, // 响应式表单
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.formData = this.fb.group({
      workerName: ["", [Validators.required, FormValidService.nameValid]], // 姓名
      idCard: ["", [Validators.required, FormValidService.idCardValid]], // 身份证
      plateNum: ["", [Validators.required]], // 三轮车牌号
      phoneNum: ["", [Validators.required, FormValidService.mobileValid]], // 手机
      securityCode: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)]
      ], // 验证码
      password: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(16)]
      ], // 密码
      confirmPwd: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(16)]
      ], // 确认密码
      frontStr: ["", [Validators.required]], // 身份证正面信息
      backStr: ["", [Validators.required]] // 身份证反面信息
    });

    this.paramObj = this.navParams.data; // 传递过来的参数对象
    console.log(
      "%c 传递过来的参数对象this.paramObj",
      "color:#FF00F7;",
      this.paramObj
    );
    if (_.isObject(this.paramObj) && !_.isEmpty(this.paramObj)) {
      GlobalMethod.setForm(this.formData, this.paramObj); // 表单赋值
    }
  }

  ionViewDidLoad() {
    this.ionicStorage.remove("idCardInfo");
  }

  ionViewWillEnter() {
    // 当将要进入页面时触发
    this.ionicStorage.get("idCardInfo").then(idCardInfo => {
      console.error("idCardInfo", idCardInfo);
      if (_.isArray(idCardInfo) && idCardInfo.length == 2) {
        const userInfo: any = {};
        idCardInfo.forEach(curVal => {
          if (!_.isNull(curVal.name)) {
            // 获取到姓名
            userInfo.workerName = curVal.name; // 姓名
            userInfo.idCard = curVal.idCardNumber; // 身份证
            userInfo.frontStr = curVal.frontStr; // 身份证正面
          } else {
            userInfo.backStr = curVal.backStr; // 身份证正面
          }
        });
        GlobalMethod.setForm(this.formData, userInfo); // 表单赋值
        console.error("this.formData", this.formData);
      }
    });
  }
  ionViewDidEnter() {
    //=================手机键盘遮住输入框处理 Begin=================//
    GlobalMethod.keyboardHandle(this.content);
    //=================手机键盘遮住输入框处理 End=================//
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
   * 获取短信验证码
   * @memberof RegisterPage
   */
  public getVerifiSms() {
    const idCardState = this.formData.get("idCard").invalid;
    if (idCardState) {
      this.gloService.showMsg("身份证未识别！", null, 3000);
      return;
    }

    const phoneNumState = this.formData.get("phoneNum").invalid;
    if (phoneNumState) {
      this.gloService.showMsg("手机号码格式不正确！", null, 3000);
      return;
    }

    this.remnantTime = this.smsTime; // 初始化剩余时间
    const phoneObj: any = {
      phone: this.formData.get("phoneNum").value
    };

    // phoneObj.type = 2; // 1：商户APP 2:拉包工APP

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
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
        }
        // GlobalMethod.setForm(this.formData, data["data"]); // 表单赋值
      }
    });
  }

  /**
   * 保存表单数据
   * @returns
   * @memberof RegisterPage
   */
  public saveForm() {
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

    if (formData.password !== formData.confirmPwd) {
      // 两次输入密码不一至
      this.gloService.showMsg("两次输入密码不一至", null, 3000);
      return;
    }

    const loading = this.gloService.showLoading("正在提交，请稍候...");
    this.httpReq.post("workerUser/save", null, formData, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.gloService.showMsg("注册成功", null, 3000);
          loading.dismiss();
          this.navCtrl.pop();
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
          loading.dismiss();
        }
      } else {
        loading.dismiss();
        this.gloService.showMsg("请求服务器出错", null, 3000);
      }
    });
    console.error(formData);
  }
}
