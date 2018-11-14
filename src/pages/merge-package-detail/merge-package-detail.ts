import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  MenuController,
  IonicPage,
  Content
} from "ionic-angular";
import _ from "underscore"; // 工具类
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
// import { FormBuilder, Validators } from "@angular/forms";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { ParamService } from "../../common/service/Param.Service";
// import { Storage } from "@ionic/storage";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-merge-package-detail",
  templateUrl: "merge-package-detail.html"
})
export class MergePackageDetailPage {
  @ViewChild(Content)
  content: Content;

  public paramId: any = null; // 参数对象
  public formInfo: any = {
    packageList: []
  }; // 表单信息
  public formData: any = {}; // 表单对象

  constructor(
    // private ionicStorage: Storage, // IonicStorage
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private fb: FormBuilder, // 响应式表单
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧边栏控制
    private httpReq: HttpReqService, // Http请求服务
    public gloService: GlobalService, // 全局自定义服务
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.paramId = this.navParams.get("id");
    console.log("%c 传过来的ID", "color:#DEDE3F", this.paramId);
    if (!_.isNull(this.paramId) && !_.isUndefined(this.paramId)) {
      this.httpReq.post(
        "workerUser/getClientListForMessage",
        null,
        { orderId: this.paramId },
        data => {
          if (data["status"] == 200) {
            if (data["code"] == 0) {
              // this.sendData.totalPage = GlobalMethod.calTotalPage(
              //   data["data"]["objectMap"]["count"],
              //   this.sendData.size
              // ); //定义当前总页数
              // suc(data["data"]["list"]);
              this.formInfo = data["data"];
            } else {
              this.gloService.showMsg(data["message"], null, 2000);
              if (this.navCtrl.canGoBack()) {
                this.navCtrl.pop();
              }
            }
          } else {
            this.gloService.showMsg("请求服务器出错", null, 2000);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
          }
        }
      );
    } else {
      this.gloService.showMsg("未获取到ID", null, 2000);
      if (this.navCtrl.canGoBack()) {
        this.navCtrl.pop();
      }
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad MergePackageDetailPage");
  }
}
