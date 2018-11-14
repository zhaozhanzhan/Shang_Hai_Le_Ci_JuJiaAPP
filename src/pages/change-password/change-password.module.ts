import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ChangePasswordPage } from "./change-password";

@NgModule({
  declarations: [ChangePasswordPage],
  imports: [IonicPageModule.forChild(ChangePasswordPage), IonicModule],
  exports: [IonicModule]
})
export class ChangePasswordPageModule {}
