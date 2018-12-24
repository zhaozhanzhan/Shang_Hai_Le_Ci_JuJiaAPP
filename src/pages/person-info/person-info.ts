import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage
} from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio";
import { Storage } from "@ionic/storage";
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { LoginPage } from "../login/login";
import { loginInfo, reqObj } from "../../common/config/BaseConfig";
import { PhotoPrevComponent } from "../../common/component/components/photo-prev/photo-prev";
import { Local } from "../../common/service/Storage";
// import _ from "underscore"; // underscore工具类
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-person-info",
  templateUrl: "person-info.html"
})
export class PersonInfoPage {
  @ViewChild("photoPrev")
  photoPrev: PhotoPrevComponent;

  public baseImgUrl: any = reqObj.baseImgUrl; // 基础图片URL
  public formInfo: any = {}; // 数据信息

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
    console.log("ionViewDidLoad PersonInfoPage");
    const loading = this.gloService.showLoading("正在查询，请稍候...");
    const formData: any = {};
    if (loginInfo.LoginId) {
      formData.serverPensonID = loginInfo.LoginId;
    }
    // const testObj: any = {};
    // testObj.__login = true;
    // testObj.__ajax = "json";
    // testObj.username = window["DesUtils"].encode(formData.phone, desConfig.key);
    // testObj.password = window["DesUtils"].encode(
    //   formData.password,
    //   desConfig.key
    // );

    this.httpReq.get(
      "home/a/person/homeServerPerson/getByServerPensonID",
      formData,
      (data: any) => {
        if (data["data"] && data["data"]["result"] == 0) {
          // this.gloService.showMsg("登录成功", null, 1000);
          loading.dismiss();
          this.formInfo = data["data"]["homeServerPerson"];
          // loginInfo.LoginState = "success"; // 登录状态
          // loginInfo.LoginTime = new Date().getTime(); // 登录时间
          // loginInfo.UserName = formData.username; // 用户名
          // loginInfo.Password = formData.password; // 用户密码
          // loginInfo.UserInfo = data["data"]; // 后台返回用户信息对象
          // if (
          //   data["data"] &&
          //   data["data"]["user"] &&
          //   data["data"]["user"]["extend"]
          // ) {
          //   loginInfo.LoginId = data["data"]["user"]["extend"]["extendS1"]; // 登录者Token
          // }
          // if (data["data"] && data["data"]["sessionid"]) {
          //   loginInfo.SessionId = data["data"]["sessionid"]; // 登录者Token
          // }
          // this.ionicStorage.set("userInfo", data["data"]); // 后台返回用户信息对象
          // this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
          // this.navCtrl.setRoot("MainPage"); // 跳转到主页
        } else {
          loading.dismiss();
          this.formInfo = {};
          this.gloService.showMsg("获取信息失败！");
          if (this.navCtrl.canGoBack()) {
            this.navCtrl.pop();
          }
        }
      }
    );
    console.log("%c photoPrev===========", "color:#C44617", this.photoPrev);
  }

  ionViewDidEnter() {
    console.log("ionViewDidEnter");
    console.error("this.navCtrl", this.navCtrl);
  }

  /**
   * 返回到主页
   * @memberof PersonInfoPage
   */
  public backHome() {
    this.navCtrl.setRoot("MainPage", null, { animate: true }); // 跳转到主页
  }

  /**
   * 清除登录信息
   * @memberof LoginPage
   */
  public clearLogin() {
    for (const key in loginInfo) {
      if (
        loginInfo.hasOwnProperty(key) &&
        key !== "UserName" &&
        key !== "Password"
      ) {
        loginInfo[key] = null;
      }
    }
    Local.set("sessionId", "");
    this.ionicStorage.set("loginInfo", loginInfo); // 登录信息配置对象
    this.ionicStorage.set("userInfo", loginInfo["UserInfo"]); // 后台返回用户信息对象
  }

  /**
   * 预览图片
   * @param {Array<any>} arr 图片所在对象数组
   * @param {number} index 要显示的图片索引
   * @memberof PersonInfoPage
   */
  public prevImg(arr: Array<any> = [], index: number = 0) {
    const imgArr = [];
    for (let i = 0; i < arr.length; i++) {
      const imgObj: any = {};
      imgObj.url = this.baseImgUrl + arr[i].fileUrl;
      // imgObj.title = "This is a title";
      imgArr.push(imgObj);
    }
    this.photoPrev.photoViews(imgArr, "url", index);
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
   * 退出提示
   * @param {string} type
   * @memberof SideMenuPage
   */
  public exit(type: string) {
    const titArr = [
      {
        title: "退出账号",
        message: "确认退出当前账号吗?",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      },
      {
        title: "退出应用",
        message: "确认退出当前应用吗?",
        buttonTxt1: "取消",
        buttonTxt2: "确认"
      }
    ];
    this.menuCtrl.close(); // 关闭侧滑菜单
    if (type == "login") {
      this.openAlert(
        titArr[0],
        () => {
          this.exitLogin(); // 退出登录
        },
        () => {}
      );
    } else if (type == "app") {
      this.openAlert(
        titArr[1],
        () => {
          this.exitApp(); // 退出应用
        },
        () => {}
      );
    }
  }

  /**
   * 退出登录
   * @memberof SideMenuPage
   */
  public exitLogin() {
    const loading = this.gloService.showLoading("正在退出，请稍候...");
    const formData: any = {};
    formData.__ajax = "json";
    this.httpReq.get("home/a/logout", formData, data => {
      console.error(data);
      if (data["data"] && data["data"]["result"] == "true") {
        this.gloService.showMsg("退出成功", null, 1000);
        loading.dismiss();
        this.clearLogin(); // 清除登录信息
        this.navCtrl.setRoot(LoginPage); // 跳转到主页
      } else {
        loading.dismiss();
        this.gloService.showMsg(data["message"], null, 3000);
      }
    });
    // this.navCtrl.goToRoot({ animate: false }); // 跳转到主页
    // this.app.getRootNav().push(LoginPage); // 跳转到登录页面
    // this.viewCtrl.dismiss(); // 销毁当前视图
  }

  /**
   * 退出APP应用
   * @memberof SideMenuPage
   */
  public exitApp() {
    this.menuCtrl.close(); // 关闭侧滑菜单
    this.platform.exitApp(); // 退出APP应用
  }
}
