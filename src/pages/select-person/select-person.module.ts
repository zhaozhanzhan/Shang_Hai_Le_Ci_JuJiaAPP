import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SelectPersonPage } from "./select-person";

@NgModule({
  declarations: [SelectPersonPage],
  imports: [IonicPageModule.forChild(SelectPersonPage), IonicModule],
  exports: [SelectPersonPage]
})
export class SelectPersonPageModule {}
