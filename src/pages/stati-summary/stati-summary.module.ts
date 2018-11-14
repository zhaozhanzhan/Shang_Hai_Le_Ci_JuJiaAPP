import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { StatiSummaryPage } from "./stati-summary";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [StatiSummaryPage],
  imports: [
    IonicPageModule.forChild(StatiSummaryPage),
    IonicModule,
    PipesModule
  ],
  exports: [IonicModule]
})
export class StatiSummaryPageModule {}
