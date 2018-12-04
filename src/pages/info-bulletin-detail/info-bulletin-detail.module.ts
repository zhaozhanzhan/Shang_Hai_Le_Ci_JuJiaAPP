import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { InfoBulletinDetailPage } from "./info-bulletin-detail";

@NgModule({
  declarations: [InfoBulletinDetailPage],
  imports: [IonicPageModule.forChild(InfoBulletinDetailPage), IonicModule],
  exports: [InfoBulletinDetailPage]
})
export class InfoBulletinDetailPageModule {}
