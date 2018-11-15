import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ConfigListPage } from "./config-list";

@NgModule({
  declarations: [ConfigListPage],
  imports: [IonicPageModule.forChild(ConfigListPage), IonicModule],
  exports: [ConfigListPage]
})
export class ConfigListPageModule {}
