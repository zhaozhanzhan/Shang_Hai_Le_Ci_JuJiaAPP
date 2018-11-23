import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ConfigListTwoPage } from "./config-list-two";

@NgModule({
  declarations: [ConfigListTwoPage],
  imports: [IonicPageModule.forChild(ConfigListTwoPage), IonicModule],
  exports: [ConfigListTwoPage]
})
export class ConfigListTwoPageModule {}
