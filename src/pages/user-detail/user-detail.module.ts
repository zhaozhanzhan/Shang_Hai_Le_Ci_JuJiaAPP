import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { UserDetailPage } from "./user-detail";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [UserDetailPage],
  imports: [IonicPageModule.forChild(UserDetailPage), IonicModule, PipesModule],
  exports: [UserDetailPage]
})
export class UserDetailPageModule {}
