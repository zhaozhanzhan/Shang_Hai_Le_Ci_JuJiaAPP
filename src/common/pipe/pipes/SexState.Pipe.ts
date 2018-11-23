/**
 * name:性别状态管道
 * describe:将性别状态数值转换中文状态返回
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "sexState"
})
export class SexStatePipe implements PipeTransform {
  constructor() {}
  transform(value: any) {
    let state: string = "";
    if (value == "1") {
      state = "男";
    } else if (value == "2") {
      state = "女";
    }
    return state;
  }
}
