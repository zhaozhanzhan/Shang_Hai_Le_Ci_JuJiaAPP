import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { TrainMeetingListPage } from "./train-meeting-list";

@NgModule({
  declarations: [TrainMeetingListPage],
  imports: [IonicPageModule.forChild(TrainMeetingListPage), IonicModule],
  exports: [TrainMeetingListPage]
})
export class TrainMeetingListPageModule {}
