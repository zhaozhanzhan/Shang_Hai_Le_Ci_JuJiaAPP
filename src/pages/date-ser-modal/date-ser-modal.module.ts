import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { DateSerModalPage } from "./date-ser-modal";

@NgModule({
  declarations: [DateSerModalPage],
  imports: [IonicPageModule.forChild(DateSerModalPage), IonicModule],
  exports: [DateSerModalPage]
})
export class DateSerModalPageModule {}
