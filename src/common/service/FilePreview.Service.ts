/**
 * name:文件预览服务
 * describe:对文件预览服务做统一处理
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/timeout";
import { GlobalService } from "./GlobalService";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Events, App, Platform, AlertController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { File } from "@ionic-native/file"; // 文件选择
import { AppAvailability } from "@ionic-native/app-availability"; // 检查用户设备安装了某应用程序
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { GlobalMethod } from "./GlobalMethod";
import _ from "underscore";

declare var cordova: any; //导入第三方的库定义到 TS 项目中
// import { JsUtilsService } from "./JsUtils.Service";
// import { reqObj, loginInfo } from "../config/BaseConfig";
// import moment from "moment"; // 时间格式化插件
// import _ from "underscore";

@Injectable()
export class FilePreviewService {
  public fileUrl: string = null; // 文件URL路径地址
  public localDirName: string = "pdfDir"; // pdf文件存储目录
  public pdfReadApp: string =
    "http://139.224.12.181:9527/JuJiaAppDownload/AdobeReader.apk";
  public appPkgName: string = "com.adobe.reader"; // PDF阅读器包名

  constructor(
    // private http: Http,
    // private jsUtil: JsUtilsService, // 全局自定义工具类
    private app: App,
    private http: Http,
    public platform: Platform, // 判断平台
    public androidPermissions: AndroidPermissions, // Android权限控制
    public gloService: GlobalService, // 全局自定义服务
    public events: Events, // 事件发布与订阅
    public iab: InAppBrowser, // 打开内置浏览器
    public alertCtrl: AlertController, // Alert消息弹出框
    private file: File, // 文件
    public transfer: FileTransfer, // 文件上传下载
    public appAva: AppAvailability, // 检查用户设备安装了某应用程序
    public openNativeSettings: OpenNativeSettings, // 系统设置
    public ionicStorage: Storage // IonicStorage
  ) {}

  /**
   * 设置文件URL地址
   * @param {string} fileUrl 文件URL路径地址
   * @memberof FilePreviewService
   */
  public setFileUrl(fileUrl: string) {
    this.fileUrl = fileUrl;
  }

  /**
   * 获取文件URL地址
   * @returns {string}
   * @memberof FilePreviewService
   */
  public getFileUrl(): string {
    return this.fileUrl;
  }

  /**
   * 打开内置浏览器
   * @memberof FilePreviewService
   */
  public openBrowser() {
    const browser = this.iab.create(this.fileUrl, "_self");
    browser.on("loadstop").subscribe(event => {
      // browser.insertCSS({ code: "body{color: red;" });
    });
    browser.on("loadstop").subscribe(event => {
      // setTimeout(() => {
      //   browser.close();
      // }, 3000);
      // browser.insertCSS({ code: "body{color: red;" });
    });
  }

  /**
   * 检查写入文件到设备权限
   * @memberof FilePreviewService
   */
  public checkPermission() {
    return new Promise((resolve, reject) => {
      if (this.platform.is("android")) {
        // 安卓6.0之后需要显示的去获取权限,否则会出现提示权限不足的问题
        // 安卓需要检测权限
        const andPermObj = this.androidPermissions; // 安卓权限对象
        const writeStoragePerm = andPermObj.PERMISSION.WRITE_EXTERNAL_STORAGE; // 存储文件权限
        andPermObj.checkPermission(writeStoragePerm).then(
          checkSuc => {
            const isPerm = checkSuc.hasPermission; // 是否有写入权限
            console.error("isPerm==========", isPerm);
            if (!isPerm) {
              // 没有权限
              this.gloService.showMsg("获取文件存储权限失败", null, 3000);
              andPermObj.requestPermission(writeStoragePerm).then(
                reqSuc => {
                  // 请求权限成功
                  console.error("请求权限成功", reqSuc);
                  resolve(reqSuc);
                },
                reqErr => {
                  // 请求权限失败
                  console.error("请求权限失败", reqErr);
                  try {
                    console.error("cordova=======", cordova);
                    this.openPermSetting(); // 权限设置提示弹了框
                  } catch (error) {
                    console.error("==========未找到cordova=======");
                    return;
                  }
                  reject(reqErr);
                }
              ); // 申请权限
            } else {
              console.error("请求权限成功");
              try {
                console.error("cordova=======", cordova);
              } catch (error) {
                console.error("==========未找到cordova=======");
                return;
              }
              // this.openPermSetting(); // 权限设置提示弹了框
              resolve();
            }
          },
          checkErr => {
            console.error("请求权限失败", checkErr);
            try {
              console.error("cordova=======", cordova);
            } catch (error) {
              console.error("==========未找到cordova=======");
              return;
            }
            this.openPermSetting(); // 权限设置提示弹了框
            reject(checkErr);
          }
        );
      } else if (this.platform.is("ios")) {
        // ios 无需检测权限,在xcode中配置好就行了
        resolve();
      }
    });
  }

  /**
   * 打开写入文件权限设置页面提示
   * @memberof MyApp
   */
  public openPermSetting() {
    const confirm = this.alertCtrl.create({
      title: "提示",
      message: "应用存储权限未开启！",
      buttons: [
        {
          text: "不开启",
          handler: () => {}
        },
        {
          text: "前往开启",
          handler: () => {
            this.openNativeSettings.open("application_details");
            // this.openNativeSettings.open("application_development");
            // this.openNativeSettings.open("application");
            // this.openNativeSettings.open("notification_id");
          }
        }
      ]
    });
    let rootNav = this.app.getRootNavs()[0]; // 获取根导航
    let ionicApp = rootNav._app._appRoot;
    let activePortal = ionicApp._overlayPortal.getActive();
    if (activePortal) {
    } else {
      confirm.present();
    }
  }

  /**
   * 创建文件存储目录
   * @returns
   * @memberof FilePreviewService
   */
  public creatLocalDir() {
    // applicationDirectory 安装应用程序的只读目录。
    // applicationStorageDirectory 安装应用程序的只读目录。
    // dataDirectory 在哪里放置特定于应用程序的数据文件。
    // cacheDirectory 应用程序重启后应该存在的缓存文件。应用程序不应该依赖操作系统来删除此处的文件。
    // externalApplicationStorageDirectory Android：外部存储上的应用程序空间。
    // externalDataDirectory Android：将特定于应用程序的数据文件放在外部存储上的位置。
    // externalCacheDirectory Android：外部存储上的应用程序缓存。
    // externalRootDirectory Android：外部存储（SD卡）根。
    // checkDir(path, dir) 检查某个路径目录中是否存在目录。
    // createDir(path, dirName, replace) 在特定路径中创建新目录。
    // removeDir(path, dirName) 删除给定路径上的目录
    // moveDir(path, dirName, newPath, newDirName) 将目录移动到给定路径。
    // copyDir(path, dirName, newPath, newDirName) 使用各种方法复制目录。如果目标目录存在，则无法复制。
    // listDir(path, dirName) 列出给定路径中的文件和目录。
    // removeRecursively(path, dirName) 从所需位置删除所有文件和目录。
    // checkFile(path, file) 检查某个路径，目录中是否存在文件。
    // createFile(path, fileName, replace) 在特定路径中创建新文件。
    // removeFile(path, fileName) 从所需位置删除文件。
    // writeFile(path, fileName, text, whether) 将新文件写入所需位置。
    // writeExistingFile(path, fileName, text) 写入现有文件。
    // readAsText(path, file) 以文本形式读取文件的内容。
    // readAsDataURL(path, file) 读取文件并将数据作为base64编码数据URL返回。数据网址的格式为：data：[] [; BASE64]
    // readAsBinaryString(path, file) 读取文件并将数据作为二进制数据返回。
    // readAsArrayBuffer(path, file) 读取文件并将数据作为ArrayBuffer返回。
    // moveFile(path, fileName, newPath, newFileName) 将文件移动到给定路径。
    // copyFile(path, fileName, newPath, newFileName) 使用各种方法复制文件。如果文件存在，将无法复制。
    // resolveLocalFilesystemUrl(fileUrl) 解析本地文件系统URL
    // resolveDirectoryUrl(directoryUrl) 解析本地目录URL
    // getDirectory(directoryEntry, directoryName, flags) 获取目录
    // getFile(directoryEntry, fileName, flags) 获取文件
    const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
    return new Promise((resolve, reject) => {
      // 先判断根路径上是否有某个名称文件夹
      // checkDir(path, dir) 检查某个路径目录中是否存在目录。
      this.file.checkDir(fs, this.localDirName).then(
        checkDirSuc => {
          // 检测成功，已有该目录，直接返回
          console.error("检测已有该目录", checkDirSuc);
          resolve(checkDirSuc);
        },
        checkDirErr => {
          // 检测失败，没有该目录，创建目录
          // createDir(path, dirName, replace) 在特定路径中创建新目录。
          console.error("检测没有该目录", checkDirErr);
          this.file.createDir(fs, this.localDirName, true).then(
            createDirSuc => {
              // 创建目录成功
              console.error("创建目录成功" + JSON.stringify(createDirSuc));
              resolve(createDirSuc);
            },
            createDirErr => {
              // 创建目录失败
              console.error("创建目录失败" + JSON.stringify(createDirErr));
              reject(createDirErr);
            }
          );
          // reject(checkDirErr);
        }
      );
    });
  }

  /**
   * 检查文件是否已有
   * @param {string} fileName 文件名
   * @memberof FilePreviewService
   */
  public checkIsHasFile(fileName: string) {
    console.error("fileName", fileName);
    const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
    return new Promise((resolve, reject) => {
      this.file.listDir(fs, this.localDirName).then(
        listDirSuc => {
          console.error("查看文件夹下文件成功", listDirSuc);

          if (_.isArray(listDirSuc) && listDirSuc.length > 0) {
            let isHasFile: boolean = false;

            for (let i = 0; i < listDirSuc.length; i++) {
              console.error(listDirSuc[i].hasOwnProperty("name"));
              console.error(listDirSuc[i]["name"]);
              console.error(fileName);
              if (
                listDirSuc[i].hasOwnProperty("name") &&
                listDirSuc[i]["name"] == fileName
              ) {
                isHasFile = true;
                break;
              }
            }

            console.error("=====isHasFile=====", isHasFile);
            if (isHasFile) {
              resolve(); // 已有文件并已经下载在本地
            } else {
              reject(); // 文件未下载在本地
            }
          } else {
            reject(); // 文件未下载在本地
          }
          // reject(); // 文件未下载在本地
          // return;
        },
        listDirErr => {
          reject(); // 文件未下载在本地
          console.error("查看文件夹下文件失败", listDirErr);
        }
      );
    });
  }

  /**
   * 检查服务器上是否有文件
   * @memberof FilePreviewService
   */
  public checkServerIsFile() {
    return new Promise((resolve, reject) => {
      this.http.get(this.fileUrl).subscribe(
        data => {
          resolve();
        },
        err => {
          if (err.status == 200) {
            resolve();
          } else {
            // 弹出alert告诉用户远程PDF不存在。
            reject();
          }
        }
      );
    });
  }

  /**
   * 下载需要查看的文档
   * @memberof FilePreviewService
   */
  public downloadFile() {
    const fileTransfer: FileTransferObject = this.transfer.create();
    const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
    return new Promise((resolve, reject) => {
      const loading = this.gloService.showLoading("已下载：0%");
      const fileNameAndType = GlobalMethod.getFileNameAndType(this.fileUrl); // 截取文件名和文件类型
      fileTransfer
        .download(this.fileUrl, fs + this.localDirName + "/" + fileNameAndType)
        .then(
          downloadSuc => {
            console.error("下载文件成功", downloadSuc);
            if (loading) {
              loading.dismiss();
            }
            resolve(downloadSuc);
          },
          downloadErr => {
            console.error("下载文件失败", downloadErr);
            if (loading) {
              loading.dismiss();
            }
            reject(downloadErr);
          }
        );
      // 文件下载进度,注册每当传输新数据块时调用的侦听器
      let downNum: any = 0;
      fileTransfer.onProgress(progressEvent => {
        let downloadProgress = (
          (progressEvent.loaded / progressEvent.total) *
          100
        ).toFixed(2);
        downNum = parseFloat(downloadProgress);
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
    });
  }

  /**
   * 打开文件
   * @memberof FilePreviewService
   */
  public openFile() {
    const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
    return new Promise((resolve, reject) => {
      try {
        console.error("cordova=======", cordova);
      } catch (error) {
        console.error("=======cordova未找到=======");
        reject();
        return;
      }
      const fileNameAndType = GlobalMethod.getFileNameAndType(this.fileUrl); // 截取文件名和文件类型
      const fileMimeType = GlobalMethod.getFileMimeType(this.fileUrl);
      cordova["plugins"].fileOpener2.open(
        fs + this.localDirName + "/" + fileNameAndType, //下载文件保存地址
        fileMimeType,
        {
          // 以APK文件方式打开
          error: (err: any) => {
            console.error("打开PDF文件失败", err);
            reject(err);
          },
          success: () => {
            console.error("打开PDF文件成功");
            resolve();
          }
        }
      );
    });
  }

  /**
   * PDF文档查看
   * @memberof FilePreviewService
   */
  public pdfDocView() {
    // const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
    // return new Promise((resolve, reject) => {
    //   try {
    //     console.error("cordova=======", cordova);
    //   } catch (error) {
    //     console.error("=======cordova未找到=======");
    //     reject();
    //     return;
    //   }
    //   const fileNameAndType = GlobalMethod.getFileNameAndType(this.fileUrl); // 截取文件名和文件类型
    //   const fileMimeType = GlobalMethod.getFileMimeType(this.fileUrl);
    //   const fileName = GlobalMethod.getFileName(this.fileUrl); // 截取文件名和文件类型
    // const options: DocumentViewerOptions = {
    //   title: fileName
    // };
    // console.error(fs + this.localDirName + "/" + fileNameAndType);
    // this.docView.viewDocument(
    //   fs + this.localDirName + "/" + fileNameAndType,
    //   fileMimeType,
    //   options);
    // });
  }

  /**
   * 打开APP安装包
   * @param {string} appFileUrl app在设备路径
   * @memberof FilePreviewService
   */
  public openAppIns(appFileUrl: string) {
    return new Promise((resolve, reject) => {
      try {
        console.error("cordova=======", cordova);
      } catch (error) {
        console.error("=======cordova未找到=======");
        reject();
        return;
      }
      cordova["plugins"].fileOpener2.open(
        appFileUrl, // 下载文件保存地址
        "application/vnd.android.package-archive",
        {
          // 以APK文件方式打开
          error: (err: any) => {
            this.gloService.showMsg("打开安装包失败", null, 2000);
            reject(err);
            console.error("打开APP安装包失败err", err);
          },
          success: () => {
            console.error("打开APP安装包成功data");
            resolve();
          }
        }
      );
    });
  }

  /**
   * 检查设备是否安装PDF查看应用程序，未安装则下载
   * @memberof FilePreviewService
   */
  public checkAppInstall() {
    return new Promise((resolve, reject) => {
      let app: any = null;
      if (this.platform.is("ios")) {
        app = "twitter://";
      } else if (this.platform.is("android")) {
        app = this.appPkgName;
      }
      this.appAva.check(app).then(
        checkAppSuc => {
          console.error("PDF阅读器已经安装", checkAppSuc);
          resolve(checkAppSuc);
        },
        checkAppErr => {
          console.error("PDF阅读器未安装", checkAppErr);
          const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
          const fileTransfer: FileTransferObject = this.transfer.create();
          // const fileNameAndType = GlobalMethod.getFileNameAndType(
          //   this.pdfReadApp
          // ); // 截取文件名和文件类型
          const pdfAppName = GlobalMethod.getFileNameAndType(this.pdfReadApp); // 安装包全名
          const appFileUrl = fs + this.localDirName + "/" + pdfAppName; // 安装包全路径
          // 检查PDF安装包是否存在
          this.checkIsHasFile(pdfAppName).then(
            hasFileSuc => {
              console.error("已经找到PDF阅读器安装包", hasFileSuc);
              this.openAppIns(appFileUrl).then(
                openAppSuc => {
                  console.error("打开PDF安装包成功！", openAppSuc);
                },
                openAppErr => {
                  console.error("打开PDF安装包失败！", openAppErr);
                  this.gloService.showMsg("打开PDF安装包失败！");
                  reject();
                }
              );
            },
            hasFileErr => {
              console.error("没有找到PDF阅读器安装包", hasFileErr);
              const loading = this.gloService.showLoading("下载PDF查看器：0%");
              fileTransfer.download(this.pdfReadApp, appFileUrl).then(
                downloadSuc => {
                  console.error("下载文件成功", downloadSuc);
                  this.openAppIns(appFileUrl).then(
                    openAppSuc => {
                      console.error("打开PDF安装包成功！", openAppSuc);
                    },
                    openAppErr => {
                      console.error("打开PDF安装包失败！", openAppErr);
                      this.gloService.showMsg("打开PDF安装包失败！");
                      reject();
                    }
                  );
                },
                downloadErr => {
                  console.error("下载文件失败", downloadErr);
                  this.gloService.showMsg("下载PDF查看器失败");
                  reject();
                }
              );
              // 文件下载进度,注册每当传输新数据块时调用的侦听器
              let downNum: any = 0;
              fileTransfer.onProgress(progressEvent => {
                let downloadProgress = (
                  (progressEvent.loaded / progressEvent.total) *
                  100
                ).toFixed(2);
                downNum = parseFloat(downloadProgress);
                if (parseFloat(downloadProgress) > 99) {
                  loading.dismiss();
                }
              });
              let timer: any = setInterval(() => {
                loading.setContent("PDF查看器已下载:" + downNum + "%");
                if (parseFloat(downNum) > 99) {
                  window.clearInterval(timer);
                }
              }, 1000);
            }
          );
        }
      );
    });
  }

  /**
   * 打开本地APP并打开文件
   * @memberof FilePreviewService
   */
  public openAppAndFile() {
    const fs: string = cordova.file.externalRootDirectory; // 外部存储（SD卡）根目录
    const fileNameAndType = GlobalMethod.getFileNameAndType(this.fileUrl); // 截取文件名和文件类型
    const fileMimeType = GlobalMethod.getFileMimeType(this.fileUrl);
    const fileLocalUrl: string = fs + this.localDirName + "/" + fileNameAndType; // 下载文件保存地址
    return new Promise((resolve, reject) => {
      const startApp = cordova["plugins"]["startApp"].set(
        {
          // 启动APP并打开文件
          // action: "ACTION_VIEW", // 添加上会打不开应用
          category: "CATEGORY_DEFAULT",
          type: fileMimeType,
          package: this.appPkgName,
          uri: fileLocalUrl,
          flags: ["FLAG_ACTIVITY_CLEAR_TOP", "FLAG_ACTIVITY_CLEAR_TASK"],
          intentstart: "startActivity"
          // "component": ["com.android.GoBallistic","com.android.GoBallistic.Activity"],
        },
        {
          EXTRA_STREAM: "extraValue1",
          extraKey2: "extraValue2"
        }
      );
      startApp.start(
        (suc: any) => {
          console.error("启动PDF阅读器并打开文件成功！", suc);
          resolve(suc);
        },
        (err: any) => {
          console.error("启动PDF阅读器并打开文件失败！", err);
          reject(err);
        }
      );
    });
  }

  /**
   * 查看文件
   * @param {string} fileUrl
   * @memberof FilePreviewService
   */
  public previewFile(fileUrl: string) {
    try {
      console.error("cordova=======", cordova);
    } catch (error) {
      console.error("=======cordova未找到=======");
      return;
    }

    this.setFileUrl(fileUrl);

    const fileType = GlobalMethod.getFileType(this.fileUrl); // 获取文件扩展名
    console.error("fileType", fileType);
    if (fileType != "pdf") {
      this.gloService.showMsg("远程服务器文件非PDF文档，暂无法打开");
      return;
    }

    this.checkPermission().then(
      checkPermSuc => {
        console.error("获取权限成功AAAAA", checkPermSuc);
        this.creatLocalDir().then(
          creatDirSuc => {
            console.error("目录获取成功GGGGG", creatDirSuc);
            this.checkAppInstall().then(
              appInsSuc => {
                console.error("PDF阅读器已经安装", appInsSuc);
                const fileNameAndType = GlobalMethod.getFileNameAndType(
                  this.fileUrl
                ); // 截取文件名和文件类型
                console.error("fileNameAndType", fileNameAndType);
                this.checkIsHasFile(fileNameAndType).then(
                  getPdfSuc => {
                    console.error("检测本地已有PDF文件", getPdfSuc);
                    this.openAppAndFile().then(
                      openAppSuc => {
                        console.error("打开本地已有文件成功CCCCC", openAppSuc);
                      },
                      openAppErr => {
                        console.error("打开本地已有文件失败CCCCC", openAppErr);
                        // this.gloService.showMsg("打开文件失败，请选择阅读器！");
                      }
                    );
                  },
                  getPdfErr => {
                    console.error("检测本地没有PDF文件", getPdfErr);
                    this.downloadFile().then(
                      downloadFileSuc => {
                        console.error(
                          "下载服务器文件成功EEEEE",
                          downloadFileSuc
                        );
                        this.openAppAndFile().then(
                          openAppSuc => {
                            console.error(
                              "打开本地已有文件成功CCCCC",
                              openAppSuc
                            );
                          },
                          openAppErr => {
                            console.error(
                              "打开本地已有文件失败CCCCC",
                              openAppErr
                            );
                            // this.gloService.showMsg(
                            //   "打开文件失败，请选择阅读器！"
                            // );
                          }
                        );
                      },
                      downloadFileErr => {
                        console.error(
                          "下载服务器文件失败EEEEE",
                          downloadFileErr
                        );
                        this.gloService.showMsg("下载远程服务器文件失败！");
                      }
                    );
                  }
                );
              },
              appInsErr => {
                console.error("PDF阅读器没有安装", appInsErr);
              }
            );
          },
          creatDirErr => {
            console.error("目录获取失败GGGGG", creatDirErr);
            this.gloService.showMsg("创建存储目录失败！");
          }
        );
      },
      checkPermErr => {
        console.error("获取权限失败AAAAA", checkPermErr);
        this.openPermSetting();
      }
    );
  }
}
