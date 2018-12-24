import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { InfoBulletinDetailPage } from "./info-bulletin-detail";
import { ComponentsModule } from "../../common/component/components.module";

@NgModule({
  declarations: [InfoBulletinDetailPage],
  imports: [
    IonicPageModule.forChild(InfoBulletinDetailPage),
    IonicModule,
    ComponentsModule
  ],
  exports: [InfoBulletinDetailPage]
})
export class InfoBulletinDetailPageModule {}
