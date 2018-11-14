/**
 * name:订单状态管道
 * describe:将订单状态数值转换中文状态返回
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "orderState"
})
export class OrderStatePipe implements PipeTransform {
  constructor() {}
  transform(value: any) {
    let state: string = "";
    if (value == "0") {
      state = "待揽收";
    } else if (value == "1") {
      state = "到达驿站";
    } else if (value == "2") {
      state = "到达干线";
    } else if (value == "3") {
      state = "运输中";
    } else if (value == "4") {
      state = "到达收货点";
    } else if (value == "5") {
      state = "完成物流";
    } else if (value == "10") {
      state = "派单中";
    } else if (value == "11") {
      state = "待提货";
    }
    return state;
  }
}
