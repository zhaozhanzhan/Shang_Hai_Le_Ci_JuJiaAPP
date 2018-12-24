import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { EvalStepOnePage } from "./eval-step-one";

@NgModule({
  declarations: [EvalStepOnePage],
  imports: [IonicPageModule.forChild(EvalStepOnePage), IonicModule],
  exports: [EvalStepOnePage]
})
export class EvalStepOnePageModule {}
