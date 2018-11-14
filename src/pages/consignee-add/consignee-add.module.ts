import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ConsigneeAddPage } from "./consignee-add";

@NgModule({
  declarations: [ConsigneeAddPage],
  imports: [IonicPageModule.forChild(ConsigneeAddPage), IonicModule],
  exports: [ConsigneeAddPage]
})
export class ConsigneeAddPageModule {}
