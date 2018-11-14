import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { MerchantOrderDetailPage } from "./merchant-order-detail";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [MerchantOrderDetailPage],
  imports: [
    IonicPageModule.forChild(MerchantOrderDetailPage),
    IonicModule,
    PipesModule
  ],
  exports: [MerchantOrderDetailPage]
})
export class MerchantOrderDetailPageModule {}
