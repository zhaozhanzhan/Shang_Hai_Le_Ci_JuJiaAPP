import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServiceInfoListPage } from "./service-info-list";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [ServiceInfoListPage],
  imports: [
    IonicPageModule.forChild(ServiceInfoListPage),
    IonicModule,
    PipesModule
  ],
  exports: [ServiceInfoListPage]
})
export class ServiceInfoListPageModule {}
