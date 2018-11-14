import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { PickupGoodsPage } from "./pickup-goods";

@NgModule({
  declarations: [PickupGoodsPage],
  imports: [IonicPageModule.forChild(PickupGoodsPage), IonicModule],
  exports: [PickupGoodsPage]
})
export class PickupGoodsPageModule {}
