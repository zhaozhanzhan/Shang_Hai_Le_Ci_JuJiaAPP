/**
 * name:全局基础配置信息
 * describe:定义全局基础配置信息例如：请求地址、基础分页
 * author:赵展展
 * QQ:799316652
 * Email:zhanzhan.zhao@mirrortech.cn
 */

//================= 服务器IP + 端口配置 Begin =================//
// http://139.196.204.226:8980/home/a/login?__login=true&__ajax=json&username=F3EDC7D2C193E0B8DCF554C726719ED2&password=235880C505ACCDA5C581A4F4CDB81DA0
// const ip = "180.103.210.106:8081";// 公网IP+端口
// const ip = "139.196.204.226:8980"; // 公网IP+端口 测试服
const ip = "180.103.210.106:8088"; // 公网IP+端口 测试服
const ipDownload = "180.103.210.106:8888"; // 下载文件 测试服
// const ip = "192.168.1.129:9999"; // 内网IP+端口
// const ip = "192.168.1.118:8081"; // 内网IP+端口
// const ip = "192.168.1.118:8088"; // 内网IP+端口
// const ip = "192.168.1.222:8088"; // 内网IP+端口

//================= 服务器IP + 端口配置 End =================//

//================= 请求地址配置对象 Begin =================//
export const reqObj = {
  baseUrl: "http://" + ip + "/",
  andUpdAppUrl: "http://" + ipDownload + "/LaBaoGongAppDownload/update.apk", // 安卓下载更新APP包地址
  iosUpdAppUrl:
    "itms-apps://itunes.apple.com/us/app/domainsicle-domain-name-search/id511364723?ls=1&mt=8" // IOS下载更新APP包地址
};
//================= 请求地址配置对象 End =================//

//================= 登录信息配置对象 Begin =================//
export const loginInfo = {
  LoginState: null, // 登录状态
  LoginTime: null, // 登录时间
  UserName: null, // 用户名
  Password: null, // 用户密码
  Token: null, // 登录者Token
  UserInfo: null // 后台返回用户信息对象
};
//================= 登录信息配置对象 End =================//

//================= 登录加密密钥配置对象 Begin =================//
export const desConfig = {
  key: "thinkgem,jeesite,com"
};
//================= 登录加密密钥配置对象 End =================//

//================= 分页参数配置对象 Begin =================//
export const pageObj = {
  totalItem: 100, //总条数
  currentPage: 0, //当前页码
  totalPage: 99, //总页码
  everyItem: 10 //每页条数
};
//================= 分页参数配置对象 End =================//