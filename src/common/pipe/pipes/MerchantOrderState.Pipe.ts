/**
 * name:商户订单状态管道
 * describe:将商户订单状态数值转换中文状态返回
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "merchantOrderState"
})
export class MerchantOrderStatePipe implements PipeTransform {
  constructor() {}
  transform(value: any) {
    let state: string = "";
    if (value == "0") {
      state = "待接包";
    } else if (value == "1") {
      state = "已接包";
    } else if (value == "2") {
      state = "已拼包";
    } else if (value == "3") {
      state = "已完成";
    } else if (value == "-1") {
      state = "商户取消";
    }
    return state;
  }
}
