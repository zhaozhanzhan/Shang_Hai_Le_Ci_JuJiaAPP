/**
 * name:JS数据处理服务工具类
 * describe:对数据进入处理的方法工具类
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core"; // 注入服务注解
import moment from "moment"; // 时间格式化插件
import _ from "underscore";

@Injectable()
export class JsUtilsService {
  constructor() {}

  /**
   * 将对象转换为'&'和'='拼接的URL字符串
   * @param  {Object} obj 要转换的对象
   * @return {String} 返回转换后的字符串
   */
  public queryStr(obj: any): string {
    if (!obj) return "";
    let pairs = [];
    for (let key in obj) {
      let value = obj[key];
      if (value instanceof Array) {
        for (let i = 0; i < value.length; ++i) {
          pairs.push(
            encodeURIComponent(key + "[" + i + "]") +
              "=" +
              encodeURIComponent(value[i])
          );
        }
        continue;
      }
      pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
    }
    return pairs.join("&");
  }

  /**
   * 深度拷贝对象
   * @param {any} obj 要拷贝的对象或数组
   * @return {any} 返回新的对象或数组
   * @memberof JsUtilsService
   */
  public deepClone(obj: any): any {
    let copy;

    if (null == obj || "object" != typeof obj) return obj;

    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepClone(obj[i]);
      }
      return copy;
    }

    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.deepClone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  /**
   * 格式化时间
   * @param {*} date 要格式化的日期
   * @param {string} formatStr 格式化后的日期形式
   * @returns {string} 返回格式化之后的日期
   * @memberof JsUtilsService
   */
  public dateFormat(date: any, formatStr?: string): string {
    formatStr = formatStr || "YYYY-MM-DD";
    const result = moment(date).format(formatStr);
    if (result == "Invalid date") {
      return "";
    }
    return result;
  }

  /**
   * 去除字符串中空格
   * @param {any} str 要转换的字符串
   * @param {string} pos 要去除空格的位置,默认为所有空格 all 所有空格 both 两端空格 left 左侧空格 right 右侧空格
   * @returns {string}
   * @memberof JsUtilsService
   */
  public trim(str: any, pos?: string): string {
    let resStr = "";
    if (_.isNumber(str)) {
      str = str.toString();
    }

    if (_.isString(str)) {
      if (pos == "all") {
        resStr = str.replace(/\s+/g, "");
      } else if (pos == "both") {
        resStr = str.replace(/^\s+|\s+$/g, "");
      } else if (pos == "left") {
        resStr = str.replace(/^\s*/, "");
      } else if (pos == "right") {
        resStr = str.replace(/(\s*$)/g, "");
      } else {
        resStr = str.replace(/\s+/g, "");
      }
    }

    return resStr;
  }
}
