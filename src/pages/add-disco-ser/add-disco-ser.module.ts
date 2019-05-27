import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { AddDiscoSerPage } from "./add-disco-ser";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [AddDiscoSerPage],
  imports: [
    IonicPageModule.forChild(AddDiscoSerPage),
    IonicModule,
    PipesModule
  ],
  exports: [AddDiscoSerPage]
})
export class AddDiscoSerPageModule {}
