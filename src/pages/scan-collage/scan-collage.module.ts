import { IonicModule } from "ionic-angular";
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ScanCollagePage } from "./scan-collage";

@NgModule({
  declarations: [ScanCollagePage],
  imports: [IonicPageModule.forChild(ScanCollagePage), IonicModule],
  exports: [ScanCollagePage]
})
export class ScanCollagePageModule {}
