import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ConsignorAddPage } from "./consignor-add";

@NgModule({
  declarations: [ConsignorAddPage],
  imports: [IonicPageModule.forChild(ConsignorAddPage), IonicModule],
  exports: [ConsignorAddPage]
})
export class ConsignorAddPageModule {}
