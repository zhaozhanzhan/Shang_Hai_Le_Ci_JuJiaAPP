import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { WalletPage } from "./wallet";

@NgModule({
  declarations: [WalletPage],
  imports: [IonicPageModule.forChild(WalletPage), IonicModule],
  exports: [WalletPage]
})
export class WalletPageModule {}
