import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { DiscoSerListPage } from "./disco-ser-list";

@NgModule({
  declarations: [DiscoSerListPage],
  imports: [IonicPageModule.forChild(DiscoSerListPage), IonicModule],
  exports: [DiscoSerListPage]
})
export class DiscoSerListPageModule {}
