import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { SelectServicePage } from "./select-service";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [SelectServicePage],
  imports: [
    IonicPageModule.forChild(SelectServicePage),
    IonicModule,
    PipesModule
  ],
  exports: [SelectServicePage]
})
export class SelectServicePageModule {}
