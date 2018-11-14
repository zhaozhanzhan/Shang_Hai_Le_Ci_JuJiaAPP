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
import { FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../../common/service/GlobalService";
import { JsUtilsService } from "../../common/service/JsUtils.Service";
import { HttpReqService } from "../../common/service/HttpUtils.Service";
import { ParamService } from "../../common/service/Param.Service";
// import { Storage } from "@ionic/storage";
// import { FormValidService } from "../../common/service/FormValid.Service";
// import { GlobalMethod } from "../../common/service/GlobalMethod";

@IonicPage()
@Component({
  selector: "page-merge-package",
  templateUrl: "merge-package.html"
})
export class MergePackagePage {
  @ViewChild(Content)
  content: Content;

  public paramId: any = null; // 参数对象
  public formInfo: any = {}; // 表单信息
  public formData: any = {}; // 表单对象
  public dataList: any = []; // 小包列表
  public bigPkgObj: any; // 大包对象
  public smallPkgObj: any; // 小包对象
  public bigIdx: number = null; // 大包索引值
  public smallIdx: number = null; // 小包索引值

  public selSmlIdArr: Array<string> = []; // 选择的小包ID数组
  public selSmlObjArr: Array<any> = []; // 选择的小包对象数组

  constructor(
    // private ionicStorage: Storage, // IonicStorage
    public navCtrl: NavController, // 导航控制器
    public navParams: NavParams, // 导航参数传递控制
    public menuCtrl: MenuController, // 侧边栏控制
    private jsUtil: JsUtilsService, // 自定义JS工具类
    private httpReq: HttpReqService, // Http请求服务
    public gloService: GlobalService, // 全局自定义服务
    private fb: FormBuilder, // 响应式表单
    public actionSheetCtrl: ActionSheetController, // 操作表控制器
    public platform: Platform, // 获取平台信息
    public alertCtrl: AlertController // Alert消息弹出框
  ) {
    this.formData = {
      orderId: "", // 订单ID
      packageJson: [] // 大包数组
    };

    this.bigPkgObj = {
      packageList: []
    }; // 大包基础对象

    this.smallPkgObj = {
      deliveryPackageId: "", // 小包ID
      deliveryPackageName: "", // 小包名称
      deliveryPackageNo: "", // 小包号
      goodsName: "" // 小包品名
    }; // 小包基础对象

    this.clickAdd("big"); // 添加大包
    // this.clickAdd("small", 0);
    // this.formData = this.fb.group({
    //   orderId: ["", [Validators.required]], // 订单ID
    //   packageJson: this.fb.array([]) // 包裹数组
    // });

    // this.bigPackageObj = this.fb.group({
    //   packageList: this.fb.array([]) // 小包数组
    // }); // 大包对象

    // this.smallPackageObj = this.fb.group({
    //   deliveryPackageId: ["", [Validators.required]] // 小包ID
    // });

    this.paramId = this.navParams.get("id");
    console.log("%c 传过来的ID", "color:#DEDE3F", this.paramId);
    if (!_.isNull(this.paramId) && !_.isUndefined(this.paramId)) {
      this.httpReq.post(
        "workerUser/getDeliverypackageList",
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
              this.formInfo = data["data"]["objectMap"];
              this.dataList = this.dataList.concat(data["data"]["list"]);
            } else {
              this.gloService.showMsg(data["message"], null, 2000);
              if (this.navCtrl.canGoBack()) {
                this.navCtrl.pop();
              }
              // err([]);
            }
          } else {
            this.gloService.showMsg("请求服务器出错", null, 2000);
            if (this.navCtrl.canGoBack()) {
              this.navCtrl.pop();
            }
            // err([]);
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
    console.log("ionViewDidLoad MergePackagePage");
  }

  /**
   * 打开右侧菜单
   * @memberof MergePackagePage
   */
  public openMenu(bigIdx: number) {
    this.bigIdx = bigIdx; // 大包索引值
    this.menuCtrl.open("right");
  }

  /**
   * 关闭右侧菜单
   * @memberof MergePackagePage
   */
  public closeMenu() {
    this.menuCtrl.close("right");
  }

  /**
   * 切换右侧菜单打开状态
   * @memberof MergePackagePage
   */
  public toggleMenu() {
    this.menuCtrl.toggle("right");
  }

  /**
   * 启用右侧菜单
   * @memberof MergePackagePage
   */
  public enableMenu() {
    this.menuCtrl.enable(true, "selSmallPackage");
  }

  /**
   * 禁用右侧菜单
   * @memberof MergePackagePage
   */
  public disabledMenu() {
    this.menuCtrl.enable(false, "selSmallPackage");
  }

  /**
   * 创建大包对象
   * @memberof MergePackagePage
   */
  public creBigPakObj() {
    return this.fb.group({
      packageList: this.fb.array([]) // 小包数组
    }); // 大包对象
  }

  /**
   * 创建小包对象
   * @memberof MergePackagePage
   */
  public creSmallPakObj() {
    return this.fb.group({
      deliveryPackageId: ["", [Validators.required]] // 小包ID
    });
  }

  /**
   * 添加大包或小包对象
   * @param {string} type 大包类型
   * @param {number} [i] 小包所在大包的索引值
   * @memberof MergePackagePage
   */
  public clickAdd(type: string, i?: number) {
    if (type == "big") {
      const bigPkgArr = this.formData.packageJson; // 大包数组
      const bigPkgObj = this.jsUtil.deepClone(this.bigPkgObj);
      bigPkgArr.push(bigPkgObj);
    } else if (type == "small") {
      const smallPkgArr = this.formData.packageJson[i]["packageList"]; // 小包数组
      const smallPkgObj = this.jsUtil.deepClone(this.smallPkgObj); // 小包数组
      smallPkgArr.push(smallPkgObj);
    }
  }

  /**
   * 删除大包或小包
   * @param {string} type
   * @param {number} bigIdx
   * @param {number} [smallIdx]
   * @memberof MergePackagePage
   */
  public clickDel(type: string, bigIdx: number, smallIdx?: number) {
    const bigJson = this.formData.packageJson;
    if (type == "big") {
      const smallJson = bigJson[bigIdx]["packageList"];
      for (let i = 0; i < smallJson.length; i++) {
        const smallObj = this.jsUtil.deepClone(smallJson[i]);
        this.dataList.push(smallObj);
      }
      bigJson.splice(bigIdx, 1); // 删除大包对象
    } else if (type == "small") {
      const smallObj = this.jsUtil.deepClone(
        bigJson[bigIdx]["packageList"][smallIdx]
      ); // 小包对象
      this.dataList.push(smallObj);
      bigJson[bigIdx]["packageList"].splice(smallIdx, 1); // 删除小包对象
    }
  }

  /**
   * 选择小包
   * @param {any} objArr 小包源数组
   * @param {number} index 小包索引值
   * @memberof MergePackagePage
   */
  public selSmallPkg(objArr: any, index: number) {
    const bigJson = this.formData.packageJson;
    const smallObj = this.jsUtil.deepClone(objArr[index]); // 小包对象
    smallObj.goodsName = smallObj.deliveryDetails.goodsName;
    smallObj.deliveryPackageId = smallObj.id;
    bigJson[this.bigIdx]["packageList"].push(smallObj); // 添加小包对象进大包数组
    this.closeMenu(); // 关闭右侧菜单
    objArr.splice(index, 1); // 删除小包源数组对象
  }

  /**
   * 判断是否选择
   * @param {string} id
   * @returns {boolean}
   * @memberof MergePackagePage
   */
  public isSelected(id: string): boolean {
    const isSelected = this.selSmlIdArr.indexOf(id) != -1;
    return isSelected;
  }

  /**
   * 点击选择或取消选择小包对象
   * @param {Event} ev 事件对象
   * @param {string} id 当前对象ID
   * @param {*} obj 当前点击行对象
   * @memberof MergePackagePage
   */
  public clickSel(ev: Event, id: string, obj: any) {
    if (ev) {
      console.error(ev);
      ev.stopPropagation(); // 阻止事件冒泡
    }
    console.error(id, obj);
    // 判断当前是否勾选
    if (this.selSmlIdArr.indexOf(id) == -1) {
      this.selSmlIdArr.push(id);
      this.selSmlObjArr.push(obj);
    } else if (this.selSmlIdArr.indexOf(id) != -1) {
      const placeIndex = this.selSmlIdArr.indexOf(id);
      this.selSmlIdArr.splice(placeIndex, 1);
      this.selSmlObjArr.splice(placeIndex, 1);
    }
  }

  /**
   * 保存小包对象
   * @memberof MergePackagePage
   */
  public saveSmallPkg() {
    const bigJson = this.formData.packageJson;
    for (let i = 0; i < this.selSmlObjArr.length; i++) {
      const smallObj = this.jsUtil.deepClone(this.selSmlObjArr[i]); // 小包对象
      smallObj.goodsName = smallObj.deliveryDetails.goodsName;
      smallObj.deliveryPackageId = smallObj.id;
      bigJson[this.bigIdx]["packageList"].push(smallObj); // 添加小包对象进大包数组
    }
    const newDataList: any = [];
    for (let i = 0; i < this.dataList.length; i++) {
      const isHas = this.selSmlIdArr.indexOf(this.dataList[i]["id"]) === -1;
      if (isHas) {
        newDataList.push(this.dataList[i]);
      }
    }
    this.dataList = this.jsUtil.deepClone(newDataList);
    this.selSmlIdArr = [];
    this.selSmlObjArr = [];
    this.closeMenu(); // 关闭右侧菜单
  }

  /**
   * 保存表单数据
   * @memberof MergePackagePage
   */
  public saveForm() {
    if (this.dataList.length > 0) {
      this.gloService.showMsg("还有小包未选择！", null, 2000);
      return;
    }
    const bigJson = this.formData.packageJson;
    const newBigJson = [];
    for (let i = 0; i < bigJson.length; i++) {
      console.error(bigJson[i]);
      if (bigJson[i]["packageList"].length > 0) {
        newBigJson.push(bigJson[i]);
      }
    }
    this.formData.packageJson = newBigJson;
    if (this.formInfo && this.formInfo.clientOrder) {
      this.formData.orderId = this.formInfo.clientOrder.id;
    }
    const formData = this.jsUtil.deepClone(this.formData); // 深度拷贝表单数据
    console.error(formData);
    const backRefreshObj = ParamService.getParamObj();
    console.error(backRefreshObj);
    console.error(backRefreshObj.backRefEvent);
    const loading = this.gloService.showLoading("正在提交，请稍候...");
    this.httpReq.post("workerUser/queryPackage", null, formData, data => {
      if (data["status"] == 200) {
        if (data["code"] == 0) {
          this.gloService.showMsg("提交成功", null, 3000);
          loading.dismiss();
          this.navCtrl.pop();
          console.error(backRefreshObj.backRefEvent);
          if (_.isFunction(backRefreshObj.backRefEvent)) {
            console.error("执行返回刷新事件");
            backRefreshObj.backRefEvent(backRefreshObj.that); // 执行返回刷新事件
          }
        } else {
          this.gloService.showMsg(data["message"], null, 3000);
          loading.dismiss();
        }
      } else {
        loading.dismiss();
        this.gloService.showMsg("请求服务器出错", null, 3000);
      }
    });
  }
}
