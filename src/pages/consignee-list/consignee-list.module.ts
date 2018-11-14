import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ConsigneeListPage } from "./consignee-list";

@NgModule({
  declarations: [ConsigneeListPage],
  imports: [IonicPageModule.forChild(ConsigneeListPage), IonicModule],
  exports: [ConsigneeListPage]
})
export class ConsigneeListPageModule {}
