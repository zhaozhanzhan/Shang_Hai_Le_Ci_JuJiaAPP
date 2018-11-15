import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceConductPage } from "./service-conduct";

@NgModule({
  declarations: [ServiceConductPage],
  imports: [IonicPageModule.forChild(ServiceConductPage), IonicModule],
  exports: [ServiceConductPage]
})
export class ServiceConductPageModule {}
