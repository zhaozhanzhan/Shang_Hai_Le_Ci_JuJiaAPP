import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { CardReadPage } from "./card-read";

@NgModule({
  declarations: [CardReadPage],
  imports: [IonicPageModule.forChild(CardReadPage), IonicModule],
  exports: [CardReadPage]
})
export class CardReadPageModule {}
