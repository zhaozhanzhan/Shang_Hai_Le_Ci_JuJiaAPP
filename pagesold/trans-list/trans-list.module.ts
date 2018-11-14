import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { TransListPage } from "./trans-list";

@NgModule({
  declarations: [TransListPage],
  imports: [IonicPageModule.forChild(TransListPage), IonicModule],
  exports: [TransListPage]
})
export class TransListPageModule {}
