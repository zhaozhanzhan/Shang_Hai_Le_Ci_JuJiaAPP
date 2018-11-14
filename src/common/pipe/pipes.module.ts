import { NgModule } from "@angular/core";
import { IonicModule } from "ionic-angular";
import { OrderStatePipe } from "./pipes/OrderState.Pipe";
import { MerchantOrderStatePipe } from "./pipes/MerchantOrderState.Pipe";
@NgModule({
  declarations: [OrderStatePipe, MerchantOrderStatePipe],
  imports: [IonicModule],
  exports: [OrderStatePipe, MerchantOrderStatePipe]
})
export class PipesModule {}
