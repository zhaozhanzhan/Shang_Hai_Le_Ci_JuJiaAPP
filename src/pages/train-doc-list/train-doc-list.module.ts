import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { TrainDocListPage } from "./train-doc-list";

@NgModule({
  declarations: [TrainDocListPage],
  imports: [IonicPageModule.forChild(TrainDocListPage), IonicModule],
  exports: [TrainDocListPage]
})
export class TrainDocListPageModule {}
