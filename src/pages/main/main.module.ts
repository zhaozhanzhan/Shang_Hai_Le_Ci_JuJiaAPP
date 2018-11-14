import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { MainPage } from "./main";
import { SideMenuPage } from "../side-menu/side-menu";
import { HomePage } from "../home/home";

@NgModule({
  declarations: [MainPage, SideMenuPage, HomePage],
  imports: [IonicPageModule.forChild(MainPage), IonicModule],
  entryComponents: [MainPage, SideMenuPage, HomePage]
})
export class MainPageModule {}
