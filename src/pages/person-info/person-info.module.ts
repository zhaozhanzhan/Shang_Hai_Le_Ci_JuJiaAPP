import { IonicModule } from "ionic-angular";
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { PersonInfoPage } from "./person-info";
import { PipesModule } from "../../common/pipe/pipes.module";
import { ComponentsModule } from "../../common/component/components.module";

@NgModule({
  declarations: [PersonInfoPage],
  imports: [
    IonicPageModule.forChild(PersonInfoPage),
    IonicModule,
    PipesModule,
    ComponentsModule
  ],
  exports: [PersonInfoPage]
})
export class PersonInfoPageModule {}
