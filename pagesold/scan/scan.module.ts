import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ScanPage } from "./scan";

@NgModule({
  declarations: [ScanPage],
  imports: [IonicPageModule.forChild(ScanPage), IonicModule],
  exports: [ScanPage]
})
export class ScanPageModule {}
