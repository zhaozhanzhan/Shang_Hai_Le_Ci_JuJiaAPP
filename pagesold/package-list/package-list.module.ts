import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { PackageListPage } from "./package-list";

@NgModule({
  declarations: [PackageListPage],
  imports: [IonicPageModule.forChild(PackageListPage), IonicModule],
  exports: [PackageListPage]
})
export class PackageListPageModule {}
