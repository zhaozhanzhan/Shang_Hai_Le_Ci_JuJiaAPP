import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SelProModalPage } from "./sel-pro-modal";

@NgModule({
  declarations: [SelProModalPage],
  imports: [IonicPageModule.forChild(SelProModalPage), IonicModule],
  exports: [SelProModalPage]
})
export class SelProModalPageModule {}
