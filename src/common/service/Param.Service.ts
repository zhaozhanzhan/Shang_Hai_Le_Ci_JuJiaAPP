/**
 * name:全局参数传递服务
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
export class ParamService {
  public static _scopeObj = null; // 定义scope对象
  public static _paramStr = null; // 定义参数字符串
  public static _paramObj = null; // 定义参数对象
  public static _paramId = null; // 定义参数ID
  public static _paramNfc = null; // 定义参数NFC
  public static _paramFun = null; // 定义函数
  constructor() {}

  public static setScopeObj(scopeObj) {
    //设置传递的scope对象
    this._scopeObj = scopeObj;
  }

  public static getScopeObj() {
    //获取传递的scope对象
    return this._scopeObj;
  }

  public static setParamStr(paramStr) {
    //设置传递的参数字符串
    this._paramStr = paramStr;
  }

  public static getParamStr() {
    //获取传递的参数字符串
    return this._paramStr;
  }

  public static setParamObj(paramObj) {
    //设置传递的参数对象
    this._paramObj = paramObj;
  }

  public static getParamObj() {
    //获取传递的参数对象
    return this._paramObj;
  }

  public static setParamId(paramId) {
    //设置传递的参数对象
    this._paramId = paramId;
  }

  public static getParamId() {
    //获取传递的参数对象
    return this._paramId;
  }
  
  public static setParamNfc(paramNfc) {
    //设置传递的参数NFC码
    this._paramNfc = paramNfc;
  }

  public static getParamNfc() {
    //获取传递的参数NFC码
    return this._paramNfc;
  }

  public static setParamFun(paramFun) {
    //设置传递的参数对象
    this._paramFun = paramFun;
  }

  public static getParamFun() {
    //获取传递的参数对象
    return this._paramFun;
  }
}
