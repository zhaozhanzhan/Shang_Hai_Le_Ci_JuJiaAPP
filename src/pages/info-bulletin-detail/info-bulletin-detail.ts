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
import _ from "underscore"; // 工具类
import { NativeAudio } from "@ionic-native/native-audio";
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { reqObj } from "../../common/config/BaseConfig";
import { PhotoPrevComponent } from "../../common/component/components/photo-prev/photo-prev";
// import { Storage } from "@ionic/storage";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-info-bulletin-detail",
  templateUrl: "info-bulletin-detail.html"
})
export class InfoBulletinDetailPage {
  @ViewChild("photoPrev")
  photoPrev: PhotoPrevComponent;

  public baseImgUrl: any = reqObj.baseImgUrl; // 基础图片URL
  public paramId: any = null; // 传递过来的ID
  public formInfo: any = {}; // 数据信息
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
    public nativeAudio: NativeAudio // 音频播放
  ) {}

  ionViewDidLoad() {
    this.paramId = this.navParams.get("id");
    const sendData: any = {};
    sendData.noticeID = this.paramId;
    if (_.isString(this.paramId) && this.paramId.length > 0) {
      this.httpReq.get(
        "home/a/internal/homeNotice/getByNoticeID",
        sendData,
        (data: any) => {
          if (data["data"] && data["data"]["result"] == 0) {
            // this.gloService.showMsg("登录成功", null, 1000);
            this.formInfo = data["data"]["homeNotice"];
          } else {
            this.formInfo = {};
            this.gloService.showMsg("获取信息失败！");
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
          }
        }
      );
    } else {
      this.gloService.showMsg("未获取到用户ID！");
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
      return;
    }
  }

  /**
   * 返回到主页
   * @memberof PersonInfoPage
   */
  public backHome() {
    this.navCtrl.setRoot("MainPage", null, { animate: true }); // 跳转到主页
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
      imgObj.title = "This is a title";
      imgArr.push(imgObj);
    }
    this.photoPrev.photoViews(imgArr, "url", index);
  }
}
