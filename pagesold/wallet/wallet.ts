import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController,
  Content
  // Refresher,
  // InfiniteScroll,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { pageObj } from "../../common/config/BaseConfig";
import { ParamService } from "../../common/service/Param.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";

@IonicPage()
@Component({
  selector: "page-wallet",
  templateUrl: "wallet.html"
})
export class WalletPage {
  @ViewChild(Content)
  content: Content;

  public formInfo: any = {}; // 表单信息

  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    private httpReq: HttpReqService, // Http请求服务
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框 // private globalService: GlobalService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad WalletPage");
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
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @memberof LoginPage
   */
  public jumpPage(pageName: any, obj?: any): void {
    ParamService.setParamObj({
      that: this,
      backRefEvent: this.backRefresh
    }); // 保存返回刷新事件
    if (pageName == "RollOutPage") {
      if (!this.formInfo.canUseAmount) {
        this.gloService.showMsg("未签约银行！", null, 3000);
        return;
      } else if (this.formInfo.canUseAmount == 0) {
        this.gloService.showMsg("没有足够的余额可以转出！", null, 3000);
        return;
      }
    }
    if (obj) {
      console.error(obj);
      this.navCtrl.push(pageName, obj);
    } else {
      this.navCtrl.push(pageName);
    }
  }

  /**
   * 添加成功返回刷新列表
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @returns
   * @memberof ConsignorListPage
   */
  public backRefresh(that: any) {
    console.error("backRefresh");
    console.error(that);
    // console.error(this.reqUrl, this.sendData);
    // const url = that.reqUrl;
    const reqObj = that.sendData;
    reqObj.page = pageObj.currentPage; //重置当前页码
    reqObj.size = pageObj.everyItem; //重置当前页面请求条数
    console.error("reqObj", reqObj);
    // that.reqData(
    //   url,
    //   reqObj,
    //   res => {
    //     that.content.scrollToTop();
    //     that.dataList = [];
    //     that.dataList = that.dataList.concat(res); // 添加新增数据
    //     that.gloService.showMsg("刷新数据成功", null, 1000);
    //     that.isShowNoData = false; // 关闭提示没有更多数据
    //     if (!_.isNull(that.infiniteScroll)) {
    //       that.infiniteScroll.enable(!this.isShowNoData); // 启用上拉加载事件侦听器并隐藏提示
    //     }
    //     console.error("下拉刷新请求数据成功");
    //   },
    //   err => {
    //     that.dataList = that.dataList.concat(err); // 添加新增数据
    //     console.error("下拉刷新请求数据失败");
    //   }
    // );
  }
}
