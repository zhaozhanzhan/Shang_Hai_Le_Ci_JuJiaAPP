import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { BankCardPage } from "./bank-card";

@NgModule({
  declarations: [BankCardPage],
  imports: [IonicPageModule.forChild(BankCardPage), IonicModule],
  exports: [BankCardPage]
})
export class BankCardPageModule {}
