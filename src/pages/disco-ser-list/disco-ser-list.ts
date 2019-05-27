import { Component, ViewChild } from "@angular/core";
// import { UpperCasePipe } from "@angular/common";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  Events,
  App,
  ViewController,
  InfiniteScroll,
  Content,
  Refresher,
  IonicPage
} from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio";
import { NFC } from "@ionic-native/nfc"; // NFC
import _ from "underscore"; // 工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
import { ServiceNotification } from "../../common/service/ServiceNotification";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { pageObj, loginInfo } from "../../common/config/BaseConfig";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { Storage } from "@ionic/storage";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-disco-ser-list",
  templateUrl: "disco-ser-list.html"
})
export class DiscoSerListPage {
  @ViewChild(Content)
  content: Content;

  public reqUrl: string = "home/a/server/homeUserArchives/getWhetherOffline"; // 请求数据URL
  public sendData: any = {}; // 定义请求数据时的对象
  public dataList: Array<any> = []; // 数据列表
  public isShowNoData: boolean = false; // 给客户提示没有更多数据
  public infiniteScroll: InfiniteScroll = null; // 上拉加载事件对象
  public serName: string = null; // 查询姓名

  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    public app: App,
    private httpReq: HttpReqService, // Http请求服务
    public nfc: NFC, // NFC
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public viewCtrl: ViewController, // 视图控制器
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio, // 音频播放
    public events: Events, // 事件发布与订阅
    public serNotifi: ServiceNotification // 服务开启定时通知关闭
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad NfcMacListPage");
  }

  ionViewDidEnter() {
    this.sendData.pageNo = pageObj.currentPage; // 定义当前页码
    this.sendData.pageSize = pageObj.everyItem; // 定义当前页面请求条数
    this.sendData.totalPage = pageObj.totalPage; // 定义当前页面请求条数
    this.sendData.serverPersonID = loginInfo.LoginId;
    // 请求列表数据
    const loading = this.gloService.showLoading("正在加载，请稍候...");
    this.reqData(
      this.reqUrl,
      this.sendData,
      (res: any) => {
        // 请求数据成功
        this.dataList = [];
        this.dataList = this.dataList.concat(res);
        console.log("this.sendData", this.sendData);
        loading.dismiss();
      },
      (err: any) => {
        // 请求数据失败
        this.dataList = this.dataList.concat(err);
        loading.dismiss();
      }
    );
  }

  ionViewWillLeave() {
    this.events.unsubscribe("nfcScanSuc"); // 取消NFC扫描成功事件
  }

  /**
   * 切换侧滑菜单
   * @memberof HomePage
   */
  public toggleMenu() {
    this.menuCtrl.toggle();
  }

  /**
   * 返回到主页
   * @memberof UserListPage
   */
  public backHome() {
    this.navCtrl.setRoot("MainPage", null, { animate: true }); // 跳转到主页
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @param {*} opts 转场动画
   * @memberof UserListPage
   */
  public jumpPage(pageName: any, obj?: any, opts?: any): void {
    if (_.isObject(obj) && !_.isEmpty(obj)) {
      ParamService.setParamObj({
        that: this,
        backRefEvent: this.backRefresh
      }); // 保存返回刷新事件

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
   * 打开确认提示对话框
   * @param {Object} titObj 按钮提示信息对象
   * @param {*} confirm 点击确认执行的操作
   * @param {*} cancel 点击取消执行的操作
   * @memberof HomePage
   */
  public openAlert(titObj: Object, confirm: any, cancel: any) {
    let alert = this.alertCtrl.create({
      title: titObj["title"],
      message: titObj["message"],
      buttons: [
        {
          text: titObj["buttonTxt1"],
          role: "cancel",
          handler: cancel
        },
        {
          text: titObj["buttonTxt2"],
          handler: confirm
        }
      ]
    });
    alert.present();
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
      if (data && !_.isEmpty(data) && data.success) {
        this.sendData.totalPage = GlobalMethod.calTotalPage(
          data["data"]["count"],
          this.sendData.pageSize
        ); //定义当前总页数
        suc(data["data"]["list"]);
        // this.dataList = this.dataList.concat(data["data"]);
      } else {
        // this.gloService.showMsg("请求服务器出错", null, 3000);
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
    console.log("下拉刷新执行");
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
        console.log("下拉刷新请求数据成功");
      },
      (err: any) => {
        this.dataList = this.dataList.concat(err); // 添加新增数据
        setTimeout(() => {
          ev.complete(); // 关闭下拉刷新动画
        }, 1000);
        console.log("下拉刷新请求数据失败");
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
          console.log("下拉刷新请求数据失败");
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
        console.log(id, arr, index);
        this.delFun(id, arr, index);
      },
      () => {
        console.log("");
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
    console.log("backRefresh");
    console.log(that);
    // console.log(this.reqUrl, this.sendData);
    const url = that.reqUrl;
    const reqObj = that.sendData;
    reqObj.pageNo = pageObj.currentPage; //重置当前页码
    reqObj.pageSize = pageObj.everyItem; //重置当前页面请求条数
    console.log("reqObj", reqObj);
    that.reqData(
      url,
      reqObj,
      (res: any) => {
        that.dataList = [];
        that.dataList = that.dataList.concat(res); // 添加新增数据
        setTimeout(() => {
          // that.gloService.showMsg("刷新数据成功", null, 1000);
          that.isShowNoData = false; // 关闭提示没有更多数据
          if (!_.isNull(that.infiniteScroll)) {
            that.infiniteScroll.enable(!that.isShowNoData); // 启用上拉加载事件侦听器并隐藏提示
          }
        }, 1000);
        console.log("下拉刷新请求数据成功");
      },
      (err: any) => {
        that.dataList = that.dataList.concat(err); // 添加新增数据
        console.log("下拉刷新请求数据失败");
      }
    );
  }

  /**
   * 未开发提示
   * @memberof HomePage
   */
  public noDevTit() {
    this.gloService.showMsg("该功能正在加急开发中...", null, 2000);
  }

  /**
   * 选择老人进行离线服务
   * @param {string} nfcNo
   * @param {string} userCode
   * @memberof DiscoSerListPage
   */
  public selDiscoSer(nfcNo: string, userCode: string) {
    if (!(_.isString(nfcNo) && nfcNo.length > 0)) {
      this.gloService.showMsg("未获取到NFC码", null, 2000);
      return;
    }
    if (!(_.isString(userCode) && userCode.length > 0)) {
      this.gloService.showMsg("获取服务对象编码失败", null, 2000);
      return;
    }

    const serObj: any = {
      personCode: loginInfo.LoginId,
      userCode: userCode,
      serverItemCode: "",
      startTime: "",
      endTime: "",
      nfcNo: nfcNo,
      billingMethod: ""
    };
    console.log(serObj);
    ParamService.setParamObj(serObj); // 保存返回刷新事件
    ParamService.setParamNfc(nfcNo);
    ParamService.setParamId(userCode);
    this.navCtrl.push("ServiceConfigPage", { intoWay: "leaveLine" });
  }

  /**
   * 查询数据
   * @param {string} name
   * @memberof DiscoSerListPage
   */
  public serFun(name: string) {
    this.sendData.pageNo = pageObj.currentPage; // 定义当前页码
    this.sendData.pageSize = pageObj.everyItem; // 定义当前页面请求条数
    this.sendData.totalPage = pageObj.totalPage; // 定义当前页面请求条数
    this.sendData.serverPersonID = loginInfo.LoginId;
    this.sendData.name = name;
    // 请求列表数据
    const loading = this.gloService.showLoading("正在加载，请稍候...");
    this.reqData(
      this.reqUrl,
      this.sendData,
      (res: any) => {
        // 请求数据成功
        this.dataList = [];
        this.dataList = this.dataList.concat(res);
        console.log("this.sendData", this.sendData);
        loading.dismiss();
      },
      (err: any) => {
        // 请求数据失败
        this.dataList = this.dataList.concat(err);
        loading.dismiss();
      }
    );
  }
}
