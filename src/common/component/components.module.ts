import { NgModule } from "@angular/core";
import { SelectAreaComponent } from "./components/select-area/select-area";
import { BaiduMapComponent } from "./components/baidu-map/baidu-map";
import { IonicModule } from "ionic-angular";
@NgModule({
  declarations: [SelectAreaComponent, BaiduMapComponent],
  imports: [IonicModule],
  exports: [SelectAreaComponent, BaiduMapComponent]
})
export class ComponentsModule {}
