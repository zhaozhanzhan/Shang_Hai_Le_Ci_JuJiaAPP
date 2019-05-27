import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ConfigListThrPage } from "./config-list-thr";

@NgModule({
  declarations: [ConfigListThrPage],
  imports: [IonicPageModule.forChild(ConfigListThrPage), IonicModule],
  exports: [ConfigListThrPage]
})
export class ConfigListThrPageModule {}
