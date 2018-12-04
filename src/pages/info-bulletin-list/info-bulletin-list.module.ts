import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { InfoBulletinListPage } from "./info-bulletin-list";

@NgModule({
  declarations: [InfoBulletinListPage],
  imports: [IonicPageModule.forChild(InfoBulletinListPage), IonicModule],
  exports: [InfoBulletinListPage]
})
export class InfoBulletinListPageModule {}
