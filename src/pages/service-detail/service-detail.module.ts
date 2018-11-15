import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceDetailPage } from "./service-detail";

@NgModule({
  declarations: [ServiceDetailPage],
  imports: [IonicPageModule.forChild(ServiceDetailPage), IonicModule],
  exports: [ServiceDetailPage]
})
export class ServiceDetailPageModule {}
