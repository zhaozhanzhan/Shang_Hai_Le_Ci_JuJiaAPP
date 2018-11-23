/**
 * name:政治面貌状态管道
 * describe:将政治面貌状态数值转换中文状态返回
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "politicalState"
})
export class PoliticalStatePipe implements PipeTransform {
  constructor() {}
  transform(value: any) {
    let state: string = "";
    if (value == "1") {
      state = "中共党员";
    } else if (value == "2") {
      state = "共青团员";
    } else if (value == "3") {
      state = "群众";
    }
    return state;
  }
}
