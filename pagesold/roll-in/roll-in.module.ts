import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { RollInPage } from "./roll-in";

@NgModule({
  declarations: [RollInPage],
  imports: [IonicPageModule.forChild(RollInPage), IonicModule],
  exports: [RollInPage]
})
export class RollInPageModule {}
