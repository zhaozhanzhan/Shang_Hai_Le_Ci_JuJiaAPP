import { IonicModule } from "ionic-angular";
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { BankCardEditPage } from "./bank-card-edit";

@NgModule({
  declarations: [BankCardEditPage],
  imports: [IonicPageModule.forChild(BankCardEditPage), IonicModule],
  exports: [BankCardEditPage]
})
export class BankCardEditPageModule {}
