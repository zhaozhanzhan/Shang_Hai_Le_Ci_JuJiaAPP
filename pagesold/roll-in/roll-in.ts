import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController,
  Content
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { FormBuilder, Validators } from "@angular/forms";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { pageObj } from "../../common/config/BaseConfig";
// import { ParamService } from "../../common/service/Param.Service";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";

@IonicPage()
@Component({
  selector: "page-roll-in",
  templateUrl: "roll-in.html"
})
export class RollInPage {
  @ViewChild(Content)
  content: Content;

  public formInfo: any = {}; // 表单信息
  public formData: any; // 表单对象

  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private fb: FormBuilder, // 响应式表单
    // private globalService: GlobalService,
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    private httpReq: HttpReqService, // Http请求服务
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    private jsUtil: JsUtilsService, // 自定义JS工具类
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    private fb: FormBuilder // 响应式表单
  ) {
    this.formData = this.fb.group({
      customerId: ["", [Validators.required]], // 主键
      type: ["1", [Validators.required]], // 区分来源(1:拉包工；2：商户)
      money: [
        "",
        [Validators.required, Validators.pattern(/^[0-9]+(.[0-9]{1,2})?$/)]
      ], // 入金金额
      remark: ["", [Validators.maxLength(50)]] // 入金备注
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad RollInPage");
    console.log("ionViewDidLoad BankCardEditPage");
    const userInfo: any = {};
    this.ionicStorage.get("loginInfo").then(loginObj => {
      console.error("loginInfo", loginObj);

      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (
          !_.isNull(loginObj["UserInfo"]) &&
          !_.isEmpty(loginObj["UserInfo"])
        ) {
          const userId = loginObj["UserInfo"]["id"]; // 拉包工信息ID
          if (
            !_.isUndefined(userId) &&
            !_.isNull(userId) &&
            userId.length > 0
          ) {
            userInfo.customerId = userId; // 拉包工信息ID
            GlobalMethod.setForm(this.formData, userInfo); // 表单赋值
            console.error("this.formData：", this.formData);
          } else {
            this.gloService.showMsg("未获取到用户ID", null, 2000);
            return;
          }
        } else {
          this.gloService.showMsg("未获取到用户ID", null, 2000);
          return;
        }
      } else {
        this.gloService.showMsg("未获取到用户ID", null, 2000);
        return;
      }
    });
  }

  ionViewDidEnter() {
    const userInfo: any = {};
    userInfo.type = "1"; // 拉包工
    this.ionicStorage.get("loginInfo").then(loginObj => {
      console.error("loginInfo", loginObj);
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (
          !_.isNull(loginObj["UserInfo"]) &&
          !_.isEmpty(loginObj["UserInfo"])
        ) {
          const userId = loginObj["UserInfo"]["id"]; // 拉包工信息ID
          if (
            !_.isUndefined(userId) &&
            !_.isNull(userId) &&
            userId.length > 0
          ) {
            userInfo.customerId = userId; // 拉包工信息ID
            this.httpReq.post(
              "bankContent/getBankMessage",
              null,
              userInfo,
              data => {
                console.error(data);
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    if (
                      !_.isUndefined(data["data"]) &&
                      !_.isEmpty(data["data"])
                    ) {
                      this.formInfo = data["data"];
                      this.formInfo.clearAcct = this.formInfo.clearAcct.replace(
                        /^(\d{4})\d+(\d{3})$/,
                        "$1 **** **** **** $2"
                      );
                      this.formInfo.clearAcctName = this.formInfo.clearAcctName.replace(
                        /^(.{1}).+$/,
                        "$1 **"
                      );
                    }
                  } else {
                    this.formInfo = {};
                    this.gloService.showMsg(data["message"], null, 2000);
                  }
                } else {
                  this.gloService.showMsg("请求服务器出错", null, 2000);
                }
              }
            );
          } else {
            this.gloService.showMsg("未获取到用户ID", null, 2000);
            return;
          }
        }
      }
    });
  }

  /**
   * 输入金额处理
   * @memberof RollOutPage
   */
  public handleMoney() {
    const formData = this.jsUtil.deepClone(this.formData.value); // 深度拷贝表单数据
    let money = parseFloat(formData.money).toFixed(2);
    GlobalMethod.setForm(this.formData, { money: money }); // 表单赋值
    console.error(money);
  }

  /**
   * 保存表单数据
   * @returns
   * @memberof RegisterPage
   */
  public saveForm() {
    console.error("this.formData:", this.formData);
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
      console.error("表单较验未通过");
      return;
    }
    console.error("this.formData:", this.formData);
    console.error("this.formData.value:", this.formData.value);
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "确认转入到余额？" + "金额：" + this.formData.value.money,
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确认",
          handler: () => {
            const loading = this.gloService.showLoading("正在提交，请稍候...");
            this.httpReq.post("bankContent/capitalIn", null, formData, data => {
              if (data["status"] == 200) {
                if (data["code"] == 0) {
                  this.gloService.showMsg("转入成功", null, 3000);
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
      ]
    });
    confirm.present();
  }
}
