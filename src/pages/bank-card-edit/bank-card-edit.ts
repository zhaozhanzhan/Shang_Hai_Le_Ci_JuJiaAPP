import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  Content,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController,
  MenuController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { FormValidService } from "../../common/service/FormValid.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { pageObj } from "../../common/config/BaseConfig";

@IonicPage()
@Component({
  selector: "page-bank-card-edit",
  templateUrl: "bank-card-edit.html"
})
export class BankCardEditPage {
  @ViewChild(Content)
  content: Content;

  public reqUrl: string = "provincesAndCities/getBankNumberList"; // 请求银行数据URL
  public sendData: any = {}; // 定义请求数据时的对象
  public formData: any = {}; // 表单对象
  public dataList: Array<any> = []; // 银行列表列表
  public pageMode: string = null; // 页面添加与修改状态

  // public paramId: any = null; // 参数对象
  // public formInfo: any = {}; // 表单信息

  // public bigPkgObj: any; // 大包对象
  // public smallPkgObj: any; // 小包对象
  // public bigIdx: number = null; // 大包索引值
  // public smallIdx: number = null; // 小包索引值

  public selIdArr: Array<string> = []; // 选择的ID数组
  public selObjArr: Array<any> = []; // 选择的对象数组

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
      customerId: ["", [Validators.required]], // 主键
      type: ["1", [Validators.required]], // 区分来源(1:拉包工；2：商户)
      isOutBank: ["", [Validators.required]], // 本行/跨行标识（ 0-华夏；1-非华夏）
      payBankName: [{ value: "", disabled: false }, []], // 支付系统行名称（isOutBank为1时必填）
      payBankCode: [{ value: "", disabled: false }, []], // 支付系统行号（isOutBank为1时必填）
      clearAcct: [
        "",
        [Validators.required, Validators.pattern(/^([0-9]|\s){10,30}$/)]
      ], // 结算账户号
      clearAcctName: ["", [Validators.required, FormValidService.nameValid]], // 结算账户名
      email: ["", [Validators.required, Validators.email]] // 邮箱
    });
    this.pageMode = this.navParams.get("state");
    if (this.pageMode == "add") {
    } else if (this.pageMode == "edit") {
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
                        const recData = data["data"];

                        // this.formInfo = data["data"];
                        recData.clearAcct = recData.clearAcct.replace(
                          /(.{4})/g,
                          "$1 "
                        );
                        GlobalMethod.setForm(this.formData, recData); // 表单赋值
                      }
                    } else {
                      // this.formInfo = {};
                      this.navCtrl.pop();
                      this.gloService.showMsg(data["message"], null, 2000);
                    }
                  } else {
                    this.navCtrl.pop();
                    this.gloService.showMsg("请求服务器出错", null, 2000);
                  }
                }
              );
            } else {
              this.navCtrl.pop();
              this.gloService.showMsg("未获取到用户ID", null, 2000);
              return;
            }
          }
        }
      });
    }
    // this.formData = this.fb.group({
    //   workerName: ["", [Validators.required, FormValidService.nameValid]], // 姓名
    //   idCard: ["", [Validators.required, FormValidService.idCardValid]], // 身份证
    //   phoneNum: ["", [Validators.required, FormValidService.mobileValid]], // 手机
    //   securityCode: ["", [Validators.minLength(6), Validators.maxLength(6)]] // 验证码
    // });

    // this.paramObj = this.navParams.data; // 传递过来的参数对象
    // console.log(
    //   "%c 传递过来的参数对象this.paramObj",
    //   "color:#FF00F7;",
    //   this.paramObj
    // );
    // if (_.isObject(this.paramObj) && !_.isEmpty(this.paramObj)) {
    //   GlobalMethod.setForm(this.formData, this.paramObj); // 表单赋值
    // }
  }

  ionViewDidLoad() {
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
    this.serBankList(); // 查询银行列表
    if (this.pageMode == "add") {
    } else if (this.pageMode == "edit") {
    }
  }

  ionViewDidEnter() {
    //=================手机键盘遮住输入框处理 Begin=================//
    GlobalMethod.keyboardHandle(this.content);
    //=================手机键盘遮住输入框处理 End=================//
  }

  /**
   * 打开右侧菜单
   * @memberof MergePackagePage
   */
  public openMenu() {
    this.menuCtrl.open("right");
  }

  /**
   * 关闭右侧菜单
   * @memberof MergePackagePage
   */
  public closeMenu() {
    this.menuCtrl.close("right");
  }

  /**
   * 切换右侧菜单打开状态
   * @memberof MergePackagePage
   */
  public toggleMenu() {
    this.menuCtrl.toggle("right");
  }

  /**
   * 启用右侧菜单
   * @memberof MergePackagePage
   */
  public enableMenu() {
    this.menuCtrl.enable(true, "selBankNum");
  }

  /**
   * 禁用右侧菜单
   * @memberof MergePackagePage
   */
  public disabledMenu() {
    this.menuCtrl.enable(false, "selBankNum");
  }

  /**
   * 搜索取消事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serCancel(ev: any) {
    this.sendData.bankName = "";
    this.serBankList(this.sendData.bankName); // 查询银行列表
  }

  /**
   * 搜索清除事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serClear(ev: any) {
    this.serBankList(this.sendData.bankName); // 查询银行列表
  }

  /**
   * 搜索输入事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serInput(ev: any) {
    // console.error(this.serVal);
    this.serBankList(this.sendData.bankName); // 查询银行列表
    // this.baiduMap.serFun(this.serVal, data => {
    //   if (_.isArray(data) && data.length > 0) {
    //     console.log("%c 搜索完成事件===========", "color:#C44617", data);
    //     this.serAddArrShow = true; // 显示搜索结果
    //     this.serAddArr = data; // 获取到搜索的地址
    //   }
    // });
  }

  /**
   * 搜索失去焦点输入事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serBlur(ev: any) {
    this.serBankList(this.sendData.bankName); // 查询银行列表
    // this.serAddArrShow = false; // 显示搜索结果
    // this.serAddArr = []; // 搜索的地址
  }

  /**
   * 选择查询地址对象
   * @param {*} obj
   * @memberof MapPage
   */
  public selSerAdd(obj: any) {
    console.log("%c 搜索完成事件obj===========", "color:#C44617", obj);
    // this.serVal = obj.title; // 选择的地址
    // this.baiduMap.setCenterPoint(obj.point.lng, obj.point.lat);
    // this.serAddArrShow = false; // 显示搜索结果
    // this.serAddArr = []; // 搜索的地址
  }

  /**
   * 查询银行列表
   * @param {string} [serVal] 查询内容
   * @memberof BankCardEditPage
   */
  public serBankList(serVal?: string) {
    this.sendData.page = pageObj.currentPage; // 定义当前页码
    this.sendData.size = pageObj.everyItem * 10; // 定义当前页面请求条数
    if (serVal) {
      this.sendData.bankName = serVal; // 定义查询内容
    } else {
      this.sendData.bankName = ""; // 定义查询内容
    }
    this.sendData.totalPage = pageObj.totalPage; // 定义当前页面请求条数
    this.httpReq.post(this.reqUrl, null, this.sendData, data => {
      console.error("========银行列表==========银行列表", data);
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.sendData.totalPage = GlobalMethod.calTotalPage(
            data["data"]["objectMap"]["count"],
            this.sendData.size
          ); //定义当前总页数
          this.dataList = [];
          this.dataList = this.dataList.concat(data["data"]["list"]);
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
        }
      } else {
        // this.gloService.showMsg("请求服务器出错", null, 3000);
      }
    });
  }

  /**
   * 判断是否选择
   * @param {string} id
   * @returns {boolean}
   * @memberof MergePackagePage
   */
  public isSelected(id: string): boolean {
    const isSelected = this.selIdArr.indexOf(id) != -1;
    return isSelected;
  }

  /**
   * 点击选择或取消选择小包对象
   * @param {Event} ev 事件对象
   * @param {string} id 当前对象ID
   * @param {*} obj 当前点击行对象
   * @memberof MergePackagePage
   */
  public clickSel(ev: Event, id: string, obj: any) {
    if (ev) {
      console.error(ev);
      ev.stopPropagation(); // 阻止事件冒泡
    }
    console.error(id, obj);
    this.selIdArr = [];
    this.selObjArr = [];
    this.selIdArr.push(id);
    this.selObjArr.push(obj);
    this.closeMenu(); // 关闭右侧菜单
    GlobalMethod.setForm(this.formData, {
      payBankName: this.selObjArr[0].bankName,
      payBankCode: this.selObjArr[0].bankNo
    }); // 表单赋值
    // 判断当前是否勾选
    // if (this.selIdArr.indexOf(id) == -1) {
    //   this.selIdArr.push(id);
    //   this.selObjArr.push(obj);
    // } else if (this.selIdArr.indexOf(id) != -1) {
    //   const placeIndex = this.selIdArr.indexOf(id);
    //   this.selIdArr.splice(placeIndex, 1);
    //   this.selObjArr.splice(placeIndex, 1);
    // }
  }

  /**
   * 选择银行
   */
  public selBank() {
    GlobalMethod.setForm(this.formData, {
      payBankName: "",
      payBankCode: ""
    }); // 表单赋值
  }

  /**
   * 输入银行卡号时格式化卡号
   * @memberof BankCardEditPage
   */
  public inputBankNum(ev) {
    if (ev.keyCode != 8) {
      let bankNum = this.formData.get("clearAcct").value;
      bankNum = this.jsUtil.trim(bankNum, "all");
      bankNum = bankNum.replace(/[A-Za-z\u4e00-\u9fa5\\.]/gi, ""); // 去除所有空格及非法字符
      bankNum = bankNum.replace(/(.{4})/g, "$1 "); // 每四位添加空格
      GlobalMethod.setForm(this.formData, { clearAcct: bankNum }); // 表单赋值
    }
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

    if (formData.isOutBank == "1") {
      if (
        _.isNull(formData.payBankCode) ||
        _.isUndefined(formData.payBankCode) ||
        formData.payBankCode.length <= 0
      ) {
        this.gloService.showMsg("请选择支付行！", null, 3000);
      }
    }

    formData.clearAcct = this.jsUtil.trim(formData.clearAcct, "all");

    if (this.pageMode == "add") {
      console.error("this.formData:", this.formData);
      console.error("this.formData.value:", this.formData.value);
      const loading = this.gloService.showLoading("正在提交，请稍候...");
      this.httpReq.post("bankContent/customerSigned", null, formData, data => {
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            this.gloService.showMsg("签约成功", null, 3000);
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
    } else if (this.pageMode == "edit") {
      console.error("this.formData:", this.formData);
      console.error("this.formData.value:", this.formData.value);
      const loading = this.gloService.showLoading("正在提交，请稍候...");
      this.httpReq.post("bankContent/editSigned", null, formData, data => {
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            this.gloService.showMsg("签约成功", null, 3000);
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
}
