import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { ComprQueryHomePage } from "./compr-query-home";

@NgModule({
  declarations: [ComprQueryHomePage],
  imports: [IonicPageModule.forChild(ComprQueryHomePage), IonicModule],
  exports: [ComprQueryHomePage]
})
export class ComprQueryHomePageModule {}
