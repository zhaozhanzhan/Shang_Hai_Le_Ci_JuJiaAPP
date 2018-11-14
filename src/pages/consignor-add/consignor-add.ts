import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  Content
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { FormValidService } from "../../common/service/FormValid.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";

@IonicPage()
@Component({
  selector: "page-consignor-add",
  templateUrl: "consignor-add.html"
})
export class ConsignorAddPage {
  @ViewChild(Content)
  content: Content;

  public pageMode: string = null; // 页面添加与修改状态
  public dataId: string = null; // 修改数据时获取到的ID

  public formData: FormGroup; // 定义表单对象

  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧边栏控制
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
      name: ["", [Validators.required, FormValidService.nameValid]], // 姓名
      phone: ["", [Validators.required, FormValidService.mobileValid]], // 手机
      address: [
        "",
        [Validators.required, Validators.minLength(5), Validators.maxLength(50)]
      ], // 地址
      id: ["", [Validators.required]], // 拉包工信息ID
      status: ["1", [Validators.required]] // 人员属于（1：发货人，2：收货人）
    });

    this.pageMode = this.navParams.get("state");
  }

  ionViewDidLoad() {
    if (this.pageMode == "add") {
      // 添加状态
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
              userInfo.id = userId; // 拉包工信息ID
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
    } else if (this.pageMode == "edit") {
      // 修改状态
      console.error("编辑");
      this.dataId = this.navParams.get("id"); // 修改数据时获取到的ID
      if (
        _.isUndefined(this.dataId) ||
        _.isNull(this.dataId) ||
        this.dataId.length <= 0
      ) {
        this.gloService.showMsg("未获取到数据ID", null, 2000);
        this.navCtrl.pop();
      } else {
        console.error(this.dataId);
        const workObj = {
          id: this.dataId
        };
        this.httpReq.post("consignee/getMessage", null, workObj, data => {
          if (data["status"] == 200) {
            if (data["code"] == 0) {
              if (!_.isUndefined(data["data"]) && !_.isEmpty(data["data"])) {
                const getData = {
                  name: data["data"]["consigneeName"],
                  phone: data["data"]["consigneePhone"],
                  address: data["data"]["consigneeAddress"],
                  id: this.dataId
                };
                GlobalMethod.setForm(this.formData, getData); // 表单赋值
              }
              // this.gloService.showMsg("保存成功", null, 2000);
              // loading.dismiss();
              // this.navCtrl.pop();
            } else {
              this.gloService.showMsg(data["message"], null, 2000);
              // loading.dismiss();
            }
          } else {
            // loading.dismiss();
            this.gloService.showMsg("请求服务器出错", null, 2000);
          }
        });
      }
    }
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

    const backRefreshObj = ParamService.getParamObj();

    console.error(backRefreshObj);
    if (this.pageMode == "add") {
      // 添加状态
      console.error("添加");
      const loading = this.gloService.showLoading("正在提交，请稍候...");
      this.httpReq.post("consignee/saveForWorker", null, formData, data => {
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            this.gloService.showMsg("保存成功", null, 2000);
            // backRefreshFun(); // 执行返回刷新事件
            loading.dismiss();
            this.navCtrl.pop();
            console.error(backRefreshObj.backRefEvent);
            if (_.isFunction(backRefreshObj.backRefEvent)) {
              console.error("执行返回刷新事件");
              backRefreshObj.backRefEvent(backRefreshObj.that); // 执行返回刷新事件
            }
          } else {
            this.gloService.showMsg(data["message"], null, 2000);
            loading.dismiss();
          }
        } else {
          loading.dismiss();
          this.gloService.showMsg("请求服务器出错", null, 2000);
        }
      });
    } else if (this.pageMode == "edit") {
      // 修改状态
      console.error("编辑");
      const loading = this.gloService.showLoading("正在提交，请稍候...");

      this.httpReq.post("consignee/edit", null, formData, data => {
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            this.gloService.showMsg("保存成功", null, 2000);
            loading.dismiss();
            this.navCtrl.pop();
            console.error(backRefreshObj.backRefEvent);
            if (_.isFunction(backRefreshObj.backRefEvent)) {
              console.error("执行返回刷新事件");
              backRefreshObj.backRefEvent(backRefreshObj.that); // 执行返回刷新事件
            }
          } else {
            this.gloService.showMsg(data["message"], null, 2000);
            loading.dismiss();
          }
        } else {
          loading.dismiss();
          this.gloService.showMsg("请求服务器出错", null, 2000);
        }
      });
    }

    console.error(formData);
  }
}
