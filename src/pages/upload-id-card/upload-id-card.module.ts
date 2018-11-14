import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { UploadIdCardPage } from "./upload-id-card";

@NgModule({
  declarations: [UploadIdCardPage],
  imports: [IonicPageModule.forChild(UploadIdCardPage), IonicModule],
  exports: [UploadIdCardPage]
})
export class UploadIdCardPageModule {}
