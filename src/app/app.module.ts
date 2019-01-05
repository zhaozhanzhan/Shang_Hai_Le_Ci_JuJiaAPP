import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG // 浏览器手势事件模块
} from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { IonicStorageModule } from "@ionic/storage";
import { StatusBar } from "@ionic-native/status-bar"; // 状态栏
import { SplashScreen } from "@ionic-native/splash-screen";
import { Camera } from "@ionic-native/camera"; // 文件路径
import { File } from "@ionic-native/file"; // 文件选择
import { FilePath } from "@ionic-native/file-path"; // 文件路径
import { FileTransfer } from "@ionic-native/file-transfer"; // 文件上传
import { FileOpener } from "@ionic-native/file-opener"; // 文件打开
import { JPush } from "@jiguang-ionic/jpush"; // 极光推送
import { Geolocation } from "@ionic-native/geolocation"; // GPS定位
import { NFC } from "@ionic-native/nfc"; // NFC
import { LocalNotifications } from "@ionic-native/local-notifications"; // 本地通知
import { NativeAudio } from "@ionic-native/native-audio"; // 音频播放
import { Vibration } from "@ionic-native/vibration"; // 震动插件
import { QRScanner } from "@ionic-native/qr-scanner"; // 条码、二维码扫描
import { Media } from "@ionic-native/media"; // 录音及音频播放
import { AppAvailability } from "@ionic-native/app-availability"; // 检查用户设备安装了某应用程序
import { AndroidPermissions } from "@ionic-native/android-permissions"; // Android权限控制
import { OpenNativeSettings } from "@ionic-native/open-native-settings"; // 系统设置
import { InAppBrowser } from "@ionic-native/in-app-browser"; // 打开浏览器
import { CommonServiceModule } from "../common/common.module"; // 全局自定义公共服务模块
import { MultiPickerModule } from "ion-multi-picker"; // 多级选择器
import * as ionicGalleryModal from "ionic-gallery-modal"; // 图片预览模块
import { MainPageModule } from "../pages/main/main.module";
import { MyApp } from "./app.component"; // 根组件
import { LoginPage } from "./../pages/login/login"; // 登录页面
import { ForgetPasswordPage } from "./../pages/forget-password/forget-password"; // 忘记密码
import { FastLoginPage } from "../pages/fast-login/fast-login"; // 快速登录

@NgModule({
  declarations: [
    MyApp, // 根组件
    LoginPage, // 登录页面
    ForgetPasswordPage, // 忘记密码
    FastLoginPage // 快速登录
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CommonServiceModule,
    MultiPickerModule,
    ionicGalleryModal.GalleryModalModule, // 图片预览模块
    IonicModule.forRoot(MyApp, {
      backButtonText: "", // 返回按钮文字
      mode: "ios" // 设置样式为ios模式
    }),
    MainPageModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, // 根组件
    LoginPage, // 登录页面
    ForgetPasswordPage, // 忘记密码
    FastLoginPage // 快速登录
  ],
  providers: [
    JPush, // 极光推送
    StatusBar, // 状态栏
    SplashScreen,
    Camera, // 相机
    File, // 文件
    FilePath, // 文件路径
    FileTransfer, // 文件上传
    FileOpener, // 文件打开
    Geolocation, // GPS定位
    AndroidPermissions, // Android权限控制
    OpenNativeSettings, // 系统设置
    LocalNotifications, // 本地通知
    NativeAudio, // 音频播放
    Vibration, // 震动插件
    QRScanner, // 条码、二维码扫描
    Media, // 录单及音频播放
    NFC, // NFC
    InAppBrowser, // 打开浏览器
    AppAvailability, // 检查用户设备安装了某应用程序
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    {
      provide: HAMMER_GESTURE_CONFIG, // 浏览器手势事件模块
      useClass: ionicGalleryModal.GalleryModalHammerConfig // 图片预览模块
    }
  ]
})
export class AppModule {}
