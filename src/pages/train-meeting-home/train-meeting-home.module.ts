import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { TrainMeetingHomePage } from "./train-meeting-home";

@NgModule({
  declarations: [TrainMeetingHomePage],
  imports: [IonicPageModule.forChild(TrainMeetingHomePage), IonicModule],
  exports: [TrainMeetingHomePage]
})
export class TrainMeetingHomePageModule {}
