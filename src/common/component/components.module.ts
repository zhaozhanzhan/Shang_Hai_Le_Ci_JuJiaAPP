import { NgModule } from "@angular/core";
import { SelectAreaComponent } from "./components/select-area/select-area";
import { BaiduMapComponent } from "./components/baidu-map/baidu-map";
import { IonicModule } from "ionic-angular";
import { PhotoPrevComponent } from "./components/photo-prev/photo-prev";
@NgModule({
  declarations: [SelectAreaComponent, BaiduMapComponent, PhotoPrevComponent],
  imports: [IonicModule],
  exports: [SelectAreaComponent, BaiduMapComponent, PhotoPrevComponent]
})
export class ComponentsModule {}
