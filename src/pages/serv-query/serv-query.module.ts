import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ServQueryPage } from "./serv-query";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [ServQueryPage],
  imports: [IonicPageModule.forChild(ServQueryPage), IonicModule, PipesModule],
  exports: [ServQueryPage]
})
export class ServQueryPageModule {}
