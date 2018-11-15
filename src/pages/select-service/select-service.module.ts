import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SelectServicePage } from "./select-service";

@NgModule({
  declarations: [SelectServicePage],
  imports: [IonicPageModule.forChild(SelectServicePage), IonicModule],
  exports: [SelectServicePage]
})
export class SelectServicePageModule {}
