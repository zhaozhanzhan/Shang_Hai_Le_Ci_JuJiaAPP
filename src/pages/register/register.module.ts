import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { RegisterPage } from "./register";

@NgModule({
  declarations: [RegisterPage],
  imports: [IonicPageModule.forChild(RegisterPage), IonicModule],
  exports: [RegisterPage]
})
export class RegisterPageModule {}
