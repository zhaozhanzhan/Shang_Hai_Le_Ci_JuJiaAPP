import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SelProModalTwoPage } from "./sel-pro-modal-two";

@NgModule({
  declarations: [SelProModalTwoPage],
  imports: [IonicPageModule.forChild(SelProModalTwoPage), IonicModule],
  exports: [SelProModalTwoPage]
})
export class SelProModalTwoPageModule {}
