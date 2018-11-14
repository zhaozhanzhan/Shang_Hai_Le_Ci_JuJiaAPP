import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Content,
  ActionSheetController,
  Platform,
  AlertController,
  ModalController
  // InfiniteScroll,
  // Slides,
  // Refresher,
} from "ionic-angular";
// import Swiper from "swiper"; // 滑动js库
import { Storage } from "@ionic/storage";
// import { Geolocation } from "@ionic-native/geolocation"; // GPS定位
// import { AndroidPermissions } from "@ionic-native/android-permissions"; // Android权限控制
import { OpenNativeSettings } from "@ionic-native/open-native-settings"; // 系统设置
import { QRScanner } from "@ionic-native/qr-scanner"; // 条码、二维码扫描
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
// import { pageObj } from "../../common/config/BaseConfig";
// import { ParamService } from "../../common/service/Param.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { ParamService } from "../../common/service/Param.Service";

@IonicPage()
@Component({
  selector: "page-scan-collage",
  templateUrl: "scan-collage.html"
})
export class ScanCollagePage {
  @ViewChild(Content)
  content: Content;

  public dataList: Array<any> = []; // 数据列表
  public formData: any = {}; // 表单数据对象
  public recPersonPhone: any = null; // 收货人电话
  public payType: any = null; // 到付 / 现付
  public merPersonPhone: any = null; // 发货人电话

  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public httpReq: HttpReqService, // Http请求服务
    public jsUtil: JsUtilsService, // 自定义JS工具类
    public ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public modalCtrl: ModalController, // Modal弹出页控制器
    // private geolocation: Geolocation, // GPS定位
    // private androidPermissions: AndroidPermissions, // Android权限控制
    public openNativeSettings: OpenNativeSettings, // 系统设置
    public qrScanner: QRScanner // 条码、二维码扫描
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ScanCollagePage");
  }
  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @param {*} opts 转场动画
   * @memberof MyTaskPage
   */
  public jumpPage(pageName: any, obj?: any, opts?: any): void {
    ParamService.setParamObj({
      that: this,
      backRefEvent: this.backRefresh,
      backAddBigPackageNoEvent: this.backAddBigPackageNo
    }); // 保存返回刷新事件

    if (pageName == "ScanTwoPage") {
      this.navCtrl.push(pageName, obj, opts);
    } else if (_.isObject(obj) && !_.isEmpty(obj)) {
      this.navCtrl.push(pageName, obj);
    } else {
      this.navCtrl.push(pageName);
    }
  }

  /**
   * 长按删除小包
   * @param {string} id 小包ID
   * @param {number} index 小包索引
   * @memberof PackageListPage
   */
  public longTapDelSmall(id: string, index: number) {
    // const sendData: any = {
    //   deliveryPackageId: id
    // };
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "确认删除该小包？",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确认",
          handler: () => {
            if (this.dataList.length <= 1) {
              this.recPersonPhone = null; // 收货人电话
              this.payType = null; // 支付类型
              this.merPersonPhone = null; // 发货人手机号
            }
            this.dataList.splice(index, 1); // 删除当前操作元素
            this.gloService.showMsg("删除成功！", null, 3000);
            console.log("this.recPersonPhone", this.recPersonPhone);
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * 确认拼包
   * @memberof ScanCollagePage
   */
  public saveForm() {
    if (this.dataList.length == 0) {
      this.gloService.showMsg("小包数不能为空！", null, 3000);
    } else {
      let userId = null; // 用户ID
      this.ionicStorage.get("loginInfo").then(loginObj => {
        console.error("loginInfo", loginObj);
        if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
          // 判断是否是空对象
          if (
            !_.isNull(loginObj["UserInfo"]) &&
            !_.isEmpty(loginObj["UserInfo"])
          ) {
            userId = loginObj["UserInfo"]["id"]; // 拉包工信息ID
            if (
              !_.isUndefined(userId) &&
              !_.isNull(userId) &&
              userId.length > 0
            ) {
              console.error("userId", userId);
              this.formData.workerId = userId; // 拉包工信息ID
              this.formData.packageJson = [];
              for (let i = 0; i < this.dataList.length; i++) {
                const smallObj: any = {}; // 小包对象
                smallObj.deliveryPackageId = this.dataList[i]["id"];
                this.formData.packageJson.push(smallObj);
              }
              console.error("this.formData====", this.formData);

              const confirm = this.alertCtrl.create({
                title: "提示",
                message:
                  "收货人：" +
                  this.dataList[0]["buyerClientOrder"]["toPerson"] +
                  "; 电话：" +
                  this.recPersonPhone +
                  "; 包裹数：" +
                  this.dataList.length,
                buttons: [
                  {
                    text: "取消",
                    handler: () => {}
                  },
                  {
                    text: "确认",
                    handler: () => {
                      if (this.dataList.length == 1) {
                        // 只有一个包裹
                        this.formData.bigPackageNo = this.dataList[0][
                          "deliveryPackageNo"
                        ]; // 大包裹号

                        const loading = this.gloService.showLoading(
                          "正在提交，请稍候..."
                        );
                        const formData: any = this.jsUtil.deepClone(
                          this.formData
                        );

                        this.httpReq.post(
                          "workerUser/queryPackage",
                          null,
                          formData,
                          data => {
                            if (data["status"] == 200) {
                              if (data["code"] == 0) {
                                this.gloService.showMsg("保存成功", null, 2000);
                                loading.dismiss();
                                this.navCtrl.pop();
                              } else {
                                this.gloService.showMsg(
                                  data["message"],
                                  null,
                                  2000
                                );
                                loading.dismiss();
                              }
                            } else {
                              loading.dismiss();
                              this.gloService.showMsg(
                                "请求服务器出错",
                                null,
                                2000
                              );
                            }
                          }
                        );
                      } else {
                        this.jumpPage(
                          "ScanTwoPage",
                          { scanType: "big" },
                          { animate: false }
                        );
                      }
                    }
                  }
                ]
              });
              confirm.present();
            } else {
              this.gloService.showMsg("未获取到用户ID", null, 3000);
              return;
            }
          } else {
            this.gloService.showMsg("未获取到用户ID", null, 3000);
            return;
          }
        } else {
          this.gloService.showMsg("未获取到用户ID", null, 3000);
          return;
        }
      });
    }
  }

  /**
   * 成功返回刷新列表
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @returns
   * @memberof MyTaskPage
   */
  public backRefresh(that: any, obj: any) {
    console.error("backRefresh");
    console.error(that);
    console.error(obj);
    if (
      !_.isEmpty(obj) &&
      !_.isEmpty(obj.buyerClientOrder) &&
      obj.buyerClientOrder.toPhone
    ) {
      const packageNoArr: any = [];
      for (let i = 0; i < that.dataList.length; i++) {
        packageNoArr.push(that.dataList[i]["deliveryPackageNo"]);
      }
      if (packageNoArr.indexOf(obj["deliveryPackageNo"]) != -1) {
        that.gloService.showMsg("该包裹已扫描，请务重复扫描！", null, 3000);
        return;
      }

      if (that.dataList.length == 0) {
        that.recPersonPhone = obj.buyerClientOrder.toPhone; // 收货人电话
        that.payType = obj.buyerClientOrder.payType; // 支付类型
        that.merPersonPhone = obj.buyerClientOrder.merchantPhone; // 发货人手机号
        that.dataList.push(obj);
      } else {
        if (that.recPersonPhone == obj.buyerClientOrder.toPhone) {
          // 收货人电话一致
          // that.dataList.push(obj);
          if (that.payType == "到付") {
            if (that.payType == obj.buyerClientOrder.payType) {
              that.dataList.push(obj);
            } else {
              that.gloService.showMsg("支付类型不一致！", null, 3000);
            }
          } else if (that.payType == "现付") {
            if (that.payType == obj.buyerClientOrder.payType) {
              if (that.merPersonPhone == obj.buyerClientOrder.merchantPhone) {
                // 判断发货人手机号是否是同一商户
                that.dataList.push(obj);
              } else {
                that.gloService.showMsg(
                  "与第一个包裹发货人手机号不一致！",
                  null,
                  3000
                );
              }
            } else {
              that.gloService.showMsg("支付类型不一致！", null, 3000);
            }
          }
        } else {
          console.log("与第一个包裹收货人电话不一致！");
          that.gloService.showMsg("与第一个包裹收货人电话不一致！", null, 3000);
        }
      }
    } else {
      that.gloService.showMsg("未获取到收货人电话！", null, 3000);
    }

    // that.reqData(
    //   url,
    //   that.pageArr[1]["sendData"],
    //   res => {
    //     that.content.scrollToTop();
    //     that.pageArr[that.pageIndex]["dataList"] = [];
    //     that.pageArr[that.pageIndex]["dataList"] = that.pageArr[that.pageIndex][
    //       "dataList"
    //     ].concat(res); // 添加新增数据
    //     setTimeout(() => {
    //       that.gloService.showMsg("刷新数据成功", null, 1000);
    //       that.pageArr[that.pageIndex]["isShowNoData"] = false; // 关闭提示没有更多数据

    //       if (!_.isNull(that.pageArr[that.pageIndex]["infiniteScroll"])) {
    //         that.pageArr[that.pageIndex]["infiniteScroll"].enable(
    //           !that.pageArr[that.pageIndex]["isShowNoData"]
    //         ); // 启用上拉加载事件侦听器并隐藏提示
    //       }
    //     }, 1000);
    //   },
    //   err => {
    //     that.pageArr[that.pageIndex]["dataList"] = that.pageArr[that.pageIndex][
    //       "dataList"
    //     ].concat(err); // 添加新增数据
    //     console.error("下拉刷新请求数据失败");
    //   }
    // );
  }

  /**
   * 成功返回添加大包裹号
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @returns
   * @memberof MyTaskPage
   */
  public backAddBigPackageNo(that: any, obj: any) {
    if (!_.isEmpty(obj) && obj.bigPackageNo) {
      that.formData.bigPackageNo = obj.bigPackageNo; // 大包裹号
    } else {
      that.gloService.showMsg("获取大包裹号失败", null, 2000);
      return;
    }

    const loading = that.gloService.showLoading("正在提交，请稍候...");
    const formData: any = that.jsUtil.deepClone(that.formData);

    that.httpReq.post("workerUser/queryPackage", null, formData, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          that.gloService.showMsg("保存成功", null, 2000);
          loading.dismiss();
          that.navCtrl.pop();
        } else {
          that.gloService.showMsg(data["message"], null, 2000);
          loading.dismiss();
        }
      } else {
        loading.dismiss();
        that.gloService.showMsg("请求服务器出错", null, 2000);
      }
    });
  }
}
