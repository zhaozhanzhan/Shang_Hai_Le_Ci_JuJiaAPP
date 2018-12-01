/**
 * name:护工服务时长通知
 * describe:护工服务超出最大时长时通知护工关闭服务
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core";
import { Events } from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio"; // 音频播放
import { Vibration } from "@ionic-native/vibration"; // 震动插件

@Injectable()
export class ServiceNotification {
  public isTimingOpen: any = false; // 设置定时服务是否已经开启

  constructor(
    public nativeAudio: NativeAudio, // 音频播放
    public vibration: Vibration, // 震动插件
    public events: Events // 事件发布与订阅
  ) {}

  /**
   * 设置定时服务的状态
   * @param {boolean} state 传递状态值
   * @memberof ServiceNotification
   */
  public setIsTimingOpen(state: boolean) {
    this.isTimingOpen = state;
  }

  /**
   * 获取定时服务的状态
   * @returns {boolean}
   * @memberof ServiceNotification
   */
  public getIsTimingOpen(): boolean {
    return this.isTimingOpen;
  }
}
