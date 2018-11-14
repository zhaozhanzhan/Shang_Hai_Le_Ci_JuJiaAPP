import { IonicModule } from "ionic-angular";
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { CancleCollagePage } from "./cancle-collage";

@NgModule({
  declarations: [CancleCollagePage],
  imports: [IonicPageModule.forChild(CancleCollagePage), IonicModule],
  exports: [CancleCollagePage]
})
export class CancleCollagePageModule {}
