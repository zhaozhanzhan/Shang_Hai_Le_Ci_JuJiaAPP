import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { MapPage } from "./map";
import { ComponentsModule } from "../../common/component/components.module";

@NgModule({
  declarations: [MapPage],
  imports: [IonicPageModule.forChild(MapPage), IonicModule, ComponentsModule],
  exports: [MapPage]
})
export class MapPageModule {}
