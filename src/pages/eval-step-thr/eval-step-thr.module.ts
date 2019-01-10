import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { EvalStepThrPage } from "./eval-step-thr";

@NgModule({
  declarations: [EvalStepThrPage],
  imports: [IonicPageModule.forChild(EvalStepThrPage), IonicModule],
  exports: [EvalStepThrPage]
})
export class EvalStepThrPageModule {}
