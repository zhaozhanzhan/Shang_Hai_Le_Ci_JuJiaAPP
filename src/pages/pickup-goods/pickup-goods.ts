import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController
} from "ionic-angular";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
// import { Storage } from "@ionic/storage";
// import { pageObj } from "../../common/config/BaseConfig";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";

@IonicPage()
@Component({
  selector: "page-pickup-goods",
  templateUrl: "pickup-goods.html"
})
export class PickupGoodsPage {
  public paramId: any = null; // 参数对象
  public formData: any = {}; // 表单对象
  public dataList: any = []; // 表单对象

  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private ionicStorage: Storage, // IonicStorage
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    private httpReq: HttpReqService, // Http请求服务
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.paramId = this.navParams.get("id");
    console.log("%c 传过来的ID", "color:#DEDE3F", this.paramId);
    if (!_.isNull(this.paramId) && !_.isUndefined(this.paramId)) {
      this.httpReq.post(
        "workerUser/getDeliveryMessage",
        null,
        { id: this.paramId },
        data => {
          if (data["status"] == 200) {
            if (data["code"] == 0) {
              // this.sendData.totalPage = GlobalMethod.calTotalPage(
              //   data["data"]["objectMap"]["count"],
              //   this.sendData.size
              // ); //定义当前总页数
              // suc(data["data"]["list"]);
              const resData = data["data"];
              for (let i = 0; i < resData.length; i++) {
                if (!_.isNull(resData[i]["littleNum"])) {
                  resData[i]["isReadonly"] = true;
                } else {
                  resData[i]["isReadonly"] = false;
                }
              }
              this.dataList = this.dataList.concat(resData);
            } else {
              this.gloService.showMsg(data["message"], null, 2000);
              if (this.navCtrl.canGoBack()) {
                this.navCtrl.pop();
              }
              // err([]);
            }
          } else {
            this.gloService.showMsg("请求服务器出错", null, 2000);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
            // err([]);
          }
        }
      );
    } else {
      this.gloService.showMsg("未获取到ID", null, 2000);
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad PickupGoodsPage");
  }

  /**
   * 输入数值较验
   * @param {*} obj 输入值对象
   * @param {string} key 要较验的对象key
   * @returns {boolean} 返回较验结果
   * @memberof PickupGoodsPage
   */
  public validNum(obj: any, key: string): boolean {
    if (obj[key] <= 0 || obj[key] > 999) {
      return false;
    }
    return true;
  }

  /**
   * 输入处理
   * @param {*} obj 输入值对象
   * @param {string} key 要较验的对象key
   * @memberof PickupGoodsPage
   */
  public ionInputNum(obj: any, key: string) {
    const res = this.validNum(obj, key);
    console.log("%c 返回的较验结果", "color:#EA0848;", res);
    if (!res) {
      this.gloService.showMsg("输入数据非法", null, 2000);
    }
  }

  /**
   * 失去焦点处理
   * @param {*} obj 输入值对象
   * @param {string} key 要较验的对象key
   * @memberof PickupGoodsPage
   */
  public ionBlurNum(obj: any, key: string) {
    const res = this.validNum(obj, key);
    console.log("%c 返回的较验结果", "color:#EA0848;", res);
    if (!res) {
      obj[key] = 1;
      this.gloService.showMsg("输入数据非法", null, 2000);
    }
  }

  /**
   * 获取焦点处理
   * @param {*} obj 输入值对象
   * @param {string} key 要较验的对象key
   * @memberof PickupGoodsPage
   */
  public ionFocusNum(obj: any, key: string) {
    obj[key] = null;
  }

  /**
   * 保存小包数量
   * @param {string} id 详情ID
   * @param {string} orderId 订单ID
   * @param {number} num 小包数量
   * @memberof PickupGoodsPage
   */
  public savePackageNum(id: string, orderId: string, num: number) {
    const sendData: any = { id: id, orderId: orderId, num: num };
    console.log("%c 返回sendData", "color:#EA0848;", sendData);
    const backRefreshObj = ParamService.getParamObj();
    console.error(backRefreshObj);
    console.error(backRefreshObj.backRefEvent);
    const loading = this.gloService.showLoading("正在保存，请稍候...");
    this.httpReq.post("workerUser/setDeliveryNum", null, sendData, data => {
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
  }
}
