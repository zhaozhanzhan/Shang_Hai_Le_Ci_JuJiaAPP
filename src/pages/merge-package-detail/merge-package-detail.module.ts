import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { MergePackageDetailPage } from "./merge-package-detail";

@NgModule({
  declarations: [MergePackageDetailPage],
  imports: [IonicPageModule.forChild(MergePackageDetailPage), IonicModule],
  exports: [MergePackageDetailPage]
})
export class MergePackageDetailPageModule {}
