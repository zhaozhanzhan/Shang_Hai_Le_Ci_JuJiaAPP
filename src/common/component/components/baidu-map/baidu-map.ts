import { Component, ViewChild, ElementRef } from "@angular/core";
import { ViewController } from "ionic-angular";
import _ from "underscore"; // 工具类
import { JsUtilsService } from "../../../service/JsUtils.Service";
declare let BMap;
// declare let BMap_Symbol_SHAPE_POINT;

@Component({
  selector: "baidu-map",
  templateUrl: "baidu-map.html"
})
export class BaiduMapComponent {
  @ViewChild("baiduMap")
  baiduMap: ElementRef;

  public map: any; // 地图对象
  public point: any; // 以指定的经度和纬度创建一个地理点坐标
  public marker: any; // 标记
  public geoloCtrl: any; // 定位控件
  public posAddress: any; // 定位地址
  public geoco: any; // 地址解析器实例
  public addArr: any; // 地址数组

  public serAddArr: any = []; // 搜索地址数组

  constructor(public viewCtrl: ViewController, public jsUtil: JsUtilsService) {
    this.viewCtrl.willEnter.subscribe(() => {
      this.defMap(); // 初始化地图
    });
  }

  /**
   * 初始化地图
   * @memberof BaiduMapComponent
   */
  public defMap() {
    let map = (this.map = new BMap.Map(this.baiduMap.nativeElement, {
      enableMapClick: true
    })); // 创建地图实例

    let point = (this.point = new BMap.Point(120.380329, 31.485923)); // 坐标可以通过百度地图坐标拾取器获取
    // map.centerAndZoom("广州",17); // 设置城市设置中心和地图显示级别
    map.centerAndZoom(point, 18); // 设置中心和地图显示级别
    map.enableDragging(); // 开启拖拽
    // map.addControl(new BMap.MapTypeControl()); // 地图类型控件，平面，三维，卫星
    // map.setCurrentCity("广州");

    // 添加定位控件
    const geoloCtrl = (this.geoloCtrl = new BMap.GeolocationControl({}));
    // anchor: "BMAP_ANCHOR_BOTTOM_RIGHT"

    geoloCtrl.addEventListener("locationSuccess", e => {
      // 定位成功事件
      this.locationSuc(e);
    });

    geoloCtrl.addEventListener("locationError", e => {
      // 定位失败事件
      this.locationErr(e);
    });
    map.addControl(geoloCtrl); // 添加定位控件

    this.geoco = new BMap.Geocoder();

    // let sizeMap = new BMap.Size(10, 80); // 显示位置
    // map.addControl(new BMap.NavigationControl());

    map.enableScrollWheelZoom(); // 启动滚轮放大缩小，默认禁用
    map.enableContinuousZoom(); // 连续缩放效果，默认禁用
    map.enableInertialDragging(); // 启用地图惯性拖拽，默认禁用
    map.enableDoubleClickZoom(); // 启用双击放大，默认启用

    // this.getPoiArr(120.380329, 31.485923, data => {
    //   console.log("%c this.addArr===========", "color:#C44617", this.addArr);
    // }); // 获取定位点周边信息数组
    // let myIcon = new BMap.Icon("assets/icon/point.png", new BMap.Size(28, 28)); // 设置定位点图标
    // let marker = (this.marker = new BMap.Marker(point, { icon: myIcon }));

    // map.addOverlay(marker); // 添加定位点标注
    // marker.disableDragging(); // 定位点不可拖拽
    // marker.setAnimation("BMAP_ANIMATION_BOUNCE"); //跳动的动画

    // getCenter()	Point	返回地图当前中心点
    // panTo(center: Point, opts: PanOptions)	none	将地图的中心点更改为给定的点。
    // reset()	none	重新设置地图，恢复地图初始化时的中心点和级别
    // setCenter(center: Point | String)	none	设置地图中心点。center除了可以为坐标点以外，还支持城市名
    // setZoom(zoom: Number)	none	将视图切换到指定的缩放等级，中心点坐标不变。
    // zoomIn()	none	放大一级视图
    // zoomOut()	none	缩小一级视图
    // movestart	{type, target}	地图移动开始时触发此事件
    // moving	{type, target}	地图移动过程中触发此事件
    // moveend	{type, target}	地图移动结束时触发此事件
    // zoomstart	{type, target}	地图更改缩放级别开始时触发触发此事件
    // zoomend	{type, target}	地图更改缩放级别结束时触发触发此事件
    // dragstart	{type, target, pixel, point}	开始拖拽地图时触发
    // dragging	{type, target, pixel, point}	拖拽地图过程中触发
    // dragend	{type, target, pixel, point}	停止拖拽地图时触发
    // minZoom	Number	地图允许展示的最小级别
    // maxZoom	Number	地图允许展示的最大级别
    // Point(lng: Number, lat: Number)	以指定的经度和纬度创建一个地理点坐标
    // location()	none	开始进行定位
    // getAddressComponent()	AddressComponent	返回当前的定位信息。若当前还未定位，则返回null
    // marker.getShadow(); // 获取标注阴影图标

    // marker.addEventListener("click", () => {
    // 单击标注点图标
    // const p = marker.getPosition(); // 获取marker的位置
    // alert("marker的位置是" + p.lng + "," + p.lat);
    // });
  }

