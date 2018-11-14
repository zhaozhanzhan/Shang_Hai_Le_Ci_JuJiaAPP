import { IonicModule } from "ionic-angular";
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ScanTwoPage } from "./scan-two";

@NgModule({
  declarations: [ScanTwoPage],
  imports: [IonicPageModule.forChild(ScanTwoPage), IonicModule],
  exports: [ScanTwoPage]
})
export class ScanTwoPageModule {}
