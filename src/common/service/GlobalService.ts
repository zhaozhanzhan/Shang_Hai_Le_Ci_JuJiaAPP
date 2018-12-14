/**
 * name:全局服务类
 * describe:全局共用的方法服务类
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core"; // 注入服务注解
import {
  ToastController,
  LoadingController,
  AlertController
} from "ionic-angular"; // Ionic Toast消息控制器
import { File } from "@ionic-native/file";
import { GlobalMethod } from "./GlobalMethod";
import _ from "underscore"; // underscore工具类
@Injectable()
export class GlobalService {
  constructor(
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public file: File, // 文件
    public alertCtrl: AlertController // Alert消息弹出框
  ) {}

  /**
   * 显示延时提示信息
   * @param {*} [msg] 要显示的消息内容
   * @param {*} [pos] 要显示的消息位置 默认底部 top顶部  middle中间  bottom底部
   * @param {*} [time] 要显示多长时间 默认2秒
   * @param {*} [fun] 关闭之后要执行的方法
   * @returns {any} 返回Toast对象可调用 dismiss()方法关闭
   * @memberof GlobalService
   */
  public showMsg(msg?: string, pos?: string, time?: any, fun?: Function): any {
    if (!msg) {
      msg = "请求数据出错！";
    }
    if (_.isNaN(parseFloat(time)) || !_.isNumber(parseFloat(time))) {
      time = 3000;
    }
    if (!pos) {
      pos = "middle";
    }

    let toast = this.toastCtrl.create({
      message: msg,
      duration: parseFloat(time),
      position: pos
    });

    toast.onDidDismiss(() => {
      if (_.isFunction(fun)) {
        fun();
      }
    });
    toast.present();
    return toast;
    // if (parseFloat(time) >= 5000) {
    //   return toast;
    // }
  }

  /**
   * 显示加载提示信息
   * @param {*} [msg] 要显示的消息内容
   * @param {*} [time] 要显示多长时间,默认永久
   * @param {*} [fun] 关闭之后要执行的方法
   * @param {*} [showBackdrop] 是否显示遮罩 默认为true
   * @param {*} [enableBackdropDismiss] 启用点击遮罩关闭 默认为false
   * @param {*} [dismissOnPageChange] 在页面更改期间是否继续显示,默认为false,设置为true可在页面关闭后取消显示
   * @returns {any} 返回Loading对象可调用 dismiss()方法关闭
   * @memberof GlobalService
   */
  public showLoading(
    msg?: string,
    time?: any,
    fun?: Function,
    showBackdrop?: boolean,
    enableBackdropDismiss?: boolean,
    dismissOnPageChange?: boolean
  ): any {
    if (!msg) {
      msg = "正在请求数据，请稍候...";
    }

    if (!_.isBoolean(showBackdrop)) {
      // 判断有无传值
      showBackdrop = true;
    }
    if (!_.isBoolean(enableBackdropDismiss)) {
      // 判断有无传值
      enableBackdropDismiss = false;
    }
    if (!_.isBoolean(dismissOnPageChange)) {
      // 判断有无传值
      dismissOnPageChange = false;
    }

    let loading = this.loadingCtrl.create({
      content: msg,
      duration: time,
      showBackdrop: showBackdrop,
      enableBackdropDismiss: enableBackdropDismiss,
      dismissOnPageChange: dismissOnPageChange
    });

    loading.onDidDismiss(() => {
      if (_.isFunction(fun)) {
        fun();
      }
    });
    loading.present();
    return loading;
    // if (_.isNaN(parseFloat(time)) || !_.isNumber(parseFloat(time))) {
    //   return loading;
    // }
  }

  /**
   * 将文件读取为Blob格式
   * @param {string} fullFilePath 系统文件路径
   * @param {string} fileType ex:txt、docx、doc、pptx、ppt、zip、jpg、png等
   * @returns {any}
   * @memberof GlobalService
   */
  public fileConvertBlob(fullFilePath: string, fileType: string): any {
    return this.file.resolveLocalFilesystemUrl(fullFilePath).then(entry => {
      let path = entry.toURL();
      let index = path.indexOf(entry.name);
      path = path.substring(0, index - 1);
      return this.file.readAsArrayBuffer(path, entry.name).then(buffer => {
        let fileBlob = new Blob([buffer], {
          type: GlobalMethod.getFileMimeType(fileType)
        });
        return { blob: fileBlob, name: entry.name };
      });
    });
  }

  /**
   * 删除提示弹出框
   * @param {*} delFun 传入要执行的删除方法以及删除完成的回调操作
   * @param {*} cancel 传入要执行的删除方法以及删除完成的回调操作
   * @memberof GlobalService
   */
  public delAlert(delFun: any, cancelFun?: any) {
    let alert = this.alertCtrl.create({
      title: "提示",
      message: "确认删除该条数据？",
      buttons: [
        {
          text: "取消",
          role: "cancel",
          handler: cancelFun
            ? cancelFun
            : () => {
                console.error("取消");
              }
        },
        {
          text: "删除",
          handler: delFun
        }
      ]
    });
    alert.present();
  }
}
