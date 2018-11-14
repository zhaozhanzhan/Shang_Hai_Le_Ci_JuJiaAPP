import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"; // 浏览器平台支持
import { AppModule } from "./app.module"; // 引入主模块

platformBrowserDynamic().bootstrapModule(AppModule); // 启动主模块
