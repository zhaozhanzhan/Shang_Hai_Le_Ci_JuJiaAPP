import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { UserListPage } from "./user-list";

@NgModule({
  declarations: [UserListPage],
  imports: [IonicPageModule.forChild(UserListPage), IonicModule],
  exports: [UserListPage]
})
export class UserListPageModule {}
