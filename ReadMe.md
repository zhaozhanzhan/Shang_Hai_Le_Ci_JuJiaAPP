# Run

## 浏览器运行

```
ionic serve
```

若运行出错，可检查 node-modules 下是否没有自动下载 Angular 相关库，若无则可使用 npm install 安装

## 真机调试运行

##### 打包并运行

```
ionic cordova run android
```

##### 实时日志调试

```
ionic cordova run android —l -c
```

## 发布前打包测试

**android 打包**

```
ionic cordova build android --prod —release
```

---

# 关于极光推送

## 教程

点击进入极光推送 [https://www.jianshu.com/p/eb8ab29329d9](https://www.jianshu.com/p/eb8ab29329d9)

# 关于热更新

## 教程

点击进入 [https://www.jianshu.com/p/a9a48fd2cefc](https://www.jianshu.com/p/a9a48fd2cefc)

点击进入 [https://www.jianshu.com/p/9e3cd54f5f97](https://www.jianshu.com/p/9e3cd54f5f97)

点击进入 [http://kaibin.me/2016/07/17/ionic-hotcode/](http://kaibin.me/2016/07/17/ionic-hotcode/)

## 新项目发布前的配置流程

1.  编译项目

    ```
    ionic build --prod
    ```

2.  cordova-hcp.json 中修改 **`content_url`** 字段为发布在服务器的访问地址
3.  执行 **`$cordova-hcp build`** 将 www 目录发布到服务器
4.  修改根目录下的 **`config.xml`** 文件配置 **`config-file url`** ,地址为项目访问地址下的 **`chcp.json`** 文件地址，如：**http://192.168.1.222:8888/www/chcp.json**
5.  启动热更新服务

    ```
    cordova-hcp server
    ```

6.  打包 APP

    ```
    ionic cordova build android --prod —release
    ```

    **此时热更新服务不能停止，一个终端执保持热更新服务，另一个终端执行其它命令**

## 发布热更新流程

1. 修改代码，并重新编译 **`ionic build --prod`**
2. 执行 **`$cordova-hcp build`** 将 **`www`** 目录发布到服务器
3. 重启 app，发现页面已经改变

##### 使用这个插件： cordova plugin add cordova-android-support-gradle-release，它应该解决任何依赖性问题

### 错误信息

    Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.

### 解决方法

    在“/node_modules/@ionic/app-scripts/dist/sass.js”路径的“sass.js”文件，在 postcssOptions 参数中添加“from: undefined”

### 错误信息 打包 ios 出现

    Error: Cannot find module '../cordova/platform_metadata'

### 解决方法

```
  npm uninstall -g cordova
  npm install -g cordova@7.1.0
```

有人反馈说插件在 Android 7.0.0 不能用，我没试过，我的 platform 为：android 6.3.0 , ios 4.3.1
或 这是 cordova-plugin-add-swift-support 中的一个错误，只需将其更新到最新版本（1.7.1）

```
  cordova plugin rm cordova-plugin-add-swift-support --force
  cordova plugin add cordova-plugin-add-swift-support
```

点击进入 [https://github.com/bitpay/cordova-plugin-qrscanner/issues/144](https://github.com/bitpay/cordova-plugin-qrscanner/issues/144)

### 错误信息

    Failed to execute aapt
    :app:processDebugResources FAILED
    com.android.ide.common.process.ProcessException: Failed to execute aapt

## 注意 以下解决方案全部废弃，仅供参考

必须要把本地的 build 一下再 cordova-hcp build 重新打时间戳一下，再替换才起作用
每次更新都需要**重新编译**，再 `$cordova-hcp build`重新生成文件的 hash，最后发布；

#### 如果打包出现 `AndroidManifest.xml` 文件未找到

    请卸载 cordova 重新安装 `cordova@6.5.0`

    ionic cordova platform add android@6.4.0 --save 解决 `AndroidManifest.xml file is not found`

### 解决方法

点击进入 [https://blog.csdn.net/another_a/article/details/57129318](https://blog.csdn.net/another_a/article/details/57129318)

### cordova-plugin-file-opener2 报错

点击进入 [https://blog.csdn.net/qq_40014350/article/details/80326811](https://blog.csdn.net/qq_40014350/article/details/80326811)
<plugin name="cordova-plugin-file-opener2" spec="1.0.11" />

#### 在 Android 项目中找到 platforms\android\app， 创建一个 build-extras.gradle

#### 打开下载好的安装包插件是 `cordova-plugin-file-opener2-wxl`

```
configurations.all {
    resolutionStrategy {
        force 'com.android.support:support-v4:27.1.0'
    }
}
```

```
<chcp>
    <config-file url="http://192.168.1.129:7777/www/chcp.json" />
    <auto-download enabled="true" />
    <auto-install enabled="true" />
    <local-development enabled="true" />
    <native-interface version="1" />
</chcp>
<chcp>
    <config-file url="http://139.224.12.181:9527/JuJiaUpdate/chcp.json" />
    <auto-download enabled="true" />
    <auto-install enabled="true" />
    <local-development enabled="true" />
    <native-interface version="5" />
</chcp>
    ionic build --prod

    ionic build -- chcp-dev
    这里有个坑：如果cordova是7.0版本，需要加多两个连接符
    cordova build -- -- chcp-dev

    cordova-hcp build
    cordova-hcp server
    ionic cordova platform rm android
    ionic cordova platform add android
    ionic cordova run android --prod --release
    ionic cordova build android --prod --release
    ionic serve --prod --port 5555
    ionic cordova run android --prod -l
    修改版本号 version="1.5.0" native-interface version="5" "min_native_interface": 5

解决 `AndroidManifest.xml file is not found` 修改platforms\android\cordova\Api.js
this.locations = { // 网络提供版
    root: self.root,
    www: path.join(self.root, 'assets/www'),
    res: path.join(self.root, 'res'),
    platformWww: path.join(self.root, 'platform_www'),
    configXml: path.join(self.root, 'app/src/main/res/xml/config.xml'),
    defaultConfigXml: path.join(self.root, 'cordova/defaults.xml'),
    strings: path.join(self.root, 'app/src/main/res/values/strings.xml'),
    manifest: path.join(self.root, 'app/src/main/AndroidManifest.xml'),
    build: path.join(self.root, 'build'),
    javaSrc: path.join(self.root, 'app/src/main/java/'),
    // NOTE: Due to platformApi spec we need to return relative paths here
    cordovaJs: 'bin/templates/project/assets/www/cordova.js',
    cordovaJsSrc: 'cordova-js-src'
};

this.locations = { // 修改使用版
  root: self.root,
  www: path.join(self.root, 'app/src/main/assets/www'),
  res: path.join(self.root, 'app/src/main/res'),
  platformWww: path.join(self.root, 'platform_www'),
  configXml: path.join(self.root, 'app/src/main/res/xml/config.xml'),
  defaultConfigXml: path.join(self.root, 'cordova/defaults.xml'),
  strings: path.join(self.root, 'app/src/main/res/values/strings.xml'),
  manifest: path.join(self.root, 'app/src/main/AndroidManifest.xml'),
  build: path.join(self.root, 'app/build'),
  javaSrc: path.join(self.root, 'app/src/main/java/'),
  // NOTE: Due to platformApi spec we need to return relative paths here
  cordovaJs: path.join(self.root,'app/src/main/assets/www/cordova.js'),
  cordovaJsSrc: path.join(self.root,'app/src/main/assets/www/cordova-js-src')
};
```
