import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SerDetailPage } from "./ser-detail";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [SerDetailPage],
  imports: [IonicPageModule.forChild(SerDetailPage), IonicModule, PipesModule],
  exports: [SerDetailPage]
})
export class SerDetailPageModule {}
