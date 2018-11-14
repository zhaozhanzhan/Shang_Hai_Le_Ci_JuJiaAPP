import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { BaiduMapComponent } from "../../common/component/components/baidu-map/baidu-map";
import _ from "underscore";

@IonicPage()
@Component({
  selector: "page-map",
  templateUrl: "map.html"
})
export class MapPage {
  @ViewChild("baiduMap")
  baiduMap: BaiduMapComponent;

  public serVal: any; // 查询的值
  public serAddArr: any = []; // 查询的地址的数组
  public serAddArrShow: boolean = false; // 查询的地址的数组
  public cancelBtn: any = true; // 是否显示取消按钮
  public selAddObj: any; // 选择地址对象
  public addDataList: any; // 地址数据列表

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad MapPage");
    console.log("%c baiduMap===========", "color:#C44617", this.baiduMap);
  }

  ionViewDidEnter() {
    this.baiduMap.getPoiArr(120.380329, 31.485923, data => {
      console.log("%c data===========MapPage", "color:#C44617", data);
      this.addDataList = data;
    });
  }

  /**
   * 搜索取消事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serCancel(ev: any) {
    this.serAddArrShow = false; // 显示搜索结果
    this.serAddArr = []; // 获取到搜索的地址
  }

  /**
   * 搜索清除事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serClear(ev: any) {
    this.serAddArrShow = false; // 显示搜索结果
    this.serAddArr = []; // 获取到搜索的地址
  }

  /**
   * 搜索输入事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serInput(ev: any) {
    console.error(this.serVal);
    this.baiduMap.serFun(this.serVal, data => {
      if (_.isArray(data) && data.length > 0) {
        console.log("%c 搜索完成事件===========", "color:#C44617", data);
        this.serAddArrShow = true; // 显示搜索结果
        this.serAddArr = data; // 获取到搜索的地址
      }
    });
  }

  /**
   * 搜索失去焦点输入事件
   * @param {*} ev 事件对象
   * @memberof MapPage
   */
  public serBlur(ev: any) {
    this.serAddArrShow = false; // 显示搜索结果
    this.serAddArr = []; // 搜索的地址
  }

  /**
   * 选择查询地址对象
   * @param {*} obj
   * @memberof MapPage
   */
  public selSerAdd(obj: any) {
    console.log("%c 搜索完成事件obj===========", "color:#C44617", obj);
    this.serVal = obj.title; // 选择的地址
    this.baiduMap.setCenterPoint(obj.point.lng, obj.point.lat);
    this.serAddArrShow = false; // 显示搜索结果
    this.serAddArr = []; // 搜索的地址
  }
}
