import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SelectCollagePage } from "./select-collage";

@NgModule({
  declarations: [SelectCollagePage],
  imports: [IonicPageModule.forChild(SelectCollagePage), IonicModule],
  exports: [SelectCollagePage]
})
export class SelectCollagePageModule {}
