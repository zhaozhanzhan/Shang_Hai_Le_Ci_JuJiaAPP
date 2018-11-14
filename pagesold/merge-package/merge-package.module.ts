import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { MergePackagePage } from "./merge-package";

@NgModule({
  declarations: [MergePackagePage],
  imports: [IonicPageModule.forChild(MergePackagePage), IonicModule],
  exports: [MergePackagePage]
})
export class MergePackagePageModule {}
