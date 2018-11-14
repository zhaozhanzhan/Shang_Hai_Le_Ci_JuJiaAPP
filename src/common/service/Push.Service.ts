/**
 * name: 极光推送服务工具类
 * describe:APP端消息推送控制
 * www: https://www.jiguang.cn
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core"; // 注入服务注解
import { Platform, Events } from "ionic-angular";
import { NativeAudio } from "@ionic-native/native-audio"; // 音频播放
import { Vibration } from "@ionic-native/vibration"; // 震动插件

@Injectable()
export class PushService {
  constructor(
    public plt: Platform,
    public nativeAudio: NativeAudio, // 音频播放
    public vibration: Vibration, // 震动插件
    public events: Events // 事件发布与订阅
  ) {}

  public initJpush() {
    // 初始化极光推送服务
    if (!(this.plt.is("ios") || this.plt.is("android"))) {
      return;
    }

    if (window["plugins"] && window["plugins"].jPushPlugin) {
      window["plugins"].jPushPlugin.init(); //启动极光推送
      if (this.plt.is("ios")) {
        window["plugins"].jPushPlugin.setDebugMode(true); //调试模式
        window["plugins"].jPushPlugin.setDebugModeFromIos();
        window["plugins"].jPushPlugin.setApplicationIconBadgeNumber(0);
      } else {
        window["plugins"].jPushPlugin.setDebugMode(true);
      }
    }
    this.jPushAddEventListener(); //判断系统设置中是否允许当前应用推送
    this.nativeAudio.preloadSimple("order2", "assets/wav/order2.wav").then(
      suc => {
        console.error("音频文件预加载成功！", suc);
      },
      err => {
        console.error("音频文件预加载失败！", err);
      }
    );
  }

  private jPushAddEventListener() {
    if (window["plugins"] && window["plugins"].jPushPlugin) {
      //判断系统设置中是否允许当前应用推送
      window["plugins"].jPushPlugin.getUserNotificationSettings(result => {
        if (result == 0) {
          console.error("系统设置中已关闭应用推送");
        } else if (result > 0) {
          console.error("系统设置中打开了应用推送");
        }
      });
    }

    //点击通知进入应用程序时会触发的事件
    document.addEventListener(
      "jpush.openNotification",
      event => {
        let content = this.plt.is("ios") ? event["aps"].alert : event["alert"];
        console.error("jpush.openNotification：" + content);
        this.events.publish("jpush.openNotification");
      },
      false
    );

    //收到通知时会触发该事件
    document.addEventListener(
      "jpush.receiveNotification",
      event => {
        let content = this.plt.is("ios") ? event["aps"].alert : event["alert"];
        console.error("jpush.receiveNotification：" + content);
        if (content == "您有新的订单，请及时完成派送！") {
          this.nativeAudio.play("order2").then(
            res => {
              console.error("调用音频成功！", res);
            },
            err => {
              console.error("调用音频失败！", err);
            }
          );
          this.vibration.vibrate([2000, 1000, 2000]); // 震动手机
          this.events.publish("jpush.receiveNotification");
        } else if (content == "商户已取消订单，已无需派送！") {
          this.vibration.vibrate([2000, 1000, 2000]); // 震动手机
          this.events.publish("jpush.cancelOrderNotification");
        } else {
          this.vibration.vibrate([1000, 1000, 1000]); // 震动手机
        }
      },
      false
    );

    //收到自定义消息时触发这个事件
    document.addEventListener(
      "jpush.receiveMessage",
      event => {
        let message = this.plt.is("ios") ? event["content"] : event["message"];
        console.error("jpush.receiveMessage：" + message);
      },
      false
    );

    //设置标签/别名回调函数
    document.addEventListener(
      "jpush.setTagsWithAlias",
      event => {
        console.error("设置标签/别名回调函数", event);
        let result = "result code:" + event["resultCode"] + " ";
        result += "tags:" + event["tags"] + " ";
        result += "alias:" + event["alias"] + " ";
        console.error("设置标签/别名回调函数", result);
      },
      false
    );

    //JPush服务器会给客户端返回一个唯一的该设备的标识
    document.addEventListener(
      "jpush.receiveRegistrationId",
      function(event) {
        console.error("event['registrationId']：" + event["registrationId"]);
      },
      false
    );
  }

  /**
   * 设置标签 IOS或Android
   * @returns
   * @memberof PushService
   */
  public setTags() {
    if (!(this.plt.is("ios") || this.plt.is("android"))) {
      return;
    }
    let tags = this.plt.is("android") ? ["android"] : ["ios"];
    console.error("设置setTags:" + tags);
    if (window["plugins"] && window["plugins"].jPushPlugin) {
      // window["plugins"].jPushPlugin.setTags(tags);
      window["plugins"].jPushPlugin.setTags(
        { sequence: 1, tags: tags },
        result => {
          const sequence = result.sequence;
          const resTags = result.tags; // 数组类型
          console.error("JPushPlugin setTags result :sequence is " + sequence);
          console.error("JPushPlugin setTags result :alias is ", resTags);
        },
        error => {
          const sequence = error.sequence;
          const errorCode = error.code; // 数组类型
          console.error("JPushPlugin setTags error :sequence is " + sequence);
          console.error("JPushPlugin setTags error :errorCode is ", errorCode);
        }
      );
    }
  }

  /**
   * 设置别名,一个用户只有一个别名
   * @param {*} userId 用户ID
   * @returns
   * @memberof PushService
   */
  public setAlias(userId: any) {
    if (!(this.plt.is("ios") || this.plt.is("android"))) {
      return;
    }
    console.error("设置setAlias:" + userId);
    //ios设置setAlias有bug,值必须为string类型,不能是number类型
    if (window["plugins"] && window["plugins"].jPushPlugin) {
      // window["plugins"].jPushPlugin.setAlias("" + userId);
      window["plugins"].jPushPlugin.setAlias(
        { sequence: 1, alias: userId },
        result => {
          const sequence = result.sequence;
          const alias = result.alias;
          console.error("JPushPlugin setAlias result :sequence is " + sequence);
          console.error("JPushPlugin setAlias result :alias is " + alias);
        },
        error => {
          const sequence = error.sequence;
          const errorCode = error.code;
          console.error("JPushPlugin setAlias error :sequence is " + sequence);
          console.error(
            "JPushPlugin setAlias error :errorCode is " + errorCode
          );
        }
      );
    }
  }

  /**
   * 获取设备唯一标识RegistrationId
   * @memberof PushService
   */
  public getRegistrationId() {
    // 获取应用程序对应的RegistrationID,应用程序成功注册到JPush的服务器时才返回对应的值,否则返回空字符串
    if (window["plugins"] && window["plugins"].jPushPlugin) {
      // window["plugins"].jPushPlugin.setAlias("" + userId);
      window["plugins"].jPushPlugin.getRegistrationID(regId => {
        console.error("JPushPlugin:registrationID is " + regId);
      });
    }
  }
}
