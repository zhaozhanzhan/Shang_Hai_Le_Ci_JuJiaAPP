/**
 * name:Http请求服务工具类
 * describe:对http请求做统一处理
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core";
import {
  Http,
  Response,
  Headers,
  RequestOptions,
  RequestOptionsArgs
  // URLSearchParams,
  // RequestMethod
} from "@angular/http";
import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/timeout";
import { JsUtilsService } from "./JsUtils.Service";
import { reqObj } from "../config/BaseConfig";
import { GlobalService } from "./GlobalService";
import moment from "moment"; // 时间格式化插件
import { Events } from "ionic-angular";
import { Storage } from "@ionic/storage";
import _ from "underscore";
import { Local } from "./Storage";
// import _ from "underscore";

const baseUrl: String = reqObj.baseUrl;

@Injectable()
export class HttpReqService {
  private defHeaders: Headers = new Headers({
    // "Content-Type": "application/x-www-form-urlencoded"
    // "Content-Type": "application/json"
    // Accept: "application/json"
    // token: "",
    // app: "2" // 1：商户app，2：拉包工app
  });
  // private defHeaders = new Headers({
  //   "Content-Type": "application/json",
  //   Accept: "application/json"
  // });
  // private formHeaders = new Headers({
  //   "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  //   Accept: "application/json"
  // });
  // private uploadHeasers = new Headers({
  //   "Content-Type": "multipart/form-data"
  // });
  private defOptions: RequestOptionsArgs = new RequestOptions({
    headers: this.defHeaders
  });
  // private formOptions = new RequestOptions({ headers: this.formHeaders });
  // private uploadOptions = new RequestOptions({ headers: this.uploadHeasers });
  // new RequestOptions({
  //   headers: new Headers({
  //     token: "123"
  //   })
  // })
  private noConsoleUrlArr: Array<string> = [
    "workerUser/getOrderCount",
    "workerUser/saveLatAndLon"
  ]; // 不需要输出Console信息的Url地址

  constructor(
    // private app: App,
    private http: Http,
    private jsUtil: JsUtilsService, // 全局自定义工具类
    public gloService: GlobalService, // 全局自定义服务
    public events: Events, // 事件发布与订阅
    public ionicStorage: Storage // IonicStorage
  ) {
    // this.setSessionId().then(
    //   sessionId => {
    //     const sessId: any = sessionId;
    //     Local.set("sessionId", sessId);
    //     console.error("获取SessionId成功", sessId);
    //   },
    //   err => {
    //     console.error("获取SessionId失败", err);
    //     Local.set("sessionId", "");
    //   }
    // );
    // setTimeout(() => {
    // console.error("=====================", this.app);
    // this.defOptions.headers.set("token", "");
    // console.error("=====================", this.defOptions);
    // this.events.publish("exitLogin");
    // this.app.getRootNav().setRoot("");
    // console.error();
    // this.app.getActiveNavs()[0].setRoot(LoginPage);
    // }, 3000);
  }

  /**
   * 拼接完整请求URL
   * @param url 传入接口的部分URL
   */
  private getFullUrl(url: string): string {
    return baseUrl + url;
  }

  /**
   * 设置SessionId
   * @memberof HttpReqService
   */
  public setSessionId() {
    return new Promise((reslove, reject) => {
      this.ionicStorage.get("loginInfo").then(loginObj => {
        if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
          if (_.isString(loginObj.SessionId) && loginObj.SessionId.length > 0) {
            console.error("loginObj.SessionId==========", loginObj.SessionId);
            reslove(loginObj.SessionId);
          } else {
            reject("");
          }
        } else {
          reject("");
        }
      });
    });
  }

  /**
   * 设置更新Token
   * @private
   * @memberof HttpReqService
   */
  // private setToken() {
  // if (
  //   !_.isNull(loginInfo.Token) &&
  //   !_.isUndefined(loginInfo.Token) &&
  //   loginInfo.Token.length > 0
  // ) {
  //   // console.error("loginObj.Token==========", loginInfo.Token);
  //   this.defOptions.headers.set("token", loginInfo.Token);
  // } else {
  //   this.defOptions.headers.set("token", "");
  // }
  // this.defOptions.headers.set("token", loginInfo.Token);
  // this.ionicStorage.get("loginInfo").then(loginObj => {
  //   if (!_.isNull(loginObj) && !_.isEmpty(loginObj)) {
  //     if (
  //       !_.isNull(loginObj.Token) &&
  //       !_.isUndefined(loginObj.Token) &&
  //       loginObj.Token.length > 0
  //     ) {
  //       console.error("loginObj.Token==========", loginObj.Token);
  //       this.defOptions.headers.set("token", loginObj.Token);
  //     } else {
  //       this.defOptions.headers.set("token", "");
  //     }
  //   } else {
  //     this.defOptions.headers.set("token", "");
  //   }
  // });
  // }

  /**
   * GET请求方法
   * @param url 请求URL地址
   * @param queryParams 请求Query参数
   * @param bodyParams 请求Body参数
   */
  public get(url: string, queryParams: any, suc: Function): any {
    const that = this;
    const ipUrl = this.getFullUrl(url); // IP + 接口URL
    const queParam = this.jsUtil.queryStr(queryParams);
    let reqUrl: string = "";
    if (queParam) {
      const queryObj = this.jsUtil.deepClone(queryParams);
      const sid: any = Local.get("sessionId");
      if (_.isString(sid) && sid.length > 0) {
        queryObj.__sid = sid;
      }
      reqUrl = ipUrl + "?" + this.jsUtil.queryStr(queryObj); // URL后拼接查询参数
    } else {
      const queryObj: any = {};
      const sid: any = Local.get("sessionId");
      if (_.isString(sid) && sid.length > 0) {
        queryObj.__sid = sid;
      }
      reqUrl = ipUrl + "?" + this.jsUtil.queryStr(queryObj);
    }

    if (this.noConsoleUrlArr.indexOf(url) == -1) {
      console.log(
        "%c %s",
        "color:#0012FC;",
        "=====GET请求信息=====：" +
          moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
          " " +
          reqUrl
      );
    }

    // this.setToken(); // 设置更新Token
    this.http
      .get(reqUrl, this.defOptions)
      .timeout(10000)
      .toPromise()
      .then((res: Response) => {
        let body = res["_body"];
        // console.warn("接口返回的成功信息：", res);
        // console.warn("接口返回的成功信息：", res.json());
        // console.log("接口返回的成功信息：", res);
        if (body) {
          // 有数据返回
          const resObj = {
            data: res.json() || {},
            // code: res.json().code === 0 ? 0 : res.json().code || {},
            message: res.json().message || "",
            // statusText: res.statusText,
            // status: res.status,
            success: true
          }; // 返回内容 // 返回code // 返回信息
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            console.log(
              "%c %s %o",
              "color:#009803;",
              "=====GET返回信息=====：" +
                moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
                " ",
              this.jsUtil.deepClone(resObj)
            );
          }
          if (res.json() && res.json()["result"] == "login") {
            this.events.publish("exitLogin");
          }
          suc(resObj);
        } else {
          // 无数据返回
          const resObj = {
            data: res.json() || {},
            // code: res.json().code === 0 ? 0 : res.json().code || {},
            message: res.json().message || "",
            // statusText: res.statusText,
            // status: res.status,
            success: true
          }; // 返回内容 // 返回code // 返回信息

          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            console.log(
              "%c %s %o",
              "color:#009803;",
              "=====GET返回信息=====：" +
                moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
                " ",
              this.jsUtil.deepClone(resObj)
            );
          }

          if (res.json() && res.json()["result"] == "login") {
            this.events.publish("exitLogin");
          }
          suc(resObj);
        }
      })
      .catch(error => {
        if (error.status == 400) {
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            that.gloService.showMsg("请求参数正确时异常");
          }
          console.log("请求参数正确时异常");
        }
        if (error.status == 404) {
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            that.gloService.showMsg("请检查路径是否正确");
          }
          console.error("请检查路径是否正确");
        }
        if (error.status == 500) {
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            that.gloService.showMsg("请求的服务器错误");
          }
          console.error("请求的服务器错误");
        }
        console.log(error);
        // if (this.noConsoleUrlArr.indexOf(url) == -1) {
        //   that.gloService.showMsg("服务器请求出错，请检查网络连接！");
        // }
        // 无数据返回
        const resObj = {
          data: {},
          // code: -1,
          message: "",
          // statusText: "服务器请求出错，请检查网络连接！",
          // status: -1,
          success: false
        }; // 返回内容 // 返回code // 返回信息
        suc(resObj);
      });
  }

  /**
   * POST请求方法
   * @param url 请求URL地址
   * @param queryParams 请求Query参数
   * @param bodyParams 请求Body参数
   */
  public post(
    url: string,
    queryParams: any,
    bodyParams: any,
    suc: Function
  ): any {
    const that = this;
    const ipUrl = this.getFullUrl(url); // IP + 接口URL
    const queParam = this.jsUtil.queryStr(queryParams);
    let reqUrl: string = "";
    if (queParam) {
      const queryObj = this.jsUtil.deepClone(queryParams);
      const sid: any = Local.get("sessionId");
      if (_.isString(sid) && sid.length > 0) {
        queryObj.__sid = sid;
      }
      reqUrl = ipUrl + "?" + this.jsUtil.queryStr(queryObj); // URL后拼接查询参数
    } else {
      const queryObj: any = {};
      const sid: any = Local.get("sessionId");
      if (_.isString(sid) && sid.length > 0) {
        queryObj.__sid = sid;
      }
      reqUrl = ipUrl + "?" + this.jsUtil.queryStr(queryObj);
    }
    bodyParams = bodyParams || {};
    if (this.noConsoleUrlArr.indexOf(url) == -1) {
      console.log(
        "%c %s %o",
        "color:#0012FC;",
        "=====POST请求信息=====：" +
          moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
          " " +
          reqUrl,
        this.jsUtil.deepClone(bodyParams)
      );
    }
    // this.setToken(); // 设置更新Token
    this.http
      .post(reqUrl, bodyParams, this.defOptions)
      .timeout(10000)
      .toPromise()
      .then((res: Response) => {
        let body = res["_body"];
        if (body) {
          // 有数据返回
          const resObj = {
            data: res.json() || {},
            // code: res.json().code === 0 ? 0 : res.json().code || {},
            message: res.json().message || "",
            // statusText: res.statusText,
            // status: res.status,
            success: true
          }; // 返回内容 // 返回code // 返回信息
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            console.log(
              "%c %s %o",
              "color:#009803;",
              "=====POST返回信息=====：" +
                moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
                " ",
              this.jsUtil.deepClone(resObj)
            );
          }
          if (res.json() && res.json()["result"] == "login") {
            this.events.publish("exitLogin");
          }
          suc(resObj);
        } else {
          // 无数据返回
          const resObj = {
            data: res.json() || {},
            // code: res.json().code === 0 ? 0 : res.json().code || {},
            message: res.json().message || "",
            // statusText: res.statusText,
            // status: res.status,
            success: true
          }; // 返回内容 // 返回code // 返回信息

          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            console.log(
              "%c %s %o",
              "color:#009803;",
              "=====POST返回信息=====：" +
                moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
                " ",
              this.jsUtil.deepClone(resObj)
            );
          }

          if (res.json() && res.json()["result"] == "login") {
            this.events.publish("exitLogin");
          }
          suc(resObj);
        }
      })
      .catch(error => {
        if (error.status == 400) {
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            that.gloService.showMsg("请求参数正确时异常");
          }
          console.log("请求参数正确");
        }
        if (error.status == 404) {
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            that.gloService.showMsg("请检查路径是否正确");
          }
          console.error("请检查路径是否正确");
        }
        if (error.status == 500) {
          if (this.noConsoleUrlArr.indexOf(url) == -1) {
            that.gloService.showMsg("请求的服务器错误");
          }
          console.error("请求的服务器错误");
        }
        // if (this.noConsoleUrlArr.indexOf(url) == -1) {
        //   that.gloService.showMsg("服务器请求出错，请检查网络连接！");
        // }

        // 无数据返回
        const resObj = {
          data: {},
          // code: -1,
          message: "",
          // statusText: "服务器请求出错，请检查网络连接！",
          // status: -1,
          success: false
        }; // 返回内容 // 返回code // 返回信息
        suc(resObj);
      });
  }

  /**
   * 获取静态文件夹JSON数据请求方法
   * @param url 请求URL地址
   */
  public getJson(url: string, suc: Function): any {
    const that = this;
    this.http
      .get(url)
      .timeout(10000)
      .toPromise()
      .then((res: Response) => {
        console.error(res);
        let body = res["_body"];
        // console.log("接口返回成功信息：" + body);
        if (body) {
          // 有数据返回
          const resObj = {
            data: res.json() || {},
            // code: res.json().code === 0 ? 0 : res.json().code || {},
            message: res.json().message || "",
            // statusText: res.statusText,
            // status: res.status,
            success: true
          }; // 返回内容 // 返回code // 返回信息
          console.log(
            "%c %s %o",
            "color:#009803;",
            "=====GET返回信息=====：" +
              moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
              " ",
            this.jsUtil.deepClone(resObj)
          );
          suc(resObj);
        } else {
          // 无数据返回
          const resObj = {
            data: res.json() || {},
            // code: res.json().code === 0 ? 0 : res.json().code || {},
            message: res.json().message || "",
            // statusText: res.statusText,
            // status: res.status,
            success: true
          }; // 返回内容 // 返回code // 返回信息
          console.log(
            "%c %s %o",
            "color:#009803;",
            "=====GET返回信息=====：" +
              moment().format("YYYY-MM-DD HH:mm:ss:SSS") +
              " ",
            this.jsUtil.deepClone(resObj)
          );
          suc(resObj);
        }
      })
      .catch(error => {
        if (error.status == 400) {
          that.gloService.showMsg("请求参数正确时异常");
          console.log("请求参数正确");
        }
        if (error.status == 404) {
          that.gloService.showMsg("请检查路径是否正确");
          console.error("请检查路径是否正确");
        }
        if (error.status == 500) {
          that.gloService.showMsg("请求的服务器错误");
          console.error("请求的服务器错误");
        }
        console.log(error);
        // that.gloService.showMsg("服务器请求出错，请检查网络连接！");
        // 无数据返回
        const resObj = {
          data: {},
          // code: -1,
          message: "",
          // statusText: "服务器请求出错，请检查网络连接！",
          // status: -1,
          success: false
        }; // 返回内容 // 返回code // 返回信息
        suc(resObj);
      });
  }
}
