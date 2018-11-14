import { NgModule } from "@angular/core";
import { IonicPageModule, IonicModule } from "ionic-angular";
import { MultiPickerModule } from "ion-multi-picker";
import { ComponentsModule } from "../../common/component/components.module";
import { OrderEditPage } from "./order-edit";

@NgModule({
  declarations: [OrderEditPage],
  imports: [
    IonicPageModule.forChild(OrderEditPage),
    IonicModule,
    MultiPickerModule,
    ComponentsModule
  ],
  exports: [OrderEditPage]
})
export class OrderEditPageModule {}
