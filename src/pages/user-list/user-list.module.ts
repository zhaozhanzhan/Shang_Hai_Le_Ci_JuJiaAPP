import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { UserListPage } from "./user-list";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [UserListPage],
  imports: [IonicPageModule.forChild(UserListPage), IonicModule, PipesModule],
  exports: [UserListPage]
})
export class UserListPageModule {}
