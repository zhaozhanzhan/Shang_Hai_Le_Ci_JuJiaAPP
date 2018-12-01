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
import _ from "underscore"; // underscore工具类
import { FormGroup } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
// import { Storage } from "@ionic/storage";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { JsUtilsService } from "../../common/service/JsUtils.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";
// import { ParamService } from "../../common/service/Param.Service";

@IonicPage()
@Component({
  selector: "page-user-detail",
  templateUrl: "user-detail.html"
})
export class UserDetailPage {
  @ViewChild(Content)
  content: Content;

  public paramId: string = null; // 伟递过来的ID
  public pageMode: string = null; // 页面添加与修改状态
  public dataId: string = null; // 修改数据时获取到的ID

  public formInfo: any = {}; // 定义表单对象
  public formData: FormGroup; // 定义表单对象
  constructor(
    // private jsUtil: JsUtilsService, // 自定义JS工具类
    // private ionicStorage: Storage, // IonicStorage
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
    if (_.isString(this.paramId) && this.paramId.length > 0) {
      const sendData: any = {};
      sendData.userID = this.paramId;
      this.httpReq.get(
        "home/a/server/homeUserArchives/getByID",
        sendData,
        data => {
          if (data["data"] && data["data"]["result"] == 0) {
            this.formInfo = data["data"]["userArchivesObj"];
          } else {
            this.formInfo = {};
            this.gloService.showMsg("获取信息失败！");
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

  ionViewDidLoad() {
    console.log("ionViewDidLoad UserDetailPage");
  }

  /**
   * 返回到主页
   * @memberof UserListPage
   */
  public backHome() {
    this.navCtrl.setRoot("MainPage", null, { animate: true }); // 跳转到主页
  }
}
