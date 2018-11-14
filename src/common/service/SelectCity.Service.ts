/**
 * name:省市区三级联动
 * describe:省市区三级联动选择服务
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core";
import { HttpReqService } from "./HttpUtils.Service";
import { Http } from "@angular/http";
import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/timeout";
import { GlobalService } from "./GlobalService";

@Injectable()
export class SelectCityService {
  public cityArr: any = []; // 城市数据
  constructor(
    public http: Http,
    public gloService: GlobalService, // 全局自定义服务
    public httpReq: HttpReqService // Http请求服务
  ) {
    console.error("===============城市数据===============");
    this.getCityData(data => {
      this.cityArr = data["data"];
    });
  }

  /**
   * 获取城市数据
   * @private
   * @returns
   * @memberof SelectCityService
   */
  public getCityData(suc) {
    this.httpReq.getJson("./assets/json/city1.json", data => {
      suc(data);
    });
  }
}
