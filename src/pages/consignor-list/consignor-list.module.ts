import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ConsignorListPage } from "./consignor-list";

@NgModule({
  declarations: [ConsignorListPage],
  imports: [IonicPageModule.forChild(ConsignorListPage), IonicModule],
  exports: [ConsignorListPage]
})
export class ConsignorListPageModule {}
