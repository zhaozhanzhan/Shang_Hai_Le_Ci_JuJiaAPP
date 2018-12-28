import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { CardReadPage } from "./card-read";
import { PipesModule } from "../../common/pipe/pipes.module";

@NgModule({
  declarations: [CardReadPage],
  imports: [IonicPageModule.forChild(CardReadPage), IonicModule, PipesModule],
  exports: [CardReadPage]
})
export class CardReadPageModule {}
