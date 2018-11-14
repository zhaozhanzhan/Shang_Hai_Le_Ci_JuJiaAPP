import { Component, ViewChild, ElementRef } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  ViewController
} from "ionic-angular";
import _ from "underscore"; // 工具类
// import { Storage } from "@ionic/storage";
// import { FormBuilder } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { HttpReqService } from "../../common/service/HttpUtils.Service";

declare var QRCode;

@IonicPage()
@Component({
  selector: "page-qrcode-modal",
  templateUrl: "qrcode-modal.html"
})
export class QrcodeModalPage {
  @ViewChild("qrCodeDiv")
  qrCodeDiv: ElementRef;
  public qrCodeObj: any = null; // 二维码对象
  public paramNum: any; // 传过来的编号

  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private httpReq: HttpReqService, // Http请求服务
    // private ionicStorage: Storage, // IonicStorage
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public viewCtrl: ViewController, // 视图控制器
    public menuCtrl: MenuController, // 侧边栏控制
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.paramNum = this.navParams.get("orderNum");
    console.log("%c 传过来的ID", "color:#DEDE3F", this.paramNum);
    if (!_.isNull(this.paramNum) && !_.isUndefined(this.paramNum)) {
    } else {
      this.gloService.showMsg("生成二维码失败！", null, 2000);
      this.viewCtrl.dismiss();
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad QrcodeModalPage");
    this.qrCodeObj = new QRCode(this.qrCodeDiv.nativeElement, {
      width: 150,
      height: 150
    });
    this.qrCodeObj.makeCode(this.paramNum);
  }

  /**
   * 关闭二维码
   * @memberof QrcodeModalPage
   */
  public closeModal() {
    this.viewCtrl.dismiss();
  }
}
