/**
 * name:表单较验服务工具类
 * describe:对响应式表单进行较验的方法工具类
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core"; // 注入服务注解
import { FormControl, ValidationErrors } from "@angular/forms";
import { RegexpConfig } from "./GlobalConfig";

@Injectable()
export class FormValidService {
  constructor() {}

  /**
   * 姓名输入验证
   * @static 静态方法
   * @param {FormControl} control // 要验证的值所属对象
   * @returns {(ValidationErrors | null)}
   * @memberof FormValidService
   */
  public static nameValid(control: FormControl): ValidationErrors | null {
    const nameReg = RegexpConfig.name; // 姓名正则
    const validResult = nameReg.test(control.value); // 验证结果
    return validResult ? null : { name: true };
  }

  /**
   * 手机号输入验证
   * @static 静态方法
   * @param {FormControl} control // 要验证的值所属对象
   * @returns {(ValidationErrors | null)}
   * @memberof FormValidService
   */
  public static mobileValid(control: FormControl): ValidationErrors | null {
    const mobileReg = RegexpConfig.mobile; // 手机号正则
    const validResult = mobileReg.test(control.value); // 验证结果
    return validResult ? null : { mobile: true };
  }

  /**
   * 固定电话输入验证
   * @static 静态方法
   * @param {FormControl} control // 要验证的值所属对象
   * @returns {(ValidationErrors | null)}
   * @memberof FormValidService
   */
  public static telephoneValid(control: FormControl): ValidationErrors | null {
    const telephoneReg = RegexpConfig.telephone; // 固定电话正则
    const validResult = telephoneReg.test(control.value); // 验证结果
    return validResult ? null : { telephone: true };
  }

  /**
   * 固定电话和手机号输入验证
   * @static 静态方法
   * @param {FormControl} control // 要验证的值所属对象
   * @returns {(ValidationErrors | null)}
   * @memberof FormValidService
   */
  public static phoneValid(control: FormControl): ValidationErrors | null {
    const phoneReg = RegexpConfig.phone; // 固定电话和手机号正则
    const validResult = phoneReg.test(control.value); // 验证结果
    return validResult ? null : { phone: true };
  }

  /**
   * 身份证号输入验证
   * @static 静态方法
   * @param {FormControl} control // 要验证的值所属对象
   * @returns {(ValidationErrors | null)}
   * @memberof FormValidService
   */
  public static idCardValid(control: FormControl): ValidationErrors | null {
    const idCardReg = RegexpConfig.idCard; // 身份证号正则
    const validResult = idCardReg.test(control.value); // 验证结果
    return validResult ? null : { idCard: true };
  }
}
