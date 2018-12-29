/**
 * name:护工服务时长通知
 * describe:护工服务超出最大时长时通知护工关闭服务
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core";
import { Events, Platform } from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio"; // 音频播放
import { LocalNotifications } from "@ionic-native/local-notifications"; // 本地通知
import { Vibration } from "@ionic-native/vibration"; // 震动插件
import { GlobalService } from "./GlobalService";
import _ from "underscore";

@Injectable()
export class ServiceNotification {
  public isTimingOpen: any = false; // 设置定时服务是否已经开启
  public bTime: any = null; // 服务开始时间
  public eTime: any = null; // 服务应结束时间
  public maxTime: any = null; // 服务最大提醒时间，未结束则服务异常
  public nowTime: any = null; // 服务开启后当前时间
  public manyMin: any = 1; // 服务开启多少分钟后可以结束服务
  public xMin: any = 1; // 服务超出应结束时间时每隔多少分钟提醒一次
  public yRemind: any = 3; // 总共提醒y次
  public remindArr: any = []; // 提醒对象数组
  public longTime: any = "00:00:00"; // 时长
  public hours: any = "00"; // 时
  public minutes: any = "00"; // 分
  public seconds: any = "00"; // 秒
  public timerInter: any = null; // 定时器
  public nfcNo: any = null; // NFC标签
  public workId: any = null; // 服务ID

  constructor(
    public plt: Platform,
    public nativeAudio: NativeAudio, // 音频播放
    public localNotif: LocalNotifications, // 本地通知
    public vibration: Vibration, // 震动插件
    public events: Events, // 事件发布与订阅
    public gloService: GlobalService // 全局自定义服务
  ) {
    console.error("===============ServiceNotification=====================");
    // this.initSerNotif(); // 初始化服务通知
  }

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

  /**
   * 设置服务开启多少分钟后可以结束服务
   * @param {number} manyMin
   * @memberof ServiceNotification
   */
  public setManyMin(manyMin: number) {
    this.manyMin = manyMin;
  }

  /**
   * 获取服务开启多少分钟后可以结束服务
   * @returns {number}
   * @memberof ServiceNotification
   */
  public getManyMin(): number {
    return this.manyMin;
  }

  /**
   * 设置服务开启后每隔多少分钟提醒一次
   * @param {number} manyMin
   * @memberof ServiceNotification
   */
  public setXMin(xMin: number) {
    this.xMin = xMin;
  }

  /**
   * 获取服务开启后每隔多少分钟提醒一次
   * @returns {number}
   * @memberof ServiceNotification
   */
  public getXMin(): number {
    return this.xMin;
  }

  /**
   * 设置NFC标签
   * @param {number} manyMin
   * @memberof ServiceNotification
   */
  public setNfcNo(nfcNo: string) {
    this.nfcNo = nfcNo;
  }

  /**
   * 获取NFC标签
   * @returns {number}
   * @memberof ServiceNotification
   */
  public getNfcNo(): string {
    return this.nfcNo;
  }

  /**
   * 设置服务ID
   * @param {number} manyMin
   * @memberof ServiceNotification
   */
  public setWorkId(workId: string) {
    this.workId = workId;
  }

  /**
   * 获取服务ID
   * @returns {number}
   * @memberof ServiceNotification
   */
  public getWorkId(): string {
    return this.workId;
  }

  /**
   * 初始化服务通知
   * @memberof ServiceNotification
   */
  public initSerNotif() {
    if (!(this.plt.is("ios") || this.plt.is("android"))) {
      return;
    }
    this.nativeAudio.preloadSimple("overtime", "assets/wav/overtime4.mp3").then(
      suc => {
        console.error("overtime音频文件预加载成功！", suc);
      },
      err => {
        console.error("overtime音频文件预加载失败！", err);
      }
    );
  }

  /**
   * 将开始时间转换为时间戳
   * @param {*} bTime 开始时间
   * @returns {number} 返回转换是否成功的状态
   * @memberof ServiceNotification
   */
  public bTimeStamp(bTime: any): boolean {
    const bTimeStr = new Date(bTime).toString();
    if (bTimeStr == "Invalid Date") {
      this.gloService.showMsg("开始时间格式不正确");
      return false;
    } else {
      this.bTime = new Date(bTime).getTime();
      return true;
    }
  }

  /**
   * 计算各种所需要的时间戳
   * @memberof ServiceNotification
   */
  public calTimeStamp() {
    this.eTime = this.bTime + this.manyMin * 60 * 1000; // 服务可结束的时间
    this.maxTime = this.eTime + this.xMin * this.yRemind * 60 * 1000; // 服务最大提醒时间，未结束则服务异常
    this.nowTime = new Date().getTime(); // 系统当前时间时间戳
    console.error(
      "eTime,maxTime,nowTime",
      this.eTime,
      this.maxTime,
      this.nowTime
    );
  }

  /**
   * 获取提醒对象数组
   * @memberof ServiceNotification
   */
  public getRemindArr() {
    if (_.isArray(this.remindArr) && this.remindArr.length > 0) {
      return;
    } else {
      this.remindArr = [];
      const remindObj: any = {};
      remindObj.timeStamp = this.eTime; // 在时间到达时的第一次提醒
      remindObj.state = false; // 提醒状态，是否已经提醒过
      this.remindArr.push(remindObj);
      for (let i = 1; i <= this.yRemind; i++) {
        const remObj: any = {};
        remObj.timeStamp = this.eTime + i * this.xMin * 60 * 1000; // 提醒时间点时间戳
        remObj.state = false; // 提醒状态，是否已经提醒过
        this.remindArr.push(remObj);
      }
      console.error("this.remindArr", this.remindArr);
    }
  }

  /**
   * 获取时分秒并回调
   * @param {Function} callback 回调时间对象
   * @memberof ServiceNotification
   */
  public getHms(callback: Function) {
    const timeObj: any = {
      hours: "00",
      minutes: "00",
      seconds: "00"
    };
    if (this.bTime - this.nowTime > 10000) {
      this.gloService.showMsg("开始时间不能大于结束时间");
      callback(timeObj);
      return;
    }
    const timeVal: any = this.nowTime - this.bTime;
    if (_.isNumber(parseInt(timeVal)) && parseInt(timeVal) >= 0) {
      timeObj.hours = Math.floor((timeVal / (1000 * 60 * 60)) % 24);
      timeObj.minutes = Math.floor((timeVal / (1000 * 60)) % 60);
      timeObj.seconds = Math.floor((timeVal / 1000) % 60);
      this.hours = timeObj.hours;
      this.minutes = timeObj.minutes;
      this.seconds = timeObj.seconds;
      callback(timeObj);
      return;
    } else {
      console.error("获取起始时间失败！");
      callback(timeObj);
      return;
    }
  }

  /**
   * 开启计时
   * @param {Function} callback
   * @memberof ServiceNotification
   */
  public startWatch(callback: Function) {
    const timeObj: any = {
      hours: "00",
      minutes: "00",
      seconds: "00"
    };
    setInterval(() => {
      let hours: any = parseInt(this.hours);
      let minutes: any = parseInt(this.minutes);
      let seconds: any = parseInt(this.seconds);
      if (seconds < 59) {
        seconds += 1;
      } else {
        seconds = 0;
        if (minutes < 59) {
          minutes += 1;
        } else {
          minutes = 0;
          hours += 1;
        }
      }
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      timeObj.hours = hours;
      timeObj.minutes = minutes;
      timeObj.seconds = seconds;
      console.error(timeObj);
      callback(timeObj);
    }, 1000);
  }

  /**
   * 声音与震动
   * @memberof ServiceNotification
   */
  public voiceVibrate() {
    // this.nativeAudio.play("overtime").then(
    //   res => {
    //     console.error("调用overtime音频成功！", res);
    //   },
    //   err => {
    //     console.error("调用overtime音频失败！", err);
    //   }
    // );
    this.localNotif.schedule({
      id: 1,
      title: "居家APP",
      text: "服务时间已到达，可关闭服务！",
      sound: "file://assets/wav/overtime4.mp3"
    });
    this.vibration.vibrate([2000, 1000, 2000, 1000, 2000]); // 震动手机
    // this.events.publish("jpush.receiveNotification");
  }

  /**
   * 开启定时服务
   * @memberof ServiceNotification
   */
  public openServer() {
    if (this.isTimingOpen) {
      console.error("定时服务已经开启！");
      return;
    }
    let timePoint: any = null; // 当前时间处于哪一段
    for (let i = 0; i < this.remindArr.length; i++) {
      if (this.nowTime > this.remindArr[i]["timeStamp"]) {
        timePoint = i;
        // console.error("在范围内！" + " " + i);
      } else {
        // console.error("不在时间段范围内！" + " " + i);
      }
    }
    // console.error("timePoint", timePoint);

    if (timePoint == this.remindArr.length - 1) {
      // 已经超出最大超时时间，直接结束服务
      // console.error("当前时间大于最大超出时间，直接结束服务");
      console.error("结束服务。。。");
      this.remindArr = [];
      this.isTimingOpen = false; // 服务已关闭
      this.publishExcEvent(); // 服务异常，关闭服务并调用接口
      return;
    }

    window.clearInterval(this.timerInter); // 清除定时器
    console.error("页面已经重载。。。");
    this.timerInter = setInterval(() => {
      // console.error("定时服务正在运行中。。。");
      console.error("正在统计服务时间");
      this.nowTime = new Date().getTime(); // 系统当前时间时间戳
      if (this.nowTime < this.eTime) {
        // 现在时间小于服务应该结束时间
        this.isTimingOpen = false; // 服务未开启
        // window.clearInterval(this.timerInter); // 清除定时器
      } else {
        // 现在时间大于等于服务应该结束时间
        this.isTimingOpen = true; // 服务已开启
        if (
          this.remindArr.length > 1 &&
          this.nowTime > this.remindArr[this.remindArr.length - 1]["timeStamp"]
        ) {
          // 当前时间大于最大超出时间，直接结束服务
          // TODO: 发送结束服务事件
          // console.error("当前时间大于最大超出时间，直接结束服务");
          console.error("结束服务。。。");
          this.remindArr = [];
          this.isTimingOpen = false; // 服务已关闭
          console.error(this.timerInter);
          this.publishExcEvent(); // 服务异常，关闭服务并调用接口
          window.clearInterval(this.timerInter); // 清除定时器
          return;
        }

        for (let i = 0; i < this.remindArr.length; i++) {
          if (this.nowTime > this.remindArr[i]["timeStamp"]) {
            timePoint = i;
            // console.error("在范围内！" + " " + i);
            // break;
          } else {
            // if (timePoint == this.remindArr.length - 1) {
            //   // 已经超出最大超时时间，直接结束服务
            //   console.error("当前时间大于最大超出时间，直接结束服务");
            //   this.isTimingOpen = false; // 服务已关闭
            //   return;
            // }
          }
        }

        for (let i = 0; i < this.remindArr.length; i++) {
          if (
            this.nowTime > this.remindArr[i]["timeStamp"] &&
            this.remindArr[i]["state"] == false
          ) {
            this.remindArr[i]["state"] = true; // 改变当前时间状态为已提醒
            if (timePoint == i && i == this.remindArr.length - 1) {
              // 是最后一次
              // console.error("this.remindArr", this.remindArr);
              // console.error("发送通知第" + (i + 1) + "次！");
              console.error("发送通知第" + (i + 1) + "次！");
              console.error("结束服务。。。");
              this.voiceVibrate(); // 声音与震动
              this.remindArr = [];
              this.isTimingOpen = false; // 服务已关闭
              this.publishExcEvent(); // 服务异常，关闭服务并调用接口
              console.error(this.timerInter);
              window.clearInterval(this.timerInter); // 清除定时器
              return;
            } else {
              // 不是最后一次通知
              if (timePoint == i) {
                this.voiceVibrate(); // 声音与震动
                console.error("发送未过时通知！");
              } else {
                console.error("发送已过时通知！");
              }
              break;
              // console.error("当前时间大于最大超出时间，直接结束服务");
              // console.error("结束服务。。。");
            }
          }
        }
      }
    }, 1000);
  }

  /**
   * 关闭定时服务
   * @memberof ServiceNotification
   */
  public closeServer() {
    this.localNotif.clearAll();
    this.isTimingOpen = false; // 服务已关闭
    this.remindArr = [];
    console.error(this.timerInter);
    window.clearInterval(this.timerInter); // 清除定时器
  }

  /**
   * 发布服务异常事件
   * @memberof ServiceNotification
   */
  public publishExcEvent() {
    this.localNotif.clearAll();
    this.events.publish("serviceEndEvent", {
      nfcNo: this.nfcNo,
      workId: this.workId
    });
  }

  /**
   * 单击通知
   * @memberof ServiceNotification
   */
  public clickNotifi() {
    this.localNotif.on("click").subscribe(result => {
      this.events.publish("notifiClickEvent");
    });
  }
}
