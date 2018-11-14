import { Component, ViewChild, ElementRef } from "@angular/core";
import {
  Slides,
  IonicPage,
  NavController,
  NavParams,
  Content,
  InfiniteScroll,
  ActionSheetController,
  Platform,
  AlertController,
  Refresher,
  ModalController
} from "ionic-angular";
// import Swiper from "swiper"; // 滑动js库
import { Storage } from "@ionic/storage";
// import { Geolocation } from "@ionic-native/geolocation"; // GPS定位
// import { AndroidPermissions } from "@ionic-native/android-permissions"; // Android权限控制
import { OpenNativeSettings } from "@ionic-native/open-native-settings"; // 系统设置
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { pageObj } from "../../common/config/BaseConfig";
// import { ParamService } from "../../common/service/Param.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { ParamService } from "../../common/service/Param.Service";

// declare var QRCode;

@IonicPage()
@Component({
  selector: "page-my-task",
  templateUrl: "my-task.html"
})
export class MyTaskPage {
  @ViewChild(Content)
  content: Content;

  @ViewChild("swiperPanel")
  swiperPanel: ElementRef;

  @ViewChild(Slides)
  slides: Slides;

  public reqUrl: string = "workerUser/getOrderListForWorkerUser"; // 请求数据URL
  public pageArr: Array<any> = []; // 页面对象数组
  public pageIndex: number = 0; // 当前页面索引
  public sendData: any = {}; // 定义请求数据时的对象
  public dataList: Array<any> = []; // 数据列表
  public isShowNoData: boolean = false; // 给客户提示没有更多数据
  public infiniteScroll: InfiniteScroll = null; // 上拉加载事件对象

