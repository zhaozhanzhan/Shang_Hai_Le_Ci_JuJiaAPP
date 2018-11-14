/**
 * name:浏览器本地存储
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
export class Local {
  public static localStorage: any = localStorage;

  constructor() {}

  /**
   * 存储字符串
   * @static 静态方法
   * @param {string} key 存储名称
   * @param {string} value 存储值
   * @memberof Local
   */
  public static set(key: string, value: string): void {
    this.localStorage[key] = value;
  }

  /**
   * 获取字符串
   * @static 静态方法
   * @param {string} key 获取名称
   * @returns {string} 返回获取到的值
   * @memberof Local
   */
  public static get(key: string): string {
    return this.localStorage[key] || "";
  }

  /**
   * 存储对象
   * @static 静态方法
   * @param {string} key 存储名称
   * @param {*} value 存储值
   * @memberof Local
   */
  public static setObj(key: string, value: any): void {
    this.localStorage[key] = JSON.stringify(value);
  }

  /**
   * 获取对象
   * @static 静态方法
   * @param {string} key 获取名称
   * @returns {*} 返回获取到的对象
   * @memberof Local
   */
  public static getObj(key: string): any {
    return JSON.parse(this.localStorage[key] || "{}");
  }

  /**
   * 删除值
   * @static 静态方法
   * @param {string} key 删除名称
   * @memberof Local
   */
  public static remove(key: string): any {
    this.localStorage.removeItem(key);
  }
}

export class Session {
  public static sessionStorage: any = sessionStorage;

  constructor() {}

  /**
   * 存储字符串
   * @static 静态方法
   * @param {string} key 存储名称
   * @param {string} value 存储值
   * @memberof Session
   */
  public static set(key: string, value: string): void {
    this.sessionStorage[key] = value;
  }

  /**
   * 获取字符串
   * @static 静态方法
   * @param {string} key 获取名称
   * @returns {string} 返回获取到的值
   * @memberof Session
   */
  public static get(key: string): string {
    return this.sessionStorage[key] || "";
  }

  /**
   * 存储对象
   * @static 静态方法
   * @param {string} key 存储名称
   * @param {*} value 存储值
   * @memberof Session
   */
  public static setObj(key: string, value: any): void {
    this.sessionStorage[key] = JSON.stringify(value);
  }

  /**
   * 获取对象
   * @static 静态方法
   * @param {string} key 获取名称
   * @returns {*} 返回获取到的对象
   * @memberof Local
   */
  public static getObj(key: string): any {
    return JSON.parse(this.sessionStorage[key] || "{}");
  }

  /**
   * 删除值
   * @static 静态方法
   * @param {string} key 删除名称
   * @memberof Session
   */
  public static remove(key: string): any {
    this.sessionStorage.removeItem(key);
  }
}
