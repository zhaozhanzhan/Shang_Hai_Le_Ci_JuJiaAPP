import { NgModule } from "@angular/core";
import { HttpReqService } from "./service/HttpUtils.Service";
import { JsUtilsService } from "./service/JsUtils.Service";
import { FormValidService } from "./service/FormValid.Service";
import { GlobalService } from "./service/GlobalService";
import { PushService } from "./service/Push.Service";
import { ParamService } from "./service/Param.Service";
import { BackButtonService } from "./service/BackButton.Service";
import { AppUpdateService } from "./service/AppUpdate.Service";
import { SelectCityService } from "./service/SelectCity.Service";
import { PipesModule } from "./pipe/pipes.module";
import { ComponentsModule } from "./component/components.module";
import { FilePreviewService } from "./service/FilePreview.Service";
import { ServiceNotification } from "./service/ServiceNotification";
@NgModule({
  imports: [PipesModule, ComponentsModule],
  declarations: [],
  exports: [],
  entryComponents: [],
  providers: [
    HttpReqService,
    JsUtilsService,
    FormValidService,
    GlobalService,
    PushService,
    ParamService,
    BackButtonService,
    AppUpdateService,
    SelectCityService,
    FilePreviewService,
    ServiceNotification
  ]
})
export class CommonServiceModule {}
