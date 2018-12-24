/**
 * name:全局方法类
 * describe:全局共用的方法工具类
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core"; // 注入服务注解
// import { Router, ActivatedRoute } from "@angular/router";
// import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import _ from "underscore"; // underscore工具类
import moment from "moment"; // 时间格式化插件

@Injectable()
export class GlobalMethod {
  constructor() {}

  /**
   * 全局路由跳转页面方法
   * @static 静态方法
   * @param {string} url 相对路由或绝对路径 ex:'info'或'../info'或'/nursingHome/medical'
   * @param {Router} router 全局路由对象
   * @param {ActivatedRoute} actRoute 当前路由对象
   * @param {*} [param] 要传递的参数信息
   * @memberof GlobalMethod
   */
  // public static changeRoute(
  //   url: string,
  //   router: Router,
  //   actRoute: ActivatedRoute,
  //   param?: any
  // ): void {
  //   if (param) {
  //     if (_.isObject(param)) {
  //       // 是对象
  //       if (!_.isEmpty(param)) {
  //         // 非空对象
  //         router.navigate([url, param], {
  //           relativeTo: actRoute
  //         });
  //       } else {
  //         // 空对象
  //         router.navigate([url], {
  //           relativeTo: actRoute
  //         });
  //       }
  //     } else if ((_.isString(param) && param.length > 0) || _.isNumber(param)) {
  //       // 非对象
  //       const paramObj: any = {};
  //       paramObj.paramVal = param;
  //       router.navigate([url, paramObj], {
  //         relativeTo: actRoute
  //       });
  //     }
  //   } else {
  //     router.navigate([url], {
  //       relativeTo: actRoute
  //     });
  //   }
  // }

  /**
   * 禁用整个表单对象
   * @static 静态方法
   * @param {FormGroup} formObj 传入要禁用的表单对象FormGroup
   * @memberof GlobalMethod
   */
  public static disableForm(formObj: FormGroup): void {
    const formCtrl = formObj.controls;
    for (const i in formCtrl) {
      formCtrl[i].disable();
    }
  }

  /**
   * 启用整个表单对象
   * @static 静态方法
   * @param {FormGroup} formObj 传入要启用的表单对象FormGroup
   * @memberof GlobalMethod
   */
  public static enableForm(formObj: FormGroup): void {
    const formCtrl = formObj.controls;
    for (const i in formCtrl) {
      formCtrl[i].enable();
    }
  }

  /**
   * 给表单对象赋值
   * @static 静态方法
   * @param {FormGroup} formObj 传入要赋值的表单对象
   * @param {Object} valObj 要赋的值对象
   * @memberof GlobalMethod
   */
  public static setForm(formObj: FormGroup, valObj: Object): void {
    formObj.patchValue(valObj);
  }

  /**
   * 计算数组的和
   * @static 静态方法
   * @param {*} calArr 传入要计算的数组
   * @returns 返回合计的值
   * @memberof GlobalMethod
   */
  public static arrSum(calArr: Array<any>) {
    if (!_.isArray(calArr)) {
      return;
    }
    let totalNum = 0;
    calArr.forEach(curVal => {
      const convert = parseFloat(curVal);
      if (_.isNumber(convert)) {
        totalNum += convert;
      }
    });
    return totalNum;
  }

  /**
   * 根据文件扩展名获取文件MimeType类型
   * @static 静态方法
   * @param {string} fileType ex:txt、docx、doc、pptx、ppt、zip、jpg、png等
   * @returns {string}
   * @memberof GlobalMethod
   */
  public static getFileMimeType(fileType: string): string {
    let mimeType: string = "";
    switch (fileType) {
      case "txt":
        mimeType = "text/plain";
        break;
      case "docx":
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case "doc":
        mimeType = "application/msword";
        break;
      case "pptx":
        mimeType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        break;
      case "ppt":
        mimeType = "application/vnd.ms-powerpoint";
        break;
      case "xlsx":
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
      case "xls":
        mimeType = "application/vnd.ms-excel";
        break;
      case "zip":
        mimeType = "application/x-zip-compressed";
        break;
      case "rar":
        mimeType = "application/octet-stream";
        break;
      case "pdf":
        mimeType = "application/pdf";
        break;
      case "jpg":
        mimeType = "image/jpeg";
        break;
      case "png":
        mimeType = "image/png";
        break;
      default:
        mimeType = "application/" + fileType;
        break;
    }
    return mimeType;
  }

  /**
   * 截取文件路径
   * @static 静态方法
   * @param {string} fullFilePath 完整的文件路径及文件名、扩展名
   * @returns {string} 返回文件路径，不包括文件名、扩展名
   * @memberof GlobalMethod
   */
  public static getFilePath(fullFilePath: string): string {
    let filePath = "";
    if (_.isString(fullFilePath) && fullFilePath.length > 0) {
      // substr 方法可在字符串中抽取从开始下标开始的指定数目的字符
      filePath = fullFilePath.substr(0, fullFilePath.lastIndexOf("/") + 1);
    }
    return filePath;
  }

  /**
   * 截取文件名和文件类型
   * @static 静态方法
   * @param {string} fullFilePath 完整的文件路径及文件名、扩展名
   * @returns {string} 返回文件名和文件类型,包括扩展名
   * @memberof GlobalMethod
   */
  public static getFileNameAndType(fullFilePath: string): string {
    let fileNameAndType = "";
    if (_.isString(fullFilePath) && fullFilePath.length > 0) {
      // substr 方法可在字符串中抽取从开始下标开始的指定数目的字符
      const fileNameTime = fullFilePath.substr(
        fullFilePath.lastIndexOf("/") + 1
      );
      const fileArr = fileNameTime.split("?");
      fileNameAndType = fileArr[0];
    }
    return fileNameAndType;
  }

  /**
   * 截取文件名称
   * @static 静态方法
   * @param {string} fullFilePath 完整的文件路径及文件名、扩展名
   * @returns {string} 返回文件名,不包括扩展名
   * @memberof GlobalMethod
   */
  public static getFileName(fullFilePath: string): string {
    let fileName = "";
    if (_.isString(fullFilePath) && fullFilePath.length > 0) {
      // substr 方法可在字符串中抽取从开始下标开始的指定数目的字符
      const fileNameTime = fullFilePath.substr(
        fullFilePath.lastIndexOf("/") + 1
      );
      const fileArr = fileNameTime.split(".");
      fileName = fileArr[0];
    }
    return fileName;
  }

  /**
   * 截取文件类型
   * @static 静态方法 完整的文件路径及文件名、扩展名
   * @param {string} fullFilePath
   * @returns {string} 返回文件扩展名
   * @memberof GlobalMethod
   */
  public static getFileType(fullFilePath: string): string {
    let fileType = "";
    if (_.isString(fullFilePath) && fullFilePath.length > 0) {
      // substr 方法可在字符串中抽取从开始下标开始的指定数目的字符
      const fileTypeTime = fullFilePath.substr(
        fullFilePath.lastIndexOf(".") + 1
      );
      const fileArr = fileTypeTime.split("?");
      fileType = fileArr[0];
    }
    return fileType;
  }

  /**
   * 移除路径前"file://" 字符串
   * @static 静态方法
   * @param {string} path 要转换的路径
   * @memberof GlobalMethod
   */
  public static rmFileStr(path: string) {
    return path.replace(/^file:\/\//, "");
  }

  /**
   * 手机键盘遮住输入框处理
   * @static 静态方法
   * @param {any} content 页面Content元素
   * @memberof GlobalMethod
   */
  public static keyboardHandle(content: any) {
    let contentTop = null;
    window.addEventListener("keyboardDidShow", event => {
      // console.error("event", event);
      // console.error("this.content：", content);
      contentTop = content.contentTop;
      content.scrollTo(0, event["keyboardHeight"] / 3);
    });
    window.addEventListener("keyboardWillHide", event => {
      content.scrollTo(0, contentTop);
    });
  }

  /**
   * 计算总页数
   * @static 静态方法
   * @param {number} totalItem 总条数
   * @param {number} everyItem 每页条数
   * @returns 因为全局页码从0开始,所以总页数减1
   * @memberof GlobalMethod
   */
  public static calTotalPage(totalItem: number, everyItem: number) {
    let totalPage = 0;
    if (!_.isNumber(totalItem)) {
      return totalPage;
    }
    if (!_.isNumber(everyItem) || everyItem <= 0) {
      return totalPage;
    }
    totalPage = Math.ceil(totalItem / everyItem); // 因为全局页码从0开始,所以总页数减1
    return totalPage;
  }

  /**
   * 获取当前月的开始结束时间
   * @static
   * @param {boolean} isTime 设置是否包含时间 true [2018-12-01 00:00:00,2018-12-31 23:59:59] | false [2018-12-01,2018-12-31] 默认为false
   * @returns 返回数组
   * @memberof GlobalMethod
   */
  public static getCurrMonthDays(isTime?: boolean) {
    const date = [];
    let start =
      moment()
        .add("month", 0)
        .format("YYYY-MM") + "-01";
    let end = moment(start)
      .add("month", 1)
      .add("days", -1)
      .format("YYYY-MM-DD");
    if (isTime) {
      start += " 00:00:00";
      end += " 23:59:59";
    }
    date.push(start);
    date.push(end);
    return date;
  }
}
