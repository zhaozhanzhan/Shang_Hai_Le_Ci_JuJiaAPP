import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { StaiDetailPage } from "./stai-detail";

@NgModule({
  declarations: [StaiDetailPage],
  imports: [IonicPageModule.forChild(StaiDetailPage), IonicModule],
  exports: [StaiDetailPage]
})
export class StaiDetailPageModule {}
