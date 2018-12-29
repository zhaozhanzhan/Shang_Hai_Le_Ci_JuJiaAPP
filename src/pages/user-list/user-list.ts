import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  AlertController,
  Refresher,
  InfiniteScroll
} from "ionic-angular";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { pageObj, loginInfo } from "../../common/config/BaseConfig";
import { ParamService } from "../../common/service/Param.Service";
// import { Storage } from "@ionic/storage";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";

@IonicPage()
@Component({
  selector: "page-user-list",
  templateUrl: "user-list.html"
})
export class UserListPage {
  public reqUrl: string =
    "home/a/server/homeUserArchives/getUsersByServerPensonID"; // 请求数据URL
  public sendData: any = {}; // 定义请求数据时的对象
  public formInfo: any = {}; // 数据列表
  public dataList: Array<any> = []; // 数据列表
  public isShowNoData: boolean = false; // 给客户提示没有更多数据
  public infiniteScroll: InfiniteScroll = null; // 上拉加载事件对象
  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private fb: FormBuilder, // 响应式表单
    // private ionicStorage: Storage, // IonicStorage
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    private httpReq: HttpReqService, // Http请求服务
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    private globalService: GlobalService
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad UserListPage");
    // this.sendData.page = pageObj.currentPage; // 定义当前页码
    // this.sendData.size = pageObj.everyItem; // 定义当前页面请求条数
    // this.sendData.totalPage = pageObj.totalPage; // 定义当前页面请求条数
    this.sendData.serverPensonID = loginInfo.LoginId;
    // 请求列表数据
    this.reqData(
      this.reqUrl,
      this.sendData,
      res => {
        // 请求数据成功
        this.dataList = this.dataList.concat(res);
        console.error("this.sendData", this.sendData);
      },
      err => {
        // 请求数据失败
        this.dataList = this.dataList.concat(err);
      }
    );
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
    ParamService.setParamObj({
      that: this,
      backRefEvent: this.backRefresh
    }); // 保存返回刷新事件
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
   * @memberof UserListPage
   */
  public reqData(url: string, reqObj: any, suc: Function, err: Function) {
    this.httpReq.get(url, reqObj, data => {
      console.error("data======", data);
      if (data["data"] && data["data"]["result"] == 0) {
        // if (_.isObject(data["data"]["homeServerPerson"])) {
        //   this.formInfo = data["data"]["homeServerPerson"];
        // } else {
        //   this.formInfo = {};
        // }
        if (_.isArray(data["data"]["userArchivesObjs"])) {
          suc(data["data"]["userArchivesObjs"]);
        } else {
          suc([]);
        }
      } else {
        this.gloService.showMsg(data["message"], null, 3000);
        err([]);
      }
    });
    // this.httpReq.post(url, null, reqObj, data => {
    //   if (data["status"] == 200) {
    //     if (data["code"] == 0) {
    // this.sendData.totalPage = GlobalMethod.calTotalPage(
    //   data["data"]["count"],
    //   this.sendData.pageSize
    // ); //定义当前总页数
    //       suc(data["data"]["list"]);
    //       // this.dataList = this.dataList.concat(data["data"]);
    //     } else {
    //       this.gloService.showMsg(data["message"], null, 3000);
    //       err([]);
    //     }
    //   } else {
    //     // this.gloService.showMsg("请求服务器出错", null, 3000);
    //     err([]);
    //   }
    // });
  }

  /**
   * 下拉刷新列表数据
   * @param {Refresher} ev 下拉刷新事件对象
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @memberof UserListPage
   */
  public downRefresh(ev: Refresher, url: string, reqObj: any) {
    reqObj.page = pageObj.currentPage; //重置当前页码
    reqObj.size = pageObj.everyItem; //重置当前页面请求条数
    console.error("下拉刷新执行");
    this.reqData(
      url,
      reqObj,
      res => {
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
      err => {
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
   * @memberof UserListPage
   */
  public upLoad(ev: InfiniteScroll, url: string, reqObj: any) {
    this.infiniteScroll = ev; // 保留上拉加载事件对象
    reqObj.page++; // 当前页码加1
    if (reqObj.page > reqObj.totalPage) {
      //判断当前页面页码是否大于总页数
      reqObj.page--;
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
        res => {
          this.dataList = this.dataList.concat(res); // 添加新增数据
          setTimeout(() => {
            ev.complete(); // 关闭上拉加载动画
          }, 1000);
        },
        err => {
          reqObj.page--; // 失败页码减1
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
   * @memberof UserListPage
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
   * @memberof UserListPage
   */
  public clickDelBtn(id: any, arr: any, index: number): void {
    this.globalService.delAlert(
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
   * @memberof UserListPage
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
      res => {
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
      err => {
        that.dataList = that.dataList.concat(err); // 添加新增数据
        console.error("下拉刷新请求数据失败");
      }
    );
  }
}
