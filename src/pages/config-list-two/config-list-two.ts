import { Component } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ModalController
} from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio";
import _ from "underscore"; // underscore工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
import { reqObj } from "../../common/config/BaseConfig";
// import { Storage } from "@ionic/storage";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-config-list-two",
  templateUrl: "config-list-two.html"
})
export class ConfigListTwoPage {
  public baseImgUrl: any = reqObj.baseImgUrl; // 基础图片URL
  public paramId: any = null; // 传过来的ID
  public dataList: any = []; // 数据列表
  public userCode: any = null; // 用户ID
  // public isActive: boolean = false;

  constructor(
    // private fb: FormBuilder, // 响应式表单
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private ionicStorage: Storage, // IonicStorage
    private httpReq: HttpReqService, // Http请求服务
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧滑菜单控制器
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController, // Alert消息弹出框
    public nativeAudio: NativeAudio, // 音频播放
    public modalCtrl: ModalController // Modal弹出页控制器
  ) {
    this.paramId = this.navParams.get("id");
    const sendData: any = {};
    sendData.parentCode = this.paramId;
    this.httpReq.get(
      "home/a/server/homeServerItems/listSecondTree",
      sendData,
      data => {
        console.error("服务配置二级列表", data);
        if (
          data["data"] &&
          _.isArray(data["data"]["serverItemsSecondTreeObjList"])
        ) {
          this.dataList = data["data"]["serverItemsSecondTreeObjList"];
        } else {
          this.dataList = [];
        }
      }
    );

    console.error("ParamService.getParamNfc", ParamService.getParamNfc());
    this.userCode = ParamService.getParamId();
    console.error("ParamService.getParamId", ParamService.getParamId());
    // const nfcNum = ParamService.getParamNfc();
    // const reqObj: any = {};
    // if (nfcNum) {
    //   reqObj.nfcNo = nfcNum;
    //   this.httpReq.get(
    //     "home/a/server/homeUserArchives/getByNfcNo",
    //     reqObj,
    //     data => {
    //       if (data["data"] && data["data"]["homeUserArchives"]) {
    //         this.userCode = data["data"]["homeUserArchives"]["id"];
    //         // this.personInfo = data["data"]["homeArchiveAddress"];
    //       } else {
    //         this.gloService.showMsg("未获取到用户ID");
    //         this.navCtrl.pop();
    //         // this.formInfo = {};
    //       }
    //     }
    //   );
    // }

    // const dataList = this.jsUtil.deepClone(this.navParams.get("dataList"));
    // if (_.isArray(dataList) && dataList.length > 0) {
    //   for (let i = 0; i < dataList.length; i++) {
    //     dataList[i]["isActive"] = false;
    //   }
    //   this.dataList = this.jsUtil.deepClone(dataList);
    // } else {
    //   this.dataList = [];
    // }
    // this.dataList = this.navParams.get("dataList");

    console.error("this.dataList=====", this.dataList);
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ConfigListTwoPage");
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
   * @memberof UserListPage
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
   * 切换菜单展开状态
   * @param {boolean} isActive
   * @param {*} obj
   * @param {number} i
   * @memberof ConfigListPage
   */
  public menuOpenToggle(isActive: boolean, obj: any, i: number) {
    if (isActive) {
      // 展开
      obj["isActive"] = !isActive;
    } else {
      // 关闭
      for (let i = 0; i < this.dataList.length; i++) {
        this.dataList[i]["isActive"] = false;
      }
      obj["isActive"] = !isActive;
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
      obj.userCode = this.userCode;
      this.modalCtrl.create(pageName, obj).present();
    } else {
      this.modalCtrl.create(pageName).present();
    }
  }
}
