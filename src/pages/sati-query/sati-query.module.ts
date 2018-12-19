import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SatiQueryPage } from "./sati-query";

@NgModule({
  declarations: [SatiQueryPage],
  imports: [IonicPageModule.forChild(SatiQueryPage), IonicModule],
  exports: [SatiQueryPage]
})
export class SatiQueryPageModule {}
