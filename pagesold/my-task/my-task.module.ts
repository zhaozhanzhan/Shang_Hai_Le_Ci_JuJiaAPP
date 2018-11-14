import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { MyTaskPage } from "./my-task";
@NgModule({
  declarations: [MyTaskPage],
  imports: [IonicPageModule.forChild(MyTaskPage), IonicModule],
  exports: [MyTaskPage]
})
export class MyTaskPageModule {}
