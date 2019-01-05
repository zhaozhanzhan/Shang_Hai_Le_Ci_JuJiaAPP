/**
 * name:真机返回按钮处理
 * describe:对安卓真机返回按钮进行处理
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core"; // 注入服务注解
import {
  Platform,
  ToastController,
  App,
  NavController,
  Tabs,
  LoadingController,
  Keyboard,
  MenuController
} from "ionic-angular";
import { GlobalService } from "./GlobalService";

@Injectable()
export class BackButtonService {
  public registerBackButton: boolean = false; // 控制硬件返回按钮是否触发，默认false
  public isDisabled: boolean = false; // 是否禁用安卓物理返回键

  //构造函数 依赖注入
  constructor(
    // public navCtrl: NavController, // 导航控制器
    // public ionicApp: IonicApp,
    public app: App, // 应用控制器
    public platform: Platform, // 平台控制器
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public keyboard: Keyboard, // 键盘控制器
    public toastCtrl: ToastController, // Toast消息提醒控制器
    public loadingCtrl: LoadingController, // 全屏加载动画
    public gloService: GlobalService // 全局自定义服务
  ) {}

  /**
   * 设置物理返回键状态
   * @memberof BackButtonService
   */
  public setDisabled(state: boolean) {
    this.isDisabled = state;
  }

  /**
   * 返回是否禁用物理返回键状态
   * @returns
   * @memberof BackButtonService
   */
  public getDisabled() {
    return this.isDisabled;
  }

  /**
   * 返回按钮事件处理
   * @param {Tabs} tabRef Tabs标签 如果有tabs可控制
   * @memberof BackButtonService
   */
  public registerBackButtonAction(tabRef: Tabs): void {
    this.platform.registerBackButtonAction(() => {
      if (this.isDisabled) {
        return;
      }

      if (this.keyboard.isOpen()) {
        //如果键盘开启则隐藏键盘
        this.keyboard.close();
        return;
      }

      if (this.menuCtrl.isOpen()) {
        //如果侧滑菜单开启则关闭侧滑菜单
        this.menuCtrl.close();
        return;
      }

      let rootNav = this.app.getRootNavs()[0]; // 获取根导航
      console.error("this.app", this.app);
      console.error("rootNav", rootNav);

      //如果想点击返回按钮隐藏toast或loading或Overlay就把下面加上
      // ionicApp._toastPortal.getActive() || ionicApp._loadingPortal.getActive() ||
      let ionicApp = rootNav._app._appRoot;
      console.error("ionicApp", ionicApp);
      console.error("rootNav._views", rootNav._views);
      console.error("rootNav._views.length", rootNav._views.length);
      console.error(
        "rootNav._views[rootNav._views.length-1]",
        rootNav._views[rootNav._views.length - 1]
      );
      console.error(
        "rootNav._views[rootNav._views.length-1].enableBack()",
        rootNav._views[rootNav._views.length - 1].enableBack()
      ); // 检查您是否可以返回导航堆栈
      console.error(
        "rootNav._views[rootNav._views.length-1].index",
        rootNav._views[rootNav._views.length - 1].index
      ); // 获取当前导航堆栈中当前组件的索引
      console.error(
        "rootNav._views[rootNav._views.length-1].isFirst()",
        rootNav._views[rootNav._views.length - 1].isFirst()
      ); // Page是其NavController中页面堆栈中的第一个页面

      let isViewBack = rootNav._views[rootNav._views.length - 1].enableBack();
      if (isViewBack) {
        rootNav._views[rootNav._views.length - 1].dismiss(); // 返回上一页
        return;
      }

      let activePortal =
        ionicApp._overlayPortal.getActive() ||
        ionicApp._modalPortal.getActive(); // 获取弹出层

      if (activePortal) {
        // 如果有弹出层，就取消掉
        activePortal.dismiss().catch(() => {});
        activePortal.onDidDismiss(() => {});
        return;
      }

      // registerBackButtonAction 是系统自带的方法
      let activeNav: NavController = this.app.getActiveNavs()[0]; // 获取活动的NavController

      if (activeNav.canGoBack()) {
        // 判断是否可以返回上一级,如果有一个有效的前一页返回true
        activeNav.pop(); // 返回上一页
      } else {
        // 处理有底部Tab页的情况，未测试
        if (
          tabRef == null ||
          tabRef._selectHistory[tabRef._selectHistory.length - 1] ===
            tabRef.getByIndex(0).id
        ) {
          this.exitApp(); //执行退出
        } else {
          //选择首页第一个的标签
          tabRef.select(0);
        }
      }
    }, 100); // 后面的数字10是必要参数，如果不写默认是0，数字越大优先级越高
  }

  /**
   * 点击安卓原生返回键
   * @memberof MyApp
   */
  public exitApp() {
    if (this.registerBackButton) {
      this.platform.exitApp(); // 退出APP应用
    } else {
      this.registerBackButton = true;
      this.gloService.showMsg("再按一次退出应用", null, 2000);
      setTimeout(() => (this.registerBackButton = false), 2000); //2秒内没有再次点击返回则将触发标志标记为false
    }
  }
}
