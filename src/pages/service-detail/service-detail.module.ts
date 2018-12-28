import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceDetailPage } from "./service-detail";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [ServiceDetailPage],
  imports: [
    IonicPageModule.forChild(ServiceDetailPage),
    IonicModule,
    PipesModule
  ],
  exports: [ServiceDetailPage]
})
export class ServiceDetailPageModule {}
