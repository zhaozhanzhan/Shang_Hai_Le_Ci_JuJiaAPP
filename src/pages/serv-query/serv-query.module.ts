import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServQueryPage } from "./serv-query";

@NgModule({
  declarations: [ServQueryPage],
  imports: [IonicPageModule.forChild(ServQueryPage), IonicModule],
  exports: [ServQueryPage]
})
export class ServQueryPageModule {}
