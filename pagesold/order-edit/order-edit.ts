import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Content,
  ActionSheetController,
  Platform,
  AlertController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
// import { pageObj } from "../../common/config/BaseConfig";
import { ParamService } from "../../common/service/Param.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { FormValidService } from "../../common/service/FormValid.Service";
import { RegexpConfig } from "../../common/service/GlobalConfig";
// import { SelectCityService } from "../../common/service/SelectCity.Service";
// import { OpenNativeSettings } from "@ionic-native/open-native-settings"; // 系统设置
// import { Geolocation } from "@ionic-native/geolocation"; // GPS定位
// import { AndroidPermissions } from "@ionic-native/android-permissions"; // Android权限控制

@IonicPage()
@Component({
  selector: "page-order-edit",
  templateUrl: "order-edit.html"
})
export class OrderEditPage {
  @ViewChild(Content)
  content: Content;

  public defMerchObj: FormGroup; // 定义发货人对象
  public formData: FormGroup; // 定义表单对象
  public expreArr: any; // 物流快递公司列表
  public proData: any; // 省份列表
  public cityData: any; // 城市列表
  public areaData: any; // 区域列表
  public freInfoArr: any; // 费用信息
  public trunkObj: any = {}; // 是否有干线
  // public selCityStr: any = null; // 选择的城市

  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public httpReq: HttpReqService, // Http请求服务
    public jsUtil: JsUtilsService, // 自定义JS工具类
    public ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public fb: FormBuilder, // 响应式表单
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // public selCity: SelectCityService // 省市区三级联动 // Alert消息弹出框 // private geolocation: Geolocation, // GPS定位 // private androidPermissions: AndroidPermissions, // Android权限控制 // private openNativeSettings: OpenNativeSettings // 系统设置
  ) {
    // {"toProvince": "发往省代号",
    // "toCity": "发往城市代号",
    // "toArea": "发往区县",
    // "commonCarrierId": "承运商Id",
    // "workerId": "拉包工自己Id",
    // "merchantJson": "主发货人json:{
    //   "merchantName":"",
    //   "merchantPhone":"",
    //   "merchantAddress":"",
    //   "goodsName":"",
    //   "goodsNum":""}",
    // "merchantOtherJson": "其余发货人信息Json:[{
    //   "merchantName":"",
    //   "merchantPhone":"",
    //   "merchantAddress":"",
    //   "goodsName":"",
    //   "goodsNum":""}]",
    // "toPersonJson": "收货人json:{
    //   "toPerson":"",
    //   "toPhone":"",
    //   "toAddress":""}",
    // "packageNum": "包裹件数",
    // "weight": "重量",
    // "connectType": "配送方式（配送，自提，市场配送）",
    // "payType": "付款方式（现付，到付）"}

    this.trunkObj.matching = 0;
    this.formData = this.fb.group({
      toProvince: ["", [Validators.required]], // 省份
      toCity: ["", [Validators.required]], // 城市
      toArea: ["", [Validators.required]], // 区域
      commonCarrierId: ["", [Validators.required]], // 物流快递公司
      workerId: ["", [Validators.required]], // 拉包工ID
      workerName: ["", [Validators.required]], // 拉包工姓名
      merchantJson: this.fb.group({
        merchantName: ["", [Validators.required, FormValidService.nameValid]], // 主发货人姓名
        merchantPhone: [
          "",
          [Validators.required, FormValidService.mobileValid]
        ], // 主发货人手机
        merchantAddress: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50)
          ]
        ], // 主发货人地址
        goodsName: ["", [Validators.required]], // 主发货人类型
        goodsNum: [
          "",
          [Validators.required, Validators.pattern(RegexpConfig.posInt)]
        ] // 主发货人件数
      }), // 主发货人
      merchantOtherJson: this.fb.array([]),
      toPersonJson: this.fb.group({
        toPerson: ["", [Validators.required, FormValidService.nameValid]], // 收货人姓名
        toPhone: ["", [Validators.required, FormValidService.mobileValid]], // 收货人手机
        toAddress: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50)
          ]
        ] // 收货人地址
      }), // 收货人
      connectType: ["", [Validators.required]], // 配送方式（配送，自提，市场配送）
      payType: ["", [Validators.required]] // 付款方式（现付，到付）
      // packageNum: ["", [Validators.required]], // 包裹件数
      // weight: ["", [Validators.required]], // 重量
    });

    this.ionicStorage.get("loginInfo").then(loginObj => {
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        const userInfo: any = {};
        if (
          !_.isNull(loginObj["UserInfo"]) &&
          !_.isEmpty(loginObj["UserInfo"])
        ) {
          userInfo.workerId = loginObj["UserInfo"]["id"]; // 拉包工信息ID
          userInfo.workerName = loginObj["UserInfo"]["workerName"]; // 拉包工姓名
          GlobalMethod.setForm(this.formData, userInfo); // 表单赋值
        }
      } else {
        this.gloService.showMsg("未获取到拉包工信息", null, 3000);
        this.navCtrl.pop();
      }
    });
    // this.cityData = this.selCity.cityArr; // 获取到城市数据
    // console.error("this.selCity.cityArr", this.selCity.cityArr);

    // this.httpReq.post("commonCarrier/listAll", null, null, data => {
    //   // 获取物流列表
    //   if (data["status"] == 200) {
    //     if (data["code"] == 0) {
    //       this.expreArr = data["data"];
    //     } else {
    //       this.gloService.showMsg(data["message"], null, 3000);
    //     }
    //   } else {
    //     this.gloService.showMsg("请求服务器出错", null, 3000);
    //   }
    // });

    this.httpReq.post(
      "provincesAndCities/listForProvince",
      null,
      null,
      data => {
        // 获取省份列表
        console.error("listForProvince================", data);
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            this.proData = data["data"];
          } else {
            this.gloService.showMsg(data["message"], null, 3000);
          }
        } else {
          this.gloService.showMsg("请求服务器出错", null, 3000);
        }
      }
    );
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad OrderEditPage");
    console.error(this.formData);
  }

  ionViewWillEnter() {
    // GlobalMethod.setForm(this.formData, userInfo); // 表单赋值
    // console.error("this.formData：", this.formData);
  }

  ionViewDidEnter() {
    //=================手机键盘遮住输入框处理 Begin=================//
    GlobalMethod.keyboardHandle(this.content);
    //=================手机键盘遮住输入框处理 End=================//
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @memberof LoginPage
   */
  public jumpPage(pageName: any, obj: any): void {
    ParamService.setParamObj({
      that: this,
      backEvent: this.backEvent
    }); // 保存返回刷新事件
    this.navCtrl.push(pageName, obj);
  }

  /**
   * 创建发货人对象
   * @private
   * @returns
   * @memberof OrderEditPage
   */
  private createMerchObj() {
    return this.fb.group({
      merchantName: ["", [Validators.required, FormValidService.nameValid]], // 发货人姓名
      merchantPhone: ["", [Validators.required, FormValidService.mobileValid]], // 发货人手机
      merchantAddress: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(50)]
      ], // 发货人地址
      goodsName: ["", [Validators.required]], // 发货人类型
      goodsNum: [
        "",
        [Validators.required, Validators.pattern(RegexpConfig.posInt)]
      ] // 发货人件数
    });
  }

  /**
   * 单击添加发货人
   * @memberof OrderEditPage
   */
  public clickAdd() {
    const merchObjArr = this.formData.get("merchantOtherJson") as FormArray; // 发货人对象数组
    merchObjArr.push(this.createMerchObj()); // 推送form新表单
  }

  /**
   * 单击删除发货人
   * @param {number} i 要删除的数组元素索引
   * @memberof OrderEditPage
   */
  public clickDel(i: number) {
    const merchObjArr = this.formData.get("merchantOtherJson") as FormArray; // 发货人对象数组
    merchObjArr.removeAt(i); // 根据索引移除对应的表单
  }

  /**
   * 选择省份
   * @memberof OrderEditPage
   */
  public selPro() {
    GlobalMethod.setForm(this.formData, { toCity: "" }); // 清除选择的城市
    GlobalMethod.setForm(this.formData, { toArea: "" }); // 清除选择的区域
    GlobalMethod.setForm(this.formData, { commonCarrierId: "" }); // 清除已选择的物流
    this.expreArr = []; // 重置物流快递公司列表
    this.freInfoArr = []; // 重置费用信息
    this.trunkObj.matching = 0; // 重置费用信息显示状态

    const sendData: any = {};
    sendData.provinceNo = this.formData.get("toProvince").value;
    this.httpReq.post(
      "provincesAndCities/listForCity",
      null,
      sendData,
      data => {
        // 获取城市列表
        console.error("listForCity================", data);
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            this.cityData = data["data"];
          } else {
            this.gloService.showMsg(data["message"], null, 3000);
          }
        } else {
          this.gloService.showMsg("请求服务器出错", null, 3000);
        }
      }
    );
    // GlobalMethod.setForm(this.formData, { toCity: "" }); // 表单赋值
  }

  /**
   * 选择城市
   * @memberof OrderEditPage
   */
  public selCity() {
    GlobalMethod.setForm(this.formData, { toArea: "" }); // 清除选择的区域
    GlobalMethod.setForm(this.formData, { commonCarrierId: "" }); // 清除已选择的物流
    this.expreArr = []; // 重置物流快递公司列表
    this.freInfoArr = []; // 重置费用信息
    this.trunkObj.matching = 0; // 重置费用信息显示状态

    const sendData: any = {};
    sendData.cityNo = this.formData.get("toCity").value;
    this.httpReq.post("provincesAndCities/getAreas", null, sendData, data => {
      // 获取城市列表
      console.error("getAreas================", data);
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.areaData = data["data"];
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
        }
      } else {
        this.gloService.showMsg("请求服务器出错", null, 3000);
      }
    });
  }

  /**
   * 选择区域
   * @memberof OrderEditPage
   */
  public selArea() {
    GlobalMethod.setForm(this.formData, { commonCarrierId: "" }); // 清除已选择的物流
    this.expreArr = []; // 重置物流快递公司列表
    this.freInfoArr = []; // 重置费用信息
    this.trunkObj.matching = 0; // 重置费用信息显示状态
    this.getLogis(); // 获取物流列表
  }

  /**
   * 选择物流
   * @memberof OrderEditPage
   */
  public selExpre() {
    this.getCostInfo(); // 获取运费信息
  }

  /**
   * 获取物流列表
   * @memberof OrderEditPage
   */
  public getLogis() {
    const sendData: any = {};

    sendData.provinceNo = this.formData.get("toProvince").value; // 城市
    console.error("sendData================", sendData);
    if (
      _.isNull(sendData.provinceNo) ||
      _.isUndefined(sendData.provinceNo) ||
      sendData.provinceNo.length == 0
    ) {
      this.gloService.showMsg("请选择省", null, 2000);
      return;
    }

    sendData.cityNo = this.formData.get("toCity").value; // 城市
    console.error("sendData================", sendData);
    if (
      _.isNull(sendData.cityNo) ||
      _.isUndefined(sendData.cityNo) ||
      sendData.cityNo.length == 0
    ) {
      this.gloService.showMsg("请选择城市", null, 2000);
      return;
    }

    sendData.areaNo = this.formData.get("toArea").value; // 城市
    console.error("sendData================", sendData);
    if (
      _.isNull(sendData.areaNo) ||
      _.isUndefined(sendData.areaNo) ||
      sendData.areaNo.length == 0
    ) {
      this.gloService.showMsg("请选择区域", null, 2000);
      return;
    }

    this.httpReq.post("commonCarrier/getTrunkList", null, sendData, data => {
      console.error("获取物流列表========", data);
      // 获取物流列表
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.expreArr = data["data"]["list"]; // 物流列表
          if (this.expreArr.length <= 0) {
            this.gloService.showMsg("没有发往该城市的快递公司", null, 3000);
          }
          this.trunkObj = data["data"]["objectMap"]; // 是否有干线
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
        }
      } else {
        this.gloService.showMsg("请求服务器出错", null, 3000);
      }
    });
  }

  /**
   * 获取运费信息
   * @memberof OrderEditPage
   */
  public getCostInfo() {
    const sendData: any = {};
    sendData.cityNo = this.formData.get("toCity").value; // 城市
    if (
      _.isNull(sendData.cityNo) ||
      _.isUndefined(sendData.cityNo) ||
      sendData.cityNo.length == 0
    ) {
      this.gloService.showMsg("请选择城市", null, 2000);
      return;
    }
    sendData.commonCarrierId = this.formData.get("commonCarrierId").value; // 物流
    if (
      _.isNull(sendData.commonCarrierId) ||
      _.isUndefined(sendData.commonCarrierId) ||
      sendData.commonCarrierId.length == 0
    ) {
      this.gloService.showMsg("请选择物流/快递公司", null, 2000);
      return;
    }
    this.httpReq.post("provincesAndCities/matching", null, sendData, data => {
      // 获取获取承运运线和运费标准
      console.error("matching================", data);
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.freInfoArr = data["data"]["list"]; // 费用信息
          this.trunkObj = data["data"]["objectMap"]; // 是否有干线
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
        }
      } else {
        this.gloService.showMsg("请求服务器出错", null, 3000);
      }
    });
  }

  /**
   * 保存表单数据
   * @returns
   * @memberof RegisterPage
   */
  public saveForm() {
    // if (!_.isNull(this.selCityStr)) {
    //   const cityArr = this.selCityStr.split(" ");
    //   const cityObj: any = {};
    //   cityObj.toProvince = cityArr[0]; // 省
    //   cityObj.toCity = cityArr[1]; // 市
    //   GlobalMethod.setForm(this.formData, cityObj); // 表单赋值
    //   console.error(cityArr);
    // }

    console.error("this.formData:", this.formData);
    console.error("this.formData.value:", this.formData.value);
    // console.error("this.selCityStr:", this.selCityStr);
    const formDataCtrl = this.formData.controls;
    const formData = this.jsUtil.deepClone(this.formData.value); // 深度拷贝表单数据
    for (const i in formDataCtrl) {
      // 较验整个表单标记非法字段
      formDataCtrl[i].markAsDirty();
      formDataCtrl[i].updateValueAndValidity();
      console.error(i);
      if (i == "merchantJson") {
        const merchObjCtrl = formDataCtrl[i]["controls"];
        for (const m in merchObjCtrl) {
          merchObjCtrl[m].markAsDirty();
          merchObjCtrl[m].updateValueAndValidity();
        }
      }
      if (i == "merchantOtherJson") {
        console.error("============");
        const merchArrCtrl = formDataCtrl[i]["controls"];
        merchArrCtrl.forEach(val => {
          const merchObjCtrl = val["controls"];
          for (const m in merchObjCtrl) {
            console.error(m);
            merchObjCtrl[m].markAsDirty();
            merchObjCtrl[m].updateValueAndValidity();
          }
        });
      }
      if (i == "toPersonJson") {
        const toPersonObjCtrl = formDataCtrl[i]["controls"];
        for (const m in toPersonObjCtrl) {
          toPersonObjCtrl[m].markAsDirty();
          toPersonObjCtrl[m].updateValueAndValidity();
        }
      }
    }

    if (this.formData.invalid) {
      // 表单较验未通过
      return;
    }

    if (this.trunkObj.matching == 0) {
      this.gloService.showMsg(
        "该物流没有发往该城市的干线,请重新选择",
        null,
        2000
      );
      return;
    }
    const loading = this.gloService.showLoading("正在提交，请稍候...");
    this.httpReq.post(
      "workerUser/placeOrderForWorker",
      null,
      formData,
      data => {
        if (data["status"] == 200) {
          if (data["code"] == 0) {
            this.gloService.showMsg("提交成功", null, 3000);
            loading.dismiss();
            this.navCtrl.pop();
            this.navCtrl.push("MyTaskPage", { selfOpenOrder: true });
          } else {
            this.gloService.showMsg(data["message"], null, 3000);
            loading.dismiss();
          }
        } else {
          loading.dismiss();
          this.gloService.showMsg("请求服务器出错", null, 3000);
        }
      }
    );
    console.error(formData);
  }

  /**
   * 选择收发货人成功返回
   * @param {*} that
   * @param {*} selObj
   * @param {string} keyName 要修改的对象字段名称
   * @param {number} index 数组索引
   * @memberof OrderEditPage
   */
  public backEvent(that: any, selObj: any, keyName: string, index?: number) {
    console.error("backRefresh");
    console.error(selObj);
    console.error(keyName);
    if (keyName == "merchantOtherJson") {
      if (_.isNumber(index)) {
        console.error(index);
        let merchObjArr = that.formData.get("merchantOtherJson") as FormArray;
        const personObj: any = {};
        personObj.merchantName = selObj.consigneeName; // 主发货人姓名
        personObj.merchantPhone = selObj.consigneePhone; // 主发货人手机
        personObj.merchantAddress = selObj.consigneeAddress; // 主发货人地址
        const merchObj = merchObjArr.get(index + "");
        merchObj.patchValue(personObj);
        // GlobalMethod.setForm(merchObj, personObj); // 表单赋值
      }
    } else if (keyName == "merchantJson") {
      const personObj: any = {};
      personObj.merchantName = selObj.consigneeName; // 主发货人姓名
      personObj.merchantPhone = selObj.consigneePhone; // 主发货人手机
      personObj.merchantAddress = selObj.consigneeAddress; // 主发货人地址
      GlobalMethod.setForm(that.formData, { merchantJson: personObj }); // 表单赋值
    } else if (keyName == "toPersonJson") {
      const personObj: any = {};
      personObj.toPerson = selObj.consigneeName; // 主发货人姓名
      personObj.toPhone = selObj.consigneePhone; // 主发货人手机
      personObj.toAddress = selObj.consigneeAddress; // 主发货人地址
      GlobalMethod.setForm(that.formData, { toPersonJson: personObj }); // 表单赋值
    }
    // console.error(this.reqUrl, this.sendData);
  }
}
