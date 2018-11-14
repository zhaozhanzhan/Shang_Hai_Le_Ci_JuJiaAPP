import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { WaybillListPage } from "./waybill-list";

@NgModule({
  declarations: [WaybillListPage],
  imports: [IonicPageModule.forChild(WaybillListPage), IonicModule],
  exports: [WaybillListPage]
})
export class WaybillListPageModule {}
