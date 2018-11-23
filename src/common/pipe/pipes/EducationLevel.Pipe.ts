/**
 * name:文化程度状态管道
 * describe:将文化程度状态数值转换中文状态返回
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "educationLevelState"
})
export class EducationLevelPipe implements PipeTransform {
  constructor() {}
  transform(value: any) {
    let state: string = "";
    if (value == "1") {
      state = "小学";
    } else if (value == "2") {
      state = "初中";
    } else if (value == "3") {
      state = "高中";
    } else if (value == "4") {
      state = "中专";
    } else if (value == "5") {
      state = "大专";
    } else if (value == "6") {
      state = "本科";
    } else if (value == "7") {
      state = "硕士";
    } else if (value == "8") {
      state = "博士";
    } else if (value == "9") {
      state = "文盲或半文盲";
    }
    return state;
  }
}
