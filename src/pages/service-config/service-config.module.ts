import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceConfigPage } from "./service-config";

@NgModule({
  declarations: [ServiceConfigPage],
  imports: [IonicPageModule.forChild(ServiceConfigPage), IonicModule],
  exports: [ServiceConfigPage]
})
export class ServiceConfigPageModule {}
