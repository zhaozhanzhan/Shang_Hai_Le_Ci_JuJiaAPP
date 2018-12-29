/**
 * name:数值默认0管道
 * describe:将null,undefined转换为0返回显示
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Pipe, PipeTransform } from "@angular/core";
import _ from "underscore";

@Pipe({
  name: "defaultNumState"
})
export class DefaultNumState implements PipeTransform {
  constructor() {}
  transform(value: any) {
    let num: number = 0;
    // console.error("!_.isNull(value)", !_.isNull(value));
    // console.error("!_.isUndefined(value)", !_.isUndefined(value));
    // console.error('value === ""', value === "");
    if (_.isNull(value) || _.isUndefined(value) || value === "") {
      return num;
    } else {
      return value;
    }
  }
}
