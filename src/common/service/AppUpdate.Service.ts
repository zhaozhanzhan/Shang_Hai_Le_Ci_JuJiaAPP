/**
 * name:APP外壳更新服务
 * describe:APP需要更新外壳时使用
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core";
import { File } from "@ionic-native/file"; // 文件选择
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer"; // 文件上传
// import { FileOpener } from "@ionic-native/file-opener"; // 文件打开
import { AlertController, Platform, App } from "ionic-angular";
import { reqObj } from "../config/BaseConfig";
import { GlobalService } from "./GlobalService";
// import { FilePath } from "@ionic-native/file-path"; // 文件路径

declare let cordova: any;
declare let chcp: any;

@Injectable()
export class AppUpdateService {
  constructor(
    public app: App,
    public platform: Platform, // 判断平台
    public gloService: GlobalService, // 全局自定义服务
    public file: File, // 文件
    public transfer: FileTransfer, // 文件上传下载
    // private fileOpener: FileOpener, // 打开文件
    public alertCtrl: AlertController // private filePath: FilePath, // 文件路径
  ) {
    console.error("===============AppUpdateService=====================");
    console.error("this=======", this);
    // console.error("this.fileOpener=======", this.fileOpener);
    if (this.platform.is("android") || this.platform.is("ios")) {
      try {
        console.error("cordova=======", cordova);
      } catch (error) {
        console.error("==========未找到cordova=======");
      }
      try {
        console.error("chcp=======", chcp);
      } catch (error) {
        console.error("==========未找到chcp=======");
      }
      this.bindEvents();
    }
  }

  /**
   * 绑定更新所需的事件
   * @memberof AppUpdateService
   */
  public bindEvents() {
    // 订阅“ deviceready ”事件，以便知道何时可以调用Cordova模块
    document.addEventListener(
      "deviceready",
      () => {
        console.error("onDeviceReady");
      },
      false
    );

    // 当插件无法从服务器加载更新时发送,错误详细信息附加到事件中
    document.addEventListener(
      "chcp_updateLoadFailed",
      (eventData: any) => {
        console.error("chcp_updateLoadFailed");
        let error = eventData.detail.error;

        console.error(
          "123" +
            error.code +
            "," +
            chcp.error.APPLICATION_BUILD_VERSION_TOO_LOW
        );

        // 当检测出内核版本过小
        if (
          error &&
          error.code == chcp.error.APPLICATION_BUILD_VERSION_TOO_LOW
        ) {
          let dialogMessage = "有新的版本,请下载更新";

          let alert = this.alertCtrl.create({
            title: dialogMessage,
            message: "是否需要更新APP应用？",
            buttons: [
              {
                text: "取消",
                role: "cancel",
                handler: () => {
                  console.error("Cancel clicked");
                }
              },
              {
                text: "更新",
                handler: () => {
                  console.error("Update App");
                  if (this.platform.is("ios")) {
                    // IOS跳转更新
                    this.gloService.showMsg(
                      "更新功能正在开发中...",
                      null,
                      2000
                    );
                    // window.open(reqObj.iosUpdAppUrl); // or itms://
                  } else if (this.platform.is("android")) {
                    setTimeout(() => {
                      this.presentLoadingDefault(); // 安卓初始化下载任务
                    }, 500);
                  }
                }
              }
            ]
          });

          let rootNav = this.app.getRootNavs()[0]; // 获取根导航
          let ionicApp = rootNav._app._appRoot;
          let activePortal = ionicApp._overlayPortal.getActive();
          if (activePortal) {
          } else {
            alert.present();
          }
        }
      },
      false
    );

    // 当我们从服务器成功加载应用程序配置时发送,但没有新的可用
    document.addEventListener(
      "chcp_nothingToUpdate",
      eventData => {
        console.error("chcp_nothingToUpdate");
      },
      false
    );

    // 当插件即将开始在外部存储上安装捆绑内容时发送
    document.addEventListener(
      "chcp_beforeAssetsInstalledOnExternalStorage",
      eventData => {
        console.error("chcp_beforeAssetsInstalledOnExternalStorage");
      },
      false
    );

    // 当插件无法从外部存储上的bundle复制文件时发送,如果发生这种情况,插件将无法正常工作,当设备上没有足够的可用空间时可能会发生,错误详细信息附加到事件中
    document.addEventListener(
      "chcp_assetsInstallationError",
      eventData => {
        console.error("chcp_assetsInstallationError");
      },
      false
    );

    // 插件成功从外部存储上的bundle中复制Web项目文件时发送,您很可能只会将其用于调试目的
    document.addEventListener(
      "chcp_assetsInstalledOnExternalStorage",
      eventData => {
        console.error("chcp_assetsInstalledOnExternalStorage");
      },
      false
    );

    // 成功加载新版本并准备安装时发送
    document.addEventListener(
      "chcp_updateIsReadyToInstall",
      eventData => {
        console.error("chcp_updateIsReadyToInstall");
      },
      false
    );

    // 即将安装更新时发送
    document.addEventListener(
      "chcp_beforeInstall",
      eventData => {
        console.error("chcp_beforeInstall");
      },
      false
    );

    // 更新安装失败时发送,错误详细信息附加到事件中
    document.addEventListener(
      "chcp_updateInstallFailed",
      eventData => {
        console.error("chcp_updateInstallFailed");
      },
      false
    );

    // 成功安装更新后发送
    document.addEventListener(
      "chcp_updateInstalled",
      eventData => {
        console.error("chcp_updateInstalled");
      },
      false
    );

    // 无任何安装时发送,可能之前没有任何东西被加载
    document.addEventListener(
      "chcp_nothingToInstall",
      eventData => {
        console.error("chcp_nothingToInstall");
      },
      false
    );
  }

  // 用户确认对话框跳转到商店
  public userWentToStoreCallback() {}

  // 用户不想离开应用程序,选择稍后会更新
  public userDeclinedRedirectCallback() {}

  /**
   * 下载文件
   * @param {*} loading 显示下载进度
   * @memberof AppUpdateService
   */
  public downloadfile(loading: any) {
    console.error("downloadfile");
    //下载代码

    const fileTransfer: FileTransferObject = this.transfer.create();
    const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
    // createDir(path, dirName, replace) 在特定路径中创建新目录
    // path 文件路径
    // dirName 目录名称
    // replace 是否替换相同名称现在目录 如果存在现有目录且replace值为false,则promise将失败并返回错误
    this.file
      .createDir(fs, "updatePackage", true)
      .then((dir: any) => {
        console.error("create dir success" + JSON.stringify(dir));
        // {"isFile":false,"isDirectory":true,"name":"updatePackage","fullPath":"/updatePackage/","filesystem":"<FileSystem: sdcard>","nativeURL":"file:///storage/emulated/0/updatePackage/"}
        fileTransfer
          .download(reqObj.andUpdAppUrl, dir.nativeURL + "update.apk")
          .then(
            entry => {
              // 打开下载下来的APP
              // open(filePath, fileMIMEType)
              console.error(dir.nativeURL + "update.apk");
              try {
                console.error("cordova=======", cordova);
              } catch (error) {
                console.error("=======cordova未找到=======");
                return;
              }
              cordova["plugins"].fileOpener2.open(
                dir.nativeURL + "update.apk", //下载文件保存地址
                "application/vnd.android.package-archive",
                {
                  //以APK文件方式打开
                  error: (err: any) => {
                    this.gloService.showMsg("打开更新包失败", null, 2000);
                    console.error("打开失败err", err);
                  },
                  success: () => {
                    console.error("打开成功data");
                  }
                }
              );
            },
            error => {
              this.gloService.showMsg("下载失败", null, 2000);
              console.error("下载失败" + JSON.stringify(error));
            }
          );
      })
      .catch(err => {
        this.gloService.showMsg("保存安装包失败", null, 2000);
        console.error("create dir err" + err);
      });

    // 文件下载进度,注册每当传输新数据块时调用的侦听器
    let downNum: any = 0;
    fileTransfer.onProgress(progressEvent => {
      let downloadProgress = (
        (progressEvent.loaded / progressEvent.total) *
        100
      ).toFixed(2);
      // console.error("已下载:" + downloadProgress);
      downNum = parseFloat(downloadProgress);
      // loading.setContent("已下载:" + downloadProgress + "%");
      if (parseFloat(downloadProgress) > 99) {
        loading.dismiss();
      }
    });
    let timer: any = setInterval(() => {
      loading.setContent("已下载:" + downNum + "%");
      if (parseFloat(downNum) > 99) {
        window.clearInterval(timer);
      }
    }, 1000);
  }

  /**
   * 初始化下载任务
   * @memberof AppUpdateService
   */
  public presentLoadingDefault() {
    const loading = this.gloService.showLoading("已下载：0%");
    this.downloadfile(loading);
    // setTimeout(() => {
    //   loading.dismiss();
    // }, 5000);
  }
}
