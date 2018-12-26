import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SerDetailPage } from "./ser-detail";

@NgModule({
  declarations: [SerDetailPage],
  imports: [IonicPageModule.forChild(SerDetailPage), IonicModule],
  exports: [SerDetailPage]
})
export class SerDetailPageModule {}