  /**
   * 定位成功事件
   * @param {*} e
   * @memberof BaiduMapComponent
   */
  public locationSuc(e: any) {
    this.posAddress = "";
    this.posAddress += e.addressComponent.province; // 省
    this.posAddress += e.addressComponent.city; // 市
    this.posAddress += e.addressComponent.district; // 区
    this.posAddress += e.addressComponent.street; // 街道
    this.posAddress += e.addressComponent.streetNumber; // 号
    this.map.clearOverlays();
    console.error(e);
    // point: J {lng: 120.3054559, lat: 31.57003745}
    this.setCenterPoint(e.point.lng, e.point.lat);
    this.setCenPointIcon(this.point);
  }

  /**
   * 定位失败事件
   * @param {*} e
   * @memberof BaiduMapComponent
   */
  public locationErr(e: any) {
    console.log("%c 获取地理定位失败", "color:#00CC66");
  }

  /**
   * 获取定位点周边信息数组
   * @param {number} lng 地理经度
   * @param {number} lat 地理纬度
   * @param {Function} callback 成功回调
   * @param {number} [r] 半径,默认为100米
   * @param {number} [num] 位置个数,最多12个,系统决定的,默认10个点
   * @memberof BaiduMapComponent
   */
  public getPoiArr(
    lng: number,
    lat: number,
    callback: Function,
    r?: number,
    num?: number
  ) {
    if (_.isNull(r) || _.isUndefined(r)) {
      // 当半径未传值
      r = 100; // 默认为100米
    }
    if (_.isNull(num) || _.isUndefined(num) || num > 12) {
      // 当位置个数未传值或大于12
      num = 10; // 最多12个,默认10个点
    }
    this.point = new BMap.Point(lng, lat); // 以指定的经度和纬度创建一个地理点坐标
    const mOption = {
      poiRadius: r, // 半径为r米内的POI,
      numPois: num // 最多只有12个 系统决定的
    };

    this.geoco.getLocation(
      this.point,
      rs => {
        let allPois = rs.surroundingPois; // 获取全部POI(半径R的范围 最多12个点)
        if (
          _.isNull(allPois) ||
          _.isUndefined(allPois) ||
          (_.isString(allPois) && allPois.length == 0)
        ) {
          return;
        }

        const disMile = []; //储存周围的点和指定点的距离

        for (let i = 0; i < allPois.length; i++) {
          // 计算得到的POI坐标和指定坐标的距离
          const pointA = new BMap.Point(
            allPois[i].point.lng,
            allPois[i].point.lat
          );

          const addDisObj = this.jsUtil.deepClone(allPois[i]);
          addDisObj.distance = parseInt(
            this.map.getDistance(pointA, this.point)
          ); // 计算两个点的距离
          disMile.push(addDisObj); // 有距离信息的对象数组
        }

        const disMileSort = _.sortBy(disMile, "distance"); // 根据distance距离排序
        if (!_.isNull(disMileSort)) {
          this.addArr = this.jsUtil.deepClone(disMileSort); // 深拷贝
        } else {
          this.addArr = [];
        }
        console.log("%c addArr===========", "color:#C44617", this.addArr);
        callback(this.addArr);
      },
      mOption
    );
  }

  /**
   * 顶部搜索事件
   * @param {string} serVal 搜索传递的值
   * @param {Function} callback 搜索成功回调
   * @memberof BaiduMapComponent
   */
  public serFun(serVal: string, callback: Function) {
    const local = new BMap.LocalSearch(this.map, {
      //智能搜索
      onSearchComplete: data => {
        if (_.isObject(data) && !_.isEmpty(data)) {
          console.log(
            "%c 搜索完成事件===========",
            "color:#C44617",
            data["Eq"]
          ); // 获取到搜索的地址
          const serAddArr = data["Eq"];
          const disSerAddArr = [];
          for (let i = 0; i < serAddArr.length; i++) {
            // 计算得到的POI坐标和指定坐标的距离
            const pointA = new BMap.Point(
              serAddArr[i].point.lng,
              serAddArr[i].point.lat
            );

            const addDisObj = this.jsUtil.deepClone(serAddArr[i]);
            addDisObj.distance = parseInt(
              this.map.getDistance(pointA, this.point)
            ); // 计算两个点的距离
            disSerAddArr.push(addDisObj); // 有距离信息的对象数组
          }
          const disMileSort = _.sortBy(disSerAddArr, "distance"); // 根据distance距离排序
          callback(disMileSort);
        } else {
          callback([]);
        }
      }
    });
    local.search(serVal);
  } // 搜索事件

  /**
   * 获取定位点周边信息数组
   * @param {number} lng 地理经度
   * @param {number} lat 地理纬度
   * @memberof BaiduMapComponent
   */
  public setCenterPoint(lng: number, lat: number) {
    console.log("%c 设置中心点===========", "color:#C44617"); // 获取到搜索的地址
    this.point = new BMap.Point(lng, lat);
    this.map.setCenter(this.point);
    this.map.panTo(this.point);
    this.setCenPointIcon(this.point);
  }

  /**
   * 设置中心点图标
   * @param {*} point
   * @memberof BaiduMapComponent
   */
  public setCenPointIcon(point: any) {
    console.log("%c 设置中心点setCenPointIcon===========", "color:#C44617"); // 获取到搜索的地址
    this.map.clearOverlays(); // 清除标记
    let myIcon = new BMap.Icon("assets/icon/point.png", new BMap.Size(28, 28)); // 设置定位点图标
    this.marker = new BMap.Marker(point, { icon: myIcon });
    this.map.addOverlay(this.marker); // 添加定位点标注
    this.marker.disableDragging(); // 定位点不可拖拽
    this.map.centerAndZoom(point, 20); // 设置中心和地图显示级别
  }
}
