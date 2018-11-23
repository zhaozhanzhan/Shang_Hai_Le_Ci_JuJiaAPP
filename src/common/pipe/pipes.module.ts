import { NgModule } from "@angular/core";
import { IonicModule } from "ionic-angular";
import { OrderStatePipe } from "./pipes/OrderState.Pipe";
import { MerchantOrderStatePipe } from "./pipes/MerchantOrderState.Pipe";
import { SexStatePipe } from "./pipes/SexState.Pipe";
import { EducationLevelPipe } from "./pipes/EducationLevel.Pipe";
import { PoliticalStatePipe } from "./pipes/PoliticalState.Pipe";
@NgModule({
  declarations: [
    OrderStatePipe,
    MerchantOrderStatePipe,
    SexStatePipe,
    EducationLevelPipe,
    PoliticalStatePipe
  ],
  imports: [IonicModule],
  exports: [
    OrderStatePipe,
    MerchantOrderStatePipe,
    SexStatePipe,
    EducationLevelPipe,
    PoliticalStatePipe
  ]
})
export class PipesModule {}
