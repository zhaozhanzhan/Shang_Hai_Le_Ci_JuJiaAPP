import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceInfoListPage } from "./service-info-list";

@NgModule({
  declarations: [ServiceInfoListPage],
  imports: [IonicPageModule.forChild(ServiceInfoListPage), IonicModule],
  exports: [ServiceInfoListPage]
})
export class ServiceInfoListPageModule {}
