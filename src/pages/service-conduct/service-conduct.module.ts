import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceConductPage } from "./service-conduct";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [ServiceConductPage],
  imports: [
    IonicPageModule.forChild(ServiceConductPage),
    IonicModule,
    PipesModule
  ],
  exports: [ServiceConductPage]
})
export class ServiceConductPageModule {}
