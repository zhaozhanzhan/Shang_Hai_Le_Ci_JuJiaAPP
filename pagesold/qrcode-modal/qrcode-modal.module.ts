import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { QrcodeModalPage } from "./qrcode-modal";

@NgModule({
  declarations: [QrcodeModalPage],
  imports: [IonicPageModule.forChild(QrcodeModalPage), IonicModule],
  exports: [QrcodeModalPage]
})
export class QrcodeModalPageModule {}
