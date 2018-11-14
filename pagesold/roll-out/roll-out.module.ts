import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { RollOutPage } from "./roll-out";

@NgModule({
  declarations: [RollOutPage],
  imports: [IonicPageModule.forChild(RollOutPage), IonicModule],
  exports: [RollOutPage]
})
export class RollOutPageModule {}
