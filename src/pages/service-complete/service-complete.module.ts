import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceCompletePage } from "./service-complete";

@NgModule({
  declarations: [ServiceCompletePage],
  imports: [IonicPageModule.forChild(ServiceCompletePage), IonicModule],
  exports: [ServiceCompletePage]
})
export class ServiceCompletePageModule {}
