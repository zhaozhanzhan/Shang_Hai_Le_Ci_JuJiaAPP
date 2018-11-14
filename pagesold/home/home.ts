import { Component, ViewChild } from "@angular/core";
import {
  Slides,
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController
} from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio";
import { Storage } from "@ionic/storage";
// import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import _ from "underscore";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  @ViewChild(Slides)
  slides: Slides;

  public recOrderState: boolean = false; // 定义接单状态
  public noHandleOrderNum: any = null; // 未处理订单数量

  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    private httpReq: HttpReqService, // Http请求服务
    private ionicStorage: Storage, // IonicStorage
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio // 音频播放
  ) {}

  ionViewDidLoad() {
    setInterval(() => {
      this.ionicStorage.get("loginInfo").then(loginObj => {
        if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
          if (
            !_.isNull(loginObj["UserInfo"]) &&
            !_.isEmpty(loginObj["UserInfo"])
          ) {
            this.httpReq.post(
              "workerUser/getOrderCount",
              null,
              { id: loginObj["UserInfo"]["id"] },
              data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    if (data["data"] > 99) {
                      this.noHandleOrderNum = "99+";
                    } else {
                      this.noHandleOrderNum = data["data"];
                    }
                  } else {
                    // this.gloService.showMsg(data["message"], null, 3000);
                  }
                }
              }
            );
          }
        }
      });
    }, 5000);
  }

  ionViewDidEnter() {
    this.slides.autoplayDisableOnInteraction = false; // 解决用户滑动后自动播放失效
    this.ionicStorage.get("loginInfo").then(loginObj => {
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        if (
          !_.isNull(loginObj["UserInfo"]) &&
          !_.isEmpty(loginObj["UserInfo"])
        ) {
          this.recOrderState = loginObj["UserInfo"]["isorder"]; // 是否为正在接单状态

          this.httpReq.post(
            "workerUser/getOrderCount",
            null,
            { id: loginObj["UserInfo"]["id"] },
            data => {
              if (data["status"] == 200) {
                if (data["code"] == 0) {
                  if (data["data"] > 99) {
                    this.noHandleOrderNum = "99+";
                  } else {
                    this.noHandleOrderNum = data["data"];
                  }
                } else {
                  // this.gloService.showMsg(data["message"], null, 3000);
                }
              }
            }
          );
        }
      }
    });

    // setTimeout(() => {
    //   this.navCtrl.push("MyTaskPage");
    // }, 3000);
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  /**
   * 打开新页面
   * @param {*} pageName 页面组件类名称
   * @memberof LoginPage
   */
  public jumpPage(pageName: any): void {
    this.navCtrl.push(pageName);
  }

  // /**
  //  * 打开我的任务页面
  //  * @memberof LoginPage
  //  */
  // public openMyTaskPage(): void {
  //   this.navCtrl.push(MyTaskPage);
  // }

  /**
   * 切换接单状态
   */
  public toggleRevOrderState() {
    const titArr = [
      {
        title: "休息",
        message: "休息期间不能接受待提货订单",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      },
      {
        title: "接单",
        message: "接单啦,系统将为您推送待提货订单",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      }
    ];

    if (!this.recOrderState) {
      // 当前为未接单状态时
      this.openAlert(
        titArr[1],
        () => {
          this.recOrderState = !this.recOrderState; // 改变接单状态
          const sendData: any = {}; // 定义请求数据对象
          this.ionicStorage.get("loginInfo").then(loginObj => {
            sendData.id = loginObj["UserInfo"]["id"]; // 拉包工信息ID
            sendData.isOrder = 1; // 0：休息，1：接单中
            this.httpReq.post(
              "workerUser/workerUserIsOrder",
              null,
              sendData,
              data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    this.gloService.showMsg(
                      "开启持续接受订单成功！",
                      null,
                      3000
                    );
                    this.setOrderState(true);
                  } else {
                    this.gloService.showMsg(data["message"], null, 3000);
                  }
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
      this.openAlert(
        titArr[0],
        () => {
          this.recOrderState = !this.recOrderState; // 改变接单状态
          const sendData: any = {}; // 定义请求数据对象
          this.ionicStorage.get("loginInfo").then(loginObj => {
            sendData.id = loginObj["UserInfo"]["id"]; // 拉包工信息ID
            sendData.isOrder = 0; // 0：休息，1：接单中
            this.httpReq.post(
              "workerUser/workerUserIsOrder",
              null,
              sendData,
              data => {
                if (data["status"] == 200) {
                  if (data["code"] == 0) {
                    this.gloService.showMsg(
                      "关闭持续接受订单成功！",
                      null,
                      3000
                    );
                    this.setOrderState(false);
                  } else {
                    this.gloService.showMsg(data["message"], null, 3000);
                  }
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
   * 更新本地存储的接单状态，解决浏览器刷新状态错误问题
   * @param {boolean} state
   * @memberof HomePage
   */
  public setOrderState(state: boolean) {
    this.ionicStorage.get("loginInfo").then(loginObj => {
      if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
        if (
          !_.isNull(loginObj["UserInfo"]) &&
          !_.isEmpty(loginObj["UserInfo"])
        ) {
          loginObj["UserInfo"]["isorder"] = state; // 接单状态
          this.ionicStorage.set("loginInfo", loginObj); // 更新登录信息配置对象
        }
      }
    });
  }

  /**
   * 未开发提示
   * @memberof HomePage
   */
  public noDevTit() {
    this.gloService.showMsg("该功能暂未开发", null, 2000);
  }
}
