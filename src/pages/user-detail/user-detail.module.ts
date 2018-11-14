import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { UserDetailPage } from "./user-detail";

@NgModule({
  declarations: [UserDetailPage],
  imports: [IonicPageModule.forChild(UserDetailPage), IonicModule],
  exports: [UserDetailPage]
})
export class UserDetailPageModule {}
