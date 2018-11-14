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
import _ from "underscore"; // 工具类
// import { FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
// import { ParamService } from "../../common/service/Param.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { FormValidService } from "../../common/service/FormValid.Service";

@IonicPage()
@Component({
  selector: "page-select-collage",
  templateUrl: "select-collage.html"
})
export class SelectCollagePage {
  @ViewChild(Content)
  content: Content;

  public userId: any = null; // 拉包工ID
  public dataList: any = []; // 请求的小包列表
  public showDataList: any = []; // 显示的小包列表
  public formData: any = {}; // 表单数据对象
  public selIdArr: Array<string> = []; // 选择的小包ID数组
  public selObjArr: Array<any> = []; // 选择的小包对象数组
  public recPersonPhone: any = null; // 收货人手机号
  public payType: any = null; // 到付 / 现付
  public merPersonPhone: any = null; // 发货人电话

  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private ionicStorage: Storage, // IonicStorage
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧边栏控制
    public jsUtil: JsUtilsService, // 自定义JS工具类
    public ionicStorage: Storage, // IonicStorage
    public httpReq: HttpReqService, // Http请求服务
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad SelectCollagePage");
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
            this.userId = userId; // 拉包工信息ID
            // GlobalMethod.setForm(this.formData, userInfo); // 表单赋值
            // console.error("this.formData：", this.formData);
            const workObj = {
              workerId: userId
            };
            this.httpReq.post(
              "workerUser/getAllHavePackage",
              null,
              workObj,
              data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    if (
                      !_.isUndefined(data["data"]) &&
                      !_.isEmpty(data["data"])
                    ) {
                      console.error("data=============", data["data"]);
                      this.dataList = data["data"];
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
              }
            );
          } else {
            this.gloService.showMsg("未获取到用户ID", null, 2000);
            this.navCtrl.pop();
            return;
          }
        } else {
          this.gloService.showMsg("未获取到用户ID", null, 2000);
          this.navCtrl.pop();
          return;
        }
      } else {
        this.gloService.showMsg("未获取到用户ID", null, 2000);
        this.navCtrl.pop();
        return;
      }
    });
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
   * 打开右侧菜单
   * @memberof MergePackagePage
   */
  public openMenu() {
    if (this.showDataList.length > 0) {
      // 已选择小包数
      this.recPersonPhone = this.showDataList[0]["buyerClientOrder"]["toPhone"]; // 收货人电话
      this.payType = this.showDataList[0]["buyerClientOrder"]["payType"]; // 收货人电话
      this.merPersonPhone = this.showDataList[0]["buyerClientOrder"][
        "merchantPhone"
      ]; // 收货人电话
    } else {
      this.recPersonPhone = null; // 收货人电话
      this.payType = null; // 支付类型
      this.merPersonPhone = null; // 发货人手机号
    }
    this.selIdArr = [];
    this.selObjArr = [];
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
    this.menuCtrl.enable(true, "selSmallPackage");
  }

  /**
   * 禁用右侧菜单
   * @memberof MergePackagePage
   */
  public disabledMenu() {
    this.menuCtrl.enable(false, "selSmallPackage");
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
    if (
      !_.isEmpty(obj) &&
      !_.isEmpty(obj.buyerClientOrder) &&
      obj.buyerClientOrder.toPhone
    ) {
      if (this.showDataList.length == 0) {
        // 当前列表没有数据时
        if (this.selObjArr.length > 0) {
          // 已有勾选数据时
          if (this.recPersonPhone == obj.buyerClientOrder.toPhone) {
            // 收货人电话一致
            if (this.payType == "到付") {
              if (this.payType == obj.buyerClientOrder.payType) {
              } else {
                this.gloService.showMsg("支付类型不一致！", null, 3000);
                return;
              }
            } else if (this.payType == "现付") {
              if (this.payType == obj.buyerClientOrder.payType) {
                if (this.merPersonPhone == obj.buyerClientOrder.merchantPhone) {
                  // 判断发货人手机号是否是同一商户
                } else {
                  this.gloService.showMsg("发货人手机号不一致！", null, 3000);
                  return;
                }
              } else {
                this.gloService.showMsg("支付类型不一致！", null, 3000);
                return;
              }
            }
          } else {
            console.log("收货人电话不一致！");
            this.gloService.showMsg("收货人电话不一致！", null, 3000);
            return;
          }
        } else {
          // 没有勾选数据时
          this.recPersonPhone = obj.buyerClientOrder.toPhone; // 收货人电话
          this.payType = obj.buyerClientOrder.payType; // 支付类型
          this.merPersonPhone = obj.buyerClientOrder.merchantPhone; // 发货人手机号
        }
      } else {
        // 当前列表有数据时
        this.recPersonPhone = this.showDataList[0]["buyerClientOrder"][
          "toPhone"
        ]; // 收货人电话
        this.payType = this.showDataList[0]["buyerClientOrder"]["payType"]; // 收货人电话
        this.merPersonPhone = this.showDataList[0]["buyerClientOrder"][
          "merchantPhone"
        ]; // 收货人电话

        if (this.recPersonPhone == obj.buyerClientOrder.toPhone) {
          // 收货人电话一致
          if (this.payType == "到付") {
            if (this.payType == obj.buyerClientOrder.payType) {
            } else {
              this.gloService.showMsg("支付类型不一致！", null, 3000);
              return;
            }
          } else if (this.payType == "现付") {
            if (this.payType == obj.buyerClientOrder.payType) {
              if (this.merPersonPhone == obj.buyerClientOrder.merchantPhone) {
                // 判断发货人手机号是否是同一商户
              } else {
                this.gloService.showMsg("发货人手机号不一致！", null, 3000);
                return;
              }
            } else {
              this.gloService.showMsg("支付类型不一致！", null, 3000);
              return;
            }
          }
        } else {
          console.log("收货人电话不一致！");
          this.gloService.showMsg("收货人电话不一致！", null, 3000);
          return;
        }
      }
    } else {
      this.gloService.showMsg("未获取到收货人电话！", null, 3000);
      return;
    }

    // if (this.recPersonPhone) {
    //   // 有手机号
    //   if (
    //     !_.isEmpty(obj) &&
    //     !_.isEmpty(obj.buyerClientOrder) &&
    //     obj.buyerClientOrder.toPhone
    //   ) {
    //     if (!(this.recPersonPhone == obj.buyerClientOrder.toPhone)) {
    //       // 手机号不一致
    //       this.gloService.showMsg("手机号不一致，非同一商户！", null, 2000);
    //       return;
    //     }
    //   } else {
    //     this.gloService.showMsg("手机号不一致，非同一商户！", null, 2000);
    //     return;
    //   }
    // } else {
    //   // 无手机号
    //   if (this.selObjArr.length > 0) {
    //     // 已勾择的小包数
    //     if (
    //       !_.isEmpty(obj) &&
    //       !_.isEmpty(obj.buyerClientOrder) &&
    //       obj.buyerClientOrder.toPhone
    //     ) {
    //       if (!(this.recPersonPhone == obj.buyerClientOrder.toPhone)) {
    //         // 手机号不一致
    //         this.gloService.showMsg("手机号不一致，非同一商户！", null, 2000);
    //         return;
    //       }
    //     }
    //   } else {
    //     if (
    //       !_.isEmpty(obj) &&
    //       !_.isEmpty(obj.buyerClientOrder) &&
    //       obj.buyerClientOrder.toPhone
    //     ) {
    //       this.recPersonPhone = obj.buyerClientOrder.toPhone; // 收货人电话
    //       this.payType = obj.buyerClientOrder.payType; // 支付类型
    //       this.merPersonPhone = obj.buyerClientOrder.merchantPhone; // 发货人手机号
    //       // obj.buyerClientOrder.toPhone
    //     }
    //   }
    // }
    // 判断当前是否勾选
    if (this.selIdArr.indexOf(id) == -1) {
      // 如果未勾选
      this.selIdArr.push(id);
      this.selObjArr.push(obj);
    } else if (this.selIdArr.indexOf(id) != -1) {
      // 如果已经勾选
      // if (this.selIdArr.length == 1) {
      // 取消勾选的是最后一个时
      // if (this.showDataList.length > 0) {
      //   // 已选择小包数
      //   this.recPersonPhone = this.showDataList[0]["buyerClientOrder"][
      //     "toPhone"
      //   ];
      // } else {
      //   this.recPersonPhone = null; // 收货人电话
      //   this.payType = null; // 支付类型
      //   this.merPersonPhone = null; // 发货人手机号
      // }
      // }
      const placeIndex = this.selIdArr.indexOf(id);
      this.selIdArr.splice(placeIndex, 1);
      this.selObjArr.splice(placeIndex, 1);
    }
    console.error("this.recPersonPhone", this.recPersonPhone);
    console.error("this.payType", this.payType);
    console.error("this.merPersonPhone", this.merPersonPhone);
    // if (this.selIdArr.indexOf(id) == -1) {
    //   this.selIdArr.push(id);
    //   this.selObjArr.push(obj);
    // } else if (this.selIdArr.indexOf(id) != -1) {
    //   if (this.selIdArr.length == 1) {
    //     if (this.showDataList.length > 0) {
    //       // 已选择小包数
    //       this.recPersonPhone = this.showDataList[0]["buyerClientOrder"][
    //         "toPhone"
    //       ];
    //     } else {
    //       this.recPersonPhone = null;
    //     }
    //   }
    //   const placeIndex = this.selIdArr.indexOf(id);
    //   this.selIdArr.splice(placeIndex, 1);
    //   this.selObjArr.splice(placeIndex, 1);
    // }
  }

  /**
   * 确认选择
   * @memberof SelectCollagePage
   */
  public confirmSel() {
    const copySelObjArr = this.jsUtil.deepClone(this.selObjArr);
    for (let i = 0; i < copySelObjArr.length; i++) {
      this.showDataList.push(copySelObjArr[i]);
    }
    const newDataList: any = [];
    for (let i = 0; i < this.dataList.length; i++) {
      const isHas = this.selIdArr.indexOf(this.dataList[i]["id"]) === -1;
      if (isHas) {
        newDataList.push(this.dataList[i]);
      }
    }
    this.dataList = this.jsUtil.deepClone(newDataList);
    this.selIdArr = [];
    this.selObjArr = [];
    this.closeMenu(); // 关闭右侧菜单
  }

  /**
   * 长按删除小包
   * @param {string} id 小包ID
   * @param {number} index 小包索引
   * @param {any} obj 小包对象
   * @memberof PackageListPage
   */
  public longTapDelSmall(id: string, index: number, obj: any) {
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
            this.showDataList.splice(index, 1); // 删除当前操作元素
            this.dataList.push(obj);
            // this.gloService.showMsg("删除成功！", null, 3000);
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
    if (this.showDataList.length == 0) {
      this.gloService.showMsg("小包数不能为空！", null, 3000);
    }
    this.formData.workerId = this.userId; // 拉包工信息ID
    this.formData.packageJson = [];
    for (let i = 0; i < this.showDataList.length; i++) {
      const smallObj: any = {}; // 小包对象
      smallObj.deliveryPackageId = this.showDataList[i]["id"];
      this.formData.packageJson.push(smallObj);
    }
    console.error("this.formData====", this.formData);

    const confirm = this.alertCtrl.create({
      title: "提示",
      message:
        "收货人：" +
        this.showDataList[0]["buyerClientOrder"]["toPerson"] +
        "; 电话：" +
        this.showDataList[0]["buyerClientOrder"]["toPhone"] +
        "; 包裹数：" +
        this.showDataList.length,
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确认",
          handler: () => {
            if (this.showDataList.length == 1) {
              // 只有一个包裹
              this.formData.bigPackageNo = this.showDataList[0][
                "deliveryPackageNo"
              ]; // 大包裹号

              const loading = this.gloService.showLoading(
                "正在提交，请稍候..."
              );
              const formData: any = this.jsUtil.deepClone(this.formData);

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
                      this.gloService.showMsg(data["message"], null, 2000);
                      loading.dismiss();
                    }
                  } else {
                    loading.dismiss();
                    this.gloService.showMsg("请求服务器出错", null, 2000);
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
