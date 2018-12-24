import { Component } from "@angular/core";
import { ModalController } from "ionic-angular";
import { GalleryModal } from "ionic-gallery-modal";
import _ from "underscore"; // 工具类

@Component({
  selector: "photo-prev",
  templateUrl: "photo-prev.html"
})
export class PhotoPrevComponent {
  constructor(
    public modalCtrl: ModalController // Modal弹出页控制器
  ) {
    console.log("Hello PhotoPrevComponent Component");
  }

  /**
   * (单图)多图预览model组件封装
   * @param photoData 输入图片地址
   * @param {string} key 对象图片url对应的属性名程
   */
  public photoViews(photoData: any, key: string = "", i: number = 0) {
    let photos: Array<object> = [];
    let obj: any = {};
    // 单张图片时（photoData为一个图片地址字符串且不为空）
    if (_.isString(photoData) && photoData.length > 0) {
      obj = {};
      obj["url"] = photoData;
      photos.push(obj);
    }
    console.log(photoData);

    // 多张图片时（photoData为图片地址字符串数组）
    if (photoData instanceof Array) {
      console.log(photoData);
      photoData.forEach((item, index, array) => {
        obj = {};
        // photoData 为字符串数组时（即key不存在时）
        if (key == "" && item) {
          obj["url"] = item;
          photos.push(obj);
        }
        // photoData 为对象数组时（即key存在时）
        console.log(item[key]);
        if (key != "" && item[key]) {
          obj["url"] = item[key];
          photos.push(obj);
        }
      });
    }
    let modal = this.modalCtrl.create(GalleryModal, {
      photos: photos,
      initialSlide: i
      // closeIcon: "ios-close-outline",
    });
    modal.present();
  }
}
