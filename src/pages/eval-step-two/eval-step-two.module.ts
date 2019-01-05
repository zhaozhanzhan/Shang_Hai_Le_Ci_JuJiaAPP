import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { EvalStepTwoPage } from "./eval-step-two";

@NgModule({
  declarations: [EvalStepTwoPage],
  imports: [IonicPageModule.forChild(EvalStepTwoPage), IonicModule],
  exports: [EvalStepTwoPage]
})
export class EvalStepTwoPageModule {}