  public swiper: any; // 引用滑动库
  public segArr = ["handle", "conduct", "completed", "overtimed"]; // 顶部tab切换值
  public segTitObj = {
    // 顶部标题名称
    handle: "待处理",
    conduct: "进行中",
    completed: "已完成",
    overtimed: "已超时"
  };
  public segModel: string; // 导航值

  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    private httpReq: HttpReqService, // Http请求服务
    private jsUtil: JsUtilsService, // 自定义JS工具类
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public modalCtrl: ModalController, // Modal弹出页控制器
    // private geolocation: Geolocation, // GPS定位
    // private androidPermissions: AndroidPermissions, // Android权限控制
    private openNativeSettings: OpenNativeSettings // 系统设置
  ) {
    this.segModel = this.segArr[this.pageIndex]; // 初始化选择项

    // public pageArr: Array<any> = [];
    // public sendData: any = {}; // 定义请求数据时的对象
    // public dataList: Array<any> = []; // 数据列表
    // public isShowNoData: boolean = false; // 给客户提示没有更多数据
    // public infiniteScroll: InfiniteScroll = null; // 上拉加载事件对象
    for (let i = 0; i < this.segArr.length; i++) {
      // 初始化每个页面对象独立
      const pageObj: any = {}; // 定义页面对象
      pageObj.sendData = this.jsUtil.deepClone(this.sendData); // 初始化请求对象
      pageObj.dataList = this.jsUtil.deepClone(this.dataList); // 初始化列表数组
      pageObj.isShowNoData = this.jsUtil.deepClone(this.isShowNoData); // 初始化页面提示没有更多数据
      pageObj.infiniteScroll = this.jsUtil.deepClone(this.infiniteScroll); // 无限滚动事件对象
      this.pageArr.push(pageObj);
    }
    console.error(this.pageArr);
  }

  ionViewDidLoad() {
    // this.initSwiper(); // 初始化滑动插件
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
            for (let i = 0; i < this.segArr.length; i++) {
              // 初始化每个页面对象独立
              this.pageArr[i]["sendData"]["page"] = pageObj.currentPage; // 定义当前页码
              this.pageArr[i]["sendData"]["size"] = pageObj.everyItem; // 定义当前页面请求条数
              this.pageArr[i]["sendData"]["totalPage"] = pageObj.totalPage; // 定义当前页面请求条数
              // {"id": "当前拉包工Id","status": "（0：待处理，1：进行中，2：已完成）","page": "页码","size": "每页条数"}
              this.pageArr[i]["sendData"]["id"] = userId; // 拉包工信息ID
              this.pageArr[i]["sendData"]["status"] = i; // 人员属于（0：待处理，1：进行中，2：已完成，3：已超时）
              // 请求列表数据
              this.reqData(
                this.reqUrl,
                this.pageArr[i]["sendData"],
                res => {
                  // 请求数据成功
                  this.pageArr[i]["dataList"] = this.pageArr[i][
                    "dataList"
                  ].concat(res);
                  console.error(
                    "this.pageArr[i]['dataList']",
                    this.pageArr[i]["dataList"]
                  );
                },
                err => {
                  // 请求数据失败
                  this.pageArr[i]["dataList"] = this.pageArr[i][
                    "dataList"
                  ].concat(err);
                }
              );
            }
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

  ionViewDidEnter() {
    const selfOpenOrder = this.navParams.get("selfOpenOrder"); // 是否是代客下单
    console.error("selfOpenOrder============", selfOpenOrder);
    if (selfOpenOrder === true) {
      this.selTab(1); // 默认显示进行中
    }
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @memberof MyTaskPage
   */
  public jumpPage(pageName: any, obj?: any): void {
    ParamService.setParamObj({
      that: this,
      backRefEvent: this.backRefresh
    }); // 保存返回刷新事件
    if (_.isObject(obj) && !_.isEmpty(obj)) {
      this.navCtrl.push(pageName, obj);
    } else {
      this.navCtrl.push(pageName);
    }
  }

  /**
   * 打开新页面
   * @param {*} btnType 按钮类型
   * @param {*} pageName 页面组件类名称
   * @param {*} obj 页面组件类名称
   * @memberof MyTaskPage
   */
  public jumpDetailPage(btnType: any, pageName: any, obj?: any): void {
    if (btnType == 2) {
      this.jumpPage(pageName, obj);
    }
  }

  /**
   * 改变tab事件
   * @param {*} ev 事件对象
   * @memberof MyTaskPage
   */
  public segChange(ev: any) {
    this.pageIndex = this.segArr.indexOf(this.segModel); // 改变当前页面索引
    this.slides.slideTo(this.pageIndex);
    // if (_.isArray(this.swiper) && this.swiper.length > 0) {
    //   this.swiper[this.swiper.length - 1].slideTo(this.pageIndex); // 改变内容显示页
    // } else {
    //   this.swiper.slideTo(this.pageIndex); // 改变内容显示页
    // }

    // this.pageArr[this.pageIndex]["isShowNoData"] = false; // 关闭提示没有更多数据
    // for (let i = 0; i < this.segArr.length; i++) {
    //   if (!_.isNull(this.pageArr[i]["infiniteScroll"])) {
    //     this.pageArr[i]["infiniteScroll"].enable(true); // 启用上拉加载事件侦听器并隐藏提示
    //   }
    // }
  }

  /**
   * 单击改变tab事件，解决下拉刷新无法切换
   * @param {number} index 索引值
   * @memberof MyTaskPage
   */
  public selTab(index: number) {
    this.segModel = this.segArr[index];
    this.pageIndex = index; // 改变当前页面索引
    this.slides.slideTo(this.pageIndex);
  }

  /**
   * 滑动页面已改变
   * @memberof MyTaskPage
   */
  public slideChanged() {
    this.pageIndex = this.slides.getActiveIndex(); // 获取当前页面索引
    this.segModel = this.segArr[this.pageIndex]; // 设置当前标题值
    this.pageArr[this.pageIndex]["isShowNoData"] = false; // 关闭提示没有更多数据
    for (let i = 0; i < this.segArr.length; i++) {
      if (!_.isNull(this.pageArr[i]["infiniteScroll"])) {
        this.pageArr[i]["infiniteScroll"].enable(true); // 启用上拉加载事件侦听器并隐藏提示
      }
    }
  }

  /**
   * 初始化滑动插件
   * @memberof MyTaskPage
   */
  public initSwiper() {
    // this.swiper = new Swiper(".swiper-container", {
    //   paginationClickable: true,
    //   slidesPerView: 1, // 设置slider容器能够同时显示的slides数量
    //   spaceBetween: 0, // slide之间的距离（单位px）
    //   watchActiveIndex: true,
    //   initialSlide: 0, //初始化显示第几个
    //   zoom: true, //双击,手势缩放
    //   loop: false, //循环切换
    //   lazyLoading: true, //延迟加载
    //   lazyLoadingOnTransitionStart: true,
    //   lazyLoadingInPrevNext: true,
    //   on: {
    //     slideChange: () => {
    //       if (_.isArray(this.swiper) && this.swiper.length > 0) {
    //         this.pageIndex = this.swiper[this.swiper.length - 1].activeIndex; // 当前页面索引
    //       } else {
    //         this.pageIndex = this.swiper.activeIndex; // 当前页面索引
    //       }
    //       this.segModel = this.segArr[this.pageIndex];
    //       this.pageArr[this.pageIndex]["isShowNoData"] = false; // 关闭提示没有更多数据
    //       for (let i = 0; i < this.segArr.length; i++) {
    //         if (!_.isNull(this.pageArr[i]["infiniteScroll"])) {
    //           this.pageArr[i]["infiniteScroll"].enable(true); // 启用上拉加载事件侦听器并隐藏提示
    //         }
    //       }
    //       console.error(this);
    //       console.error(this.swiper);
    //       console.error(this.segModel);
    //       console.error(this.swiperPanel);
    //       console.error(this.segArr.indexOf(this.segModel));
    //     }
    //   }
    // });
    // console.error("this.swiper", this.swiper);
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
    this.httpReq.post(url, null, reqObj, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          reqObj.totalPage = GlobalMethod.calTotalPage(
            data["data"]["objectMap"]["count"],
            reqObj.size
          ); //定义当前总页数
          console.error("reqObj：", reqObj);
          suc(data["data"]["list"]);
          // this.dataList = this.dataList.concat(data["data"]);
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
          err([]);
        }
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
    reqObj.page = pageObj.currentPage; //重置当前页码
    reqObj.size = pageObj.everyItem; //重置当前页面请求条数
    console.error("下拉刷新执行");
    this.reqData(
      url,
      reqObj,
      res => {
        this.pageArr[this.pageIndex]["dataList"] = [];
        this.pageArr[this.pageIndex]["dataList"] = this.pageArr[this.pageIndex][
          "dataList"
        ].concat(res); // 添加新增数据
        setTimeout(() => {
          if (ev) {
            //补充bug修复----在执行 complete() 结束下拉刷新时执行以下定时器。
            /*恢复上拉刷新状态*/
            setTimeout(() => {
              /*修复下拉刷新导致页面fiexd滚动问题*/
              const scrollContents = document.getElementsByClassName(
                "scroll-content"
              );
              for (let i = 0; i < scrollContents.length; i++) {
                // console.log(scrollContents[i]);
                if (scrollContents[i] && scrollContents[i]["style"]) {
                  scrollContents[i]["style"]["transform"] = "initial";
                  // transform: translateZ(0px); transition-duration: 0ms;
                  // top: 111px;
                }
              }
            }, 500);
            ev.complete(); // 关闭下拉刷新动画
            this.content.resize(); // 更新布局
          }

          this.gloService.showMsg("刷新数据成功", null, 1000);
          this.pageArr[this.pageIndex]["isShowNoData"] = false; // 关闭提示没有更多数据

          if (!_.isNull(this.pageArr[this.pageIndex]["infiniteScroll"])) {
            this.pageArr[this.pageIndex]["infiniteScroll"].enable(
              !this.pageArr[this.pageIndex]["isShowNoData"]
            ); // 启用上拉加载事件侦听器并隐藏提示
          }
        }, 1000);
        console.error("下拉刷新请求数据成功");
      },
      err => {
        this.pageArr[this.pageIndex]["dataList"] = this.pageArr[this.pageIndex][
          "dataList"
        ].concat(err); // 添加新增数据
        setTimeout(() => {
          if (ev) {
            ev.complete(); // 关闭下拉刷新动画
            this.content.resize(); // 更新布局
          }
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
    this.pageArr[this.pageIndex]["infiniteScroll"] = ev; // 保留上拉加载事件对象
    reqObj.page++; // 当前页码加1
    if (reqObj.page > reqObj.totalPage) {
      //判断当前页面页码是否大于总页数
      reqObj.page--; // 失败页码减1
      setTimeout(() => {
        this.pageArr[this.pageIndex]["isShowNoData"] = true; // 提示没有更多数据
        if (ev) {
          ev.complete(); // 关闭下拉刷新动画
          ev.enable(!this.pageArr[this.pageIndex]["isShowNoData"]); // 禁用上拉加载事件侦听器并隐藏显示
          this.content.resize(); // 更新布局
        }
      }, 1000);
      return;
    } else {
      this.reqData(
        url,
        reqObj,
        res => {
          this.pageArr[this.pageIndex]["dataList"] = this.pageArr[
            this.pageIndex
          ]["dataList"].concat(res); // 添加新增数据
          setTimeout(() => {
            if (ev) {
              ev.complete(); // 关闭下拉刷新动画
              this.content.resize(); // 更新布局
            }
          }, 1000);
          console.error("下拉刷新请求数据成功");
        },
        err => {
          reqObj.page--; // 失败页码减1
          this.pageArr[this.pageIndex]["dataList"] = this.pageArr[
            this.pageIndex
          ]["dataList"].concat(err); // 添加新增数据
          setTimeout(() => {
            if (ev) {
              ev.complete(); // 关闭下拉刷新动画
              this.content.resize(); // 更新布局
            }
          }, 1000);
          console.error("下拉刷新请求数据失败");
        }
      );
    }
  }

  /**
   * 刷新所有列表
   * @memberof MyTaskPage
   */
  public refreshAll() {
    let userId: any = null;
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
            for (let i = 0; i < this.segArr.length; i++) {
              // 初始化每个页面对象独立
              this.pageArr[i]["sendData"]["page"] = pageObj.currentPage; // 定义当前页码
              this.pageArr[i]["sendData"]["size"] = pageObj.everyItem; // 定义当前页面请求条数
              this.pageArr[i]["sendData"]["totalPage"] = pageObj.totalPage; // 定义当前页面请求条数
              // {"id": "当前拉包工Id","status": "（0：待处理，1：进行中，2：已完成）","page": "页码","size": "每页条数"}
              this.pageArr[i]["sendData"]["id"] = userId; // 拉包工信息ID
              this.pageArr[i]["sendData"]["status"] = i; // 人员属于（0：待处理，1：进行中，2：已完成，3：已超时）
              // 请求列表数据
              this.reqData(
                this.reqUrl,
                this.pageArr[i]["sendData"],
                res => {
                  // 请求数据成功
                  this.pageArr[i]["dataList"] = []; // 刷新成功清空列表
                  this.pageArr[i]["dataList"] = this.pageArr[i][
                    "dataList"
                  ].concat(res);
                  console.error(
                    "this.pageArr[i]['dataList']",
                    this.pageArr[i]["dataList"]
                  );
                },
                err => {
                  // 请求数据失败
                  this.pageArr[i]["dataList"] = this.pageArr[i][
                    "dataList"
                  ].concat(err);
                }
              );
            }
          }
        }
      }
    });
  }

  /**
   * 选择是否接单
   * @param {boolean} type 选择是受接受该订单
   * @param {string} id
   * @param {number} index
   * @memberof MyTaskPage
   */
  public isRecOrder(type: boolean, id: string, index: number) {
    const titArr = [
      {
        title: "提示",
        message: "确认接受该订单吗？",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      },
      {
        title: "提示",
        message: "确认拒接该订单吗？",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      }
    ];

    if (type) {
      // 确认接受该订单
      this.openAlert(
        titArr[0],
        () => {
          const sendData: any = {};
          sendData.id = id; // 订单ID
          this.ionicStorage.get("loginInfo").then(loginObj => {
            sendData.workerId = loginObj["UserInfo"]["id"]; // 拉包工信息ID
            this.httpReq.post(
              "workerUser/getWorkerOrder",
              null,
              sendData,
              data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    this.pageArr[0]["dataList"].splice(index, 1); // 删除当前操作元素
                    this.pageArr[1]["dataList"].unshift(data["data"]); // 添加新增数据
                    this.gloService.showMsg("接受订单成功！", null, 3000);
                    // reqObj.totalPage = GlobalMethod.calTotalPage(
                    //   data["data"]["objectMap"]["count"],
                    //   reqObj.size
                    // ); //定义当前总页数
                    // console.error("reqObj：", reqObj);
                    // suc(data["data"]["list"]);
                    // this.dataList = this.dataList.concat(data["data"]);
                  } else {
                    this.gloService.showMsg(data["message"], null, 3000);
                    this.refreshAll(); // 刷新所有列表
                    // err([]);
                  }
                } else {
                  // this.gloService.showMsg("请求服务器出错", null, 3000);
                  // err([]);
                }
              }
            );
          });
        },
        () => {
          console.error("cancel");
        }
      );
    } else {
      // 拒绝接受该订单
      this.openAlert(
        titArr[1],
        () => {
          const sendData: any = {};
          sendData.id = id; // 订单ID
          this.ionicStorage.get("loginInfo").then(loginObj => {
            sendData.workerId = loginObj["UserInfo"]["id"]; // 拉包工信息ID
            this.httpReq.post(
              "workerUser/getWorkerOrderDel",
              null,
              sendData,
              data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    this.pageArr[0]["dataList"].splice(index, 1); // 删除当前操作元素
                    this.pageArr[2]["dataList"].unshift(data["data"]); // 添加新增数据
                    this.gloService.showMsg("拒接订单成功！", null, 3000);
                    // reqObj.totalPage = GlobalMethod.calTotalPage(
                    //   data["data"]["objectMap"]["count"],
                    //   reqObj.size
                    // ); //定义当前总页数
                    // console.error("reqObj：", reqObj);
                    // suc(data["data"]["list"]);
                    // this.dataList = this.dataList.concat(data["data"]);
                  } else {
                    this.gloService.showMsg(data["message"], null, 3000);
                    // err([]);
                  }
                } else {
                  // this.gloService.showMsg("请求服务器出错", null, 3000);
                  // err([]);
                }
              }
            );
          });
        },
        () => {
          console.error("cancel");
        }
      );
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
   * 拉包工确认到达
   * @param {string} id 确认订单的ID
   * @memberof MyTaskPage
   */
  public confirmArrive(id: string, index: number) {
    const sendData: any = {};
    sendData.id = id; // 订单ID
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "确认包裹已送达？",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确认",
          handler: () => {
            this.httpReq.post("workerUser/arrive", null, sendData, data => {
              if (data["status"] == 200) {
                if (data["code"] == 0) {
                  this.pageArr[1]["dataList"].splice(index, 1); // 删除当前操作元素
                  this.pageArr[2]["dataList"].unshift(data["data"]); // 添加新增数据
                  this.gloService.showMsg("确认包裹已送达！", null, 3000);
                } else {
                  this.gloService.showMsg(data["message"], null, 3000);
                }
              }
            });
          }
        }
      ]
    });
    confirm.present();
    // this.gloService.showMsg("获取位置信息错误！", null, 3000);
    // const gps: any = {
    //   lat: null,
    //   lon: null
    // };
    // this.geolocation.getCurrentPosition().then(resp => {
    //   gps.lat = resp.coords.latitude; // GPS纬度
    //   gps.lon = resp.coords.longitude; // GPS经度
    //   if (_.isNull(gps.lat) || _.isNull(gps.lon)) {
    //     this.gloService.showMsg("获取位置信息错误！", null, 3000);
    //     return;
    //   }
    // });
    // const gpsPermission = this.androidPermissions.PERMISSION
    //   .ACCESS_FINE_LOCATION;
    // this.androidPermissions.checkPermission(gpsPermission).then(
    //   result => {
    //     const isPermission = result.hasPermission;
    //     if (isPermission) {
    //       //=================获取GPS定位信息 Begin=================//
    //       // this.getGpsInfo(); // 提交GPS信息给后台
    //       //=================获取GPS定位信息 End=================//
    //     } else {
    //       this.gloService.showMsg(
    //         "获取定位权限失败，请开启应用权限",
    //         null,
    //         3000
    //       );
    //       this.androidPermissions.requestPermission(gpsPermission);
    //       this.openGpsSetting(); // 打开GPS设置页面提示
    //     }
    //   },
    //   err => {
    //     this.gloService.showMsg("获取定位权限失败，请开启应用权限", null, 3000);
    //     this.androidPermissions.requestPermission(gpsPermission);
    //     this.openGpsSetting(); // 打开GPS设置页面提示
    //   }
    // );
  }

  /**
   * 打开GPS设置页面提示
   * @memberof MyApp
   */
  public openGpsSetting() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "应用GPS定位权限功能未开启，请前往设置页面开启！",
      buttons: [
        {
          text: "不开启",
          handler: () => {}
        },
        {
          text: "前往设置",
          handler: () => {
            this.openNativeSettings.open("location");
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * 打开二维码Modal框
   * @param {string} pageName 二维码页面
   * @param {string} orderNum 订单号
   * @memberof MyTaskPage
   */
  public openQRCodeModal(pageName: string, orderNum: string) {
    this.modalCtrl.create(pageName, { orderNum: orderNum }).present();
  }

  /**
   * 提货成功返回刷新列表
   * @param {string} url 请求数据接口URL地址
   * @param {*} reqObj 请求数据参数对象
   * @returns
   * @memberof MyTaskPage
   */
  public backRefresh(that: any) {
    console.error("backRefresh");
    console.error(that);
    // console.error(this.reqUrl, this.sendData);
    const url = that.reqUrl;
    that.pageArr[1]["sendData"]["page"] = pageObj.currentPage; // 定义当前页码
    that.pageArr[1]["sendData"]["size"] = pageObj.everyItem; // 定义当前页面请求条数
    that.pageArr[1]["sendData"]["totalPage"] = pageObj.totalPage; // 定义当前页面请求条数
    // {"id": "当前拉包工Id","status": "（0：待处理，1：进行中，2：已完成）","page": "页码","size": "每页条数"}
    console.error("reqObj", that.pageArr[1]["sendData"]);
    that.reqData(
      url,
      that.pageArr[1]["sendData"],
      res => {
        that.content.scrollToTop();
        that.pageArr[that.pageIndex]["dataList"] = [];
        that.pageArr[that.pageIndex]["dataList"] = that.pageArr[that.pageIndex][
          "dataList"
        ].concat(res); // 添加新增数据
        setTimeout(() => {
          that.gloService.showMsg("刷新数据成功", null, 1000);
          that.pageArr[that.pageIndex]["isShowNoData"] = false; // 关闭提示没有更多数据

          if (!_.isNull(that.pageArr[that.pageIndex]["infiniteScroll"])) {
            that.pageArr[that.pageIndex]["infiniteScroll"].enable(
              !that.pageArr[that.pageIndex]["isShowNoData"]
            ); // 启用上拉加载事件侦听器并隐藏提示
          }
        }, 1000);
      },
      err => {
        that.pageArr[that.pageIndex]["dataList"] = that.pageArr[that.pageIndex][
          "dataList"
        ].concat(err); // 添加新增数据
        console.error("下拉刷新请求数据失败");
      }
    );
  }
}
