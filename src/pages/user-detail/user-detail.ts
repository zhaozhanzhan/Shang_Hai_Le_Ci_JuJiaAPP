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
import { Storage } from "@ionic/storage";
import _ from "underscore"; // underscore工具类
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { FormValidService } from "../../common/service/FormValid.Service";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { GlobalMethod } from "../../common/service/GlobalMethod";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";

@IonicPage()
@Component({
  selector: "page-user-detail",
  templateUrl: "user-detail.html"
})
export class UserDetailPage {
  @ViewChild(Content)
  content: Content;

  public pageMode: string = null; // 页面添加与修改状态
  public dataId: string = null; // 修改数据时获取到的ID

  public formInfo: any = {}; // 定义表单对象
  public formData: FormGroup; // 定义表单对象
  constructor(
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧边栏控制
    private jsUtil: JsUtilsService, // 自定义JS工具类
    private httpReq: HttpReqService, // Http请求服务
    private ionicStorage: Storage, // IonicStorage
    public gloService: GlobalService, // 全局自定义服务
    private fb: FormBuilder, // 响应式表单
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.dataId = this.navParams.get("id");
    const sendData: any = {};
    sendData.id = this.dataId;
    this.httpReq.get(
      "home/a/server/homeUserArchives/form.json",
      sendData,
      data => {
        if (data["data"] && data["data"]["homeUserArchives"]) {
          this.formInfo = data["data"]["homeUserArchives"];
        } else {
          this.formInfo = {};
        }
      }
    );
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
