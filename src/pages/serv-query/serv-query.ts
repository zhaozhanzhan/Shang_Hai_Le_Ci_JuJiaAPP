import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController,
  Refresher,
  InfiniteScroll,
  Content,
  ModalController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore"; // 工具类
import { GlobalService } from "../../common/service/GlobalService";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { pageObj, reqObj } from "../../common/config/BaseConfig";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { FilePreviewService } from "../../common/service/FilePreview.Service";
// import { ParamService } from "../../common/service/Param.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
@IonicPage()
@Component({
  selector: "page-serv-query",
  templateUrl: "serv-query.html"
})
export class ServQueryPage {
  @ViewChild(Content)
  content: Content;
  public paramType: any = null; // 传递过来的参数类型
  public baseImgUrl: any = reqObj.baseImgUrl; // 基础图片URL
  public reqUrl: string = "home/a/home/homeServerWork/ServiceSettlement"; // 请求数据URL
  public sendData: any = {}; // 定义请求数据时的对象
  public dataList: Array<any> = []; // 数据列表
  public formInfo: any = {}; // 数据信息
  public isShowNoData: boolean = false; // 给客户提示没有更多数据
  public infiniteScroll: InfiniteScroll = null; // 上拉加载事件对象
  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public httpReq: HttpReqService, // Http请求服务
    public ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public filePrevService: FilePreviewService, // PDF文件查看服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public iab: InAppBrowser, // 打开内置浏览器
    public modalCtrl: ModalController // Modal弹出页控制器
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ServQueryPage");
    this.ionicStorage.get("loginInfo").then(loginObj => {
      console.error("loginInfo", loginObj);
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        // 判断是否是空对象
        if (
          !_.isNull(loginObj["UserInfo"]) &&
          !_.isEmpty(loginObj["UserInfo"])
        ) {
          const loginId = loginObj["LoginId"]; // 用户ID
          if (_.isString(loginId) && loginId.length > 0) {
            // this.sendData.pageNo = pageObj.currentPage; // 定义当前页码
            // this.sendData.pageSize = pageObj.everyItem; // 定义当前页面请求条数
            // this.sendData.totalPage = pageObj.totalPage; // 定义总页数
            const curMonthArr = GlobalMethod.getCurrMonthDays(true); // 获取本月开始时间结束时间数组
            this.sendData.starttime = curMonthArr[0]; // 开始时间
            this.sendData.endtime = curMonthArr[1]; // 结束时间
            this.sendData.personid = loginId; // 用户ID
            console.error(GlobalMethod.getCurrMonthDays(true));
            console.error(this.sendData);
            // 请求列表数据
            this.reqData(
              this.reqUrl,
              this.sendData,
              (res: any) => {
                // 请求数据成功
                this.dataList = this.dataList.concat(res);
                if (this.dataList.length == 0) {
                  this.gloService.showMsg("该列表暂无数据！");
                }
                console.error("this.sendData", this.sendData);
              },
              (err: any) => {
                // 请求数据失败
                this.dataList = this.dataList.concat(err);
              }
            );
          } else {
            this.gloService.showMsg("未获取到用户ID", null, 3000);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
          }
        } else {
          this.gloService.showMsg("未获取到用户ID", null, 3000);
          if (this.navCtrl.canGoBack()) {
            this.navCtrl.pop();
          }
        }
      } else {
        this.gloService.showMsg("未获取到用户ID", null, 3000);
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        }
      }
    });
    //127.0.0.1:8980/personid=1062522704693075968&starttime=&endtime=
    // const loginId = loginInfo.LoginId;
  }
  /**
   * 返回到主页
   * @memberof PersonInfoPage
   */
  public backHome() {
    this.navCtrl.setRoot("MainPage", null, { animate: true }); // 跳转到主页
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @param {*} opts 转场动画
   * @memberof ServiceConfigPage
   */
  public jumpPage(pageName: any, obj?: any, opts?: any): void {
    if (_.isObject(obj) && !_.isEmpty(obj)) {
      this.navCtrl.push(pageName, obj);
    } else {
      if (pageName == "ScanPage") {
        this.navCtrl.push(pageName, null, opts);
      } else {
        this.navCtrl.push(pageName);
      }
    }
  }

  /**
   * 请求列表数据
   * @param {string} url 接口URL地址
   * @param {*} reqObj 请接参数对象
   * @param {Function} suc 请求成功回调获取到的列表数据数组
   * @param {Function} err 请求成功回调空数组
   * @memberof ConsignorListPage
   */
  public reqData(url: string, reqObj: any, suc: Function, err: Function) {
    this.httpReq.get(url, reqObj, (data: any) => {
      if (data["data"] && _.isArray(data["data"]["ServiceSettlement"])) {
        this.sendData.totalPage = GlobalMethod.calTotalPage(
          data["data"]["count"],
          this.sendData.pageSize
        ); //定义当前总页数
        this.formInfo = data["data"]["tol"];
        suc(data["data"]["ServiceSettlement"]);
        // this.dataList = this.dataList.concat(data["data"]);
      } else {
        this.gloService.showMsg(data["message"], null, 3000);
        err([]);
      }
    });
  }

  /**
   * 下拉刷新列表数据
   * @param {Refresher} ev 下拉刷新事件对象
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @memberof ConsignorListPage
   */
  public downRefresh(ev: Refresher, url: string, reqObj: any) {
    reqObj.pageNo = pageObj.currentPage; //重置当前页码
    reqObj.pageSize = pageObj.everyItem; //重置当前页面请求条数
    console.error("下拉刷新执行");
    this.reqData(
      url,
      reqObj,
      (res: any) => {
        this.dataList = [];
        this.dataList = this.dataList.concat(res); // 添加新增数据
        setTimeout(() => {
          ev.complete(); // 关闭下拉刷新动画
          this.gloService.showMsg("刷新数据成功", null, 1000);
          this.isShowNoData = false; // 关闭提示没有更多数据
          if (!_.isNull(this.infiniteScroll)) {
            this.infiniteScroll.enable(!this.isShowNoData); // 启用上拉加载事件侦听器并隐藏提示
          }
        }, 1000);
        console.error("下拉刷新请求数据成功");
      },
      (err: any) => {
        this.dataList = this.dataList.concat(err); // 添加新增数据
        setTimeout(() => {
          ev.complete(); // 关闭下拉刷新动画
        }, 1000);
        console.error("下拉刷新请求数据失败");
      }
    );
  }

  /**
   * 上拉加载更多数据
   * @param {InfiniteScroll} ev 上拉加载事件对象
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @returns
   * @memberof ConsignorListPage
   */
  public upLoad(ev: InfiniteScroll, url: string, reqObj: any) {
    this.infiniteScroll = ev; // 保留上拉加载事件对象
    reqObj.pageNo++; // 当前页码加1
    if (reqObj.pageNo > reqObj.totalPage) {
      //判断当前页面页码是否大于总页数
      reqObj.pageNo--;
      setTimeout(() => {
        ev.complete();
        this.isShowNoData = true; // 提示没有更多数据
        ev.enable(!this.isShowNoData); // 禁用上拉加载事件侦听器并隐藏显示
      }, 1000);
      return;
    } else {
      this.reqData(
        url,
        reqObj,
        (res: any) => {
          this.dataList = this.dataList.concat(res); // 添加新增数据
          setTimeout(() => {
            ev.complete(); // 关闭上拉加载动画
          }, 1000);
        },
        (err: any) => {
          reqObj.pageNo--; // 失败页码减1
          this.dataList = this.dataList.concat(err); // 添加新增数据
          setTimeout(() => {
            ev.complete(); // 关闭上拉加载动画
          }, 1000);
          console.error("下拉刷新请求数据失败");
        }
      );
    }
  }

  /**
   * 删除数据
   * @param {any} id 要删除的数据对象ID
   * @param {*} arr 要删除数据的列表数组
   * @param {number} index 要删除的索引
   * @memberof ConsultListComponent
   */
  public delFun(id: any, arr: any, index: number) {
    const reqObj: any = {};
    reqObj.id = id;
    const loading = this.gloService.showLoading("正在删除，请稍候...");
    this.httpReq.post("consignee/del", null, reqObj, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          arr.splice(index, 1); // 本地删除
          this.gloService.showMsg("删除成功", null, 2000);
          loading.dismiss();
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

  /**
   * 单击删除按钮
   * @param {any} id 要删除的数据对象ID
   * @param {*} arr 要删除数据的列表数组
   * @param {number} index 要删除的索引
   * @memberof ConsignorListPage
   */
  public clickDelBtn(id: any, arr: any, index: number): void {
    this.gloService.delAlert(
      () => {
        console.error(id, arr, index);
        this.delFun(id, arr, index);
      },
      () => {
        console.error("");
      }
    );
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
    const url = that.reqUrl;
    const reqObj = that.sendData;
    reqObj.page = pageObj.currentPage; //重置当前页码
    reqObj.size = pageObj.everyItem; //重置当前页面请求条数
    console.error("reqObj", reqObj);
    that.reqData(
      url,
      reqObj,
      (res: any) => {
        that.content.scrollToTop();
        that.dataList = [];
        that.dataList = that.dataList.concat(res); // 添加新增数据
        that.gloService.showMsg("刷新数据成功", null, 1000);
        that.isShowNoData = false; // 关闭提示没有更多数据
        if (!_.isNull(that.infiniteScroll)) {
          that.infiniteScroll.enable(!this.isShowNoData); // 启用上拉加载事件侦听器并隐藏提示
        }
        console.error("下拉刷新请求数据成功");
      },
      (err: any) => {
        that.dataList = that.dataList.concat(err); // 添加新增数据
        console.error("下拉刷新请求数据失败");
      }
    );
  }

  /**
   * 打开文档
   * @memberof TrainDocListPage
   */
  public openDoc(url: string) {
    if (_.isString(url) && url.length > 0) {
      const fileUrl: string = this.baseImgUrl + url; // 文件在服务器上的地址
      this.filePrevService.previewFile(fileUrl);
    } else {
      this.gloService.showMsg("文件地址错误！");
    }
  }

  /**
   * 打开Modal框
   * @param {string} pageName 页面
   * @param {any} obj 传递对象
   * @memberof ServiceConfigPage
   */
  public openModal(pageName: string, obj?: any) {
    console.error("打开弹出层");
    if (obj) {
      this.modalCtrl.create(pageName, obj).present();
    } else {
      this.modalCtrl.create(pageName).present();
    }
  }
}
