import { Component, EventEmitter, Output, Input } from "@angular/core";
import { Http } from "@angular/http";
import { GlobalService } from "../../../service/GlobalService";
import { HttpReqService } from "../../../service/HttpUtils.Service";
import { PickerController } from "ionic-angular";

@Component({
  selector: "select-area",
  templateUrl: "select-area.html"
})
export class SelectAreaComponent {
  //========================用法示例 Begin=====================//
  // <ion-item no-padding>
  //     <ion-label class="ftz15" (tap)="showAreasSelect()">选择地区:</ion-label>
  // </ion-item>
  // <select-area #selectArea [level]="3" separator="-" (cancel)="closeSelect()" (done)="done($event)"></select-area>

  // @ViewChild("selectArea")
  // selectArea;
  // showAreasSelect() {
  //   console.error("this.selectArea.open");
  //   this.selectArea.open();
  // }
  // done(data) {
  //   console.error(data);
  // }
  // closeSelect() {
  //   console.error("you click close");
  // }

  // import { Component, ViewChild, ElementRef, Injector } from "@angular/core";
  // protected elemRef: ElementRef,
  // protected inject: Injector
  //========================用法示例 End=====================//

  public cityArr: any = []; // 城市数据
  public picker;
  public provinceCol = 0; // 省列
  public cityCol = 0; // 市列
  public regionCol = 0; // 区列
  public pickerColumnCmps; // picker纵列数据实例
  public isOpen = false; //  是否被创建
  public pickerCmp; // picker 实例
  public value = ""; // 选中后的数据

  @Input()
  citiesData = this.cityArr; // 地区数据
  @Input()
  cancelText = "关闭"; // 关闭按钮文本
  @Input()
  doneText = "完成"; // 完成按钮文本
  @Input()
  separator = ""; // 数据衔接模式
  @Input()
  level = 3; // 等级设置 最高为三级

  /**
   *  关闭时触发的事件
   *  没有值返回
   * @type {EventEmitter}
   */
  @Output()
  cancel: EventEmitter<any> = new EventEmitter(); // 关闭事件

  /**
   *  完成时触发的事件
   *  返回值为obj
   *  obj = {data: object,value: string} data为对应的省市区和编码
   * @type {EventEmitter}
   */
  @Output()
  done: EventEmitter<any> = new EventEmitter(); // 完成事件

  constructor(
    public http: Http,
    public gloService: GlobalService, // 全局自定义服务
    public httpReq: HttpReqService, // Http请求服务
    protected Picker: PickerController
  ) {
    this.getCityData(data => {
      this.cityArr = data["data"];
      this.citiesData = this.cityArr;
    });
  }

  /**
   * 获取城市数据
   * @public
   * @returns
   * @memberof SelectCityService
   */
  public getCityData(suc) {
    this.httpReq.getJson("./assets/json/city4.json", data => {
      suc(data);
    });
  }

  /**
   *  打开地区选择器
   *  基本思路
   *  1.创建picker
   * 2. 先把数据处理成省市区分开的数组
   * 3. 将数据以列的形式给到picker
   * 4. 设置数据显示样式（picker）
   * 5. 生成picker
   */
  public open() {
    let pickerOptions = {
      buttons: [
        {
          text: this.cancelText,
          role: "cancel",
          handler: () => {
            this.cancel.emit(null); // 取消事件执行
          }
        },
        {
          text: this.doneText,
          handler: data => {
            this.onChange(data); // 改变value值的显示
            this.done.emit({
              data: data,
              value: this.value
            }); // 选择完成事件执行
          }
        }
      ]
    };
    this.picker = this.Picker.create(pickerOptions); // 创建选择器
    this.generate(); // 加载对数据进行处理，并移交给picker
    this.validate(this.picker); // 渲染验证数据
    this.picker.ionChange.subscribe(() => {
      // Change事件执行
      // console.error("Change事件执行===============");
      this.validate(this.picker); // 渲染验证数据
    });

    // 生成
    this.picker.present(pickerOptions).then(() => {
      this.pickerCmp = this.picker.instance;
      this.pickerColumnCmps = this.pickerCmp._cols.toArray();
      this.pickerColumnCmps.forEach(col => {
        return (col.lastIndex = -1);
      });
    });

    this.isOpen = true; // 是否被创建

    this.picker.onDidDismiss(() => {
      // 关闭选择器
      this.isOpen = false; // 是否被创建
    });
  }

  /**
   * 对数据进行处理，并移交给picker
   */
  public generate() {
    let values = this.value.toString().split(this.separator); // 选中后的数据用定义的符号分割成数组
    // console.error("this.value=============", values);
    // 添加省份数据到选择器 picker
    let provinceCol = {
      name: "province",
      options: this.citiesData.map(province => {
        // 每个省的数据
        // console.error("province==============", province);
        return { text: province.name, value: province.code, disabled: false };
      }),
      selectedIndex: 0
    };

    // 数组实例的findIndex方法的用法返回第一个符合条件的数组成员的位置，如果所有成员都不符合条件，则返回-1
    let provinceIndex = this.citiesData.findIndex(option => {
      // console.error("option==============", option);
      return option.name == values[0];
    });

    provinceIndex = provinceIndex === -1 ? 0 : provinceIndex; // 省的索引

    provinceCol.selectedIndex = provinceIndex;
    // console.error("provinceCol==============", provinceCol);

    this.picker.addColumn(provinceCol); // 添加省列数据

    // 添加城市数据到选择器picker
    let cityColData = this.citiesData[provinceCol.selectedIndex].children; // 城市数据
    let cityCol;

    if (this.level >= 2) {
      // 判断是几级联动，如果为二级联动，
      cityCol = {
        name: "city",
        options: cityColData.map(city => {
          return { text: city.name, value: city.code, disabled: false };
        }),
        selectedIndex: 0
      };
      let cityIndex = cityColData.findIndex(option => {
        return option.name == values[1];
      });
      cityIndex = cityIndex === -1 ? 0 : cityIndex;
      cityCol.selectedIndex = cityIndex;
      this.picker.addColumn(cityCol); // 添加城市列表数据
    }

    let regionData, regionCol;
    if (this.level === 3) {
      // 判断是几级联动，如果为三级联动，
      regionData = this.citiesData[provinceCol.selectedIndex].children[
        cityCol.selectedIndex
      ].children;
      regionCol = {
        name: "region",
        options: regionData.map(city => {
          return { text: city.name, value: city.code, disabled: false };
        }),
        selectedIndex: 0
      };
      let regionIndex = regionData.findIndex(option => {
        return option.name == values[2];
      });
      regionIndex = regionIndex === -1 ? 0 : regionIndex;
      regionCol.selectedIndex = regionIndex;
      this.picker.addColumn(regionCol); // 添加区列表数据
    }
    this.divyColumns(this.picker); // 设置数据显示样式
  }

  /**
   * 设置数据显示样式
   * @param picker
   */
  public divyColumns(picker) {
    let pickerColumns = this.picker.getColumns(); // 获取所有列数据
    // console.error("this.picker.getColumns=====", pickerColumns);
    let columns = [];
    pickerColumns.forEach((col, i) => {
      columns.push(0);
      col.options.forEach(opt => {
        if (opt && opt.text && opt.text.length > columns[i]) {
          columns[i] = opt.text.length;
        }
      });
    });
    if (columns.length === 2) {
      // 如果有两列，计算列宽
      let width = Math.max(columns[0], columns[1]);
      pickerColumns[0].align = "right";
      pickerColumns[1].align = "left";
      pickerColumns[0].optionsWidth = pickerColumns[1].optionsWidth =
        width * 17 + "px";
    } else if (columns.length === 3) {
      // 如果有三列，计算列宽
      let width = Math.max(columns[0], columns[2]);
      pickerColumns[0].align = "right";
      pickerColumns[1].columnWidth = columns[1] * 33 + "px";
      pickerColumns[0].optionsWidth = pickerColumns[2].optionsWidth =
        width * 17 + "px";
      pickerColumns[2].align = "left";
    }
  }

  /**
   * 验证数据
   * @param picker
   */
  public validate(picker) {
    let that = this;
    let columns = picker.getColumns();
    // console.error("columns==========", columns);
    let provinceCol = columns[0];
    let cityCol = columns[1];
    let regionCol = columns[2];
    if (cityCol && this.provinceCol != provinceCol.selectedIndex) {
      cityCol.selectedIndex = 0;
      let cityColData = this.citiesData[provinceCol.selectedIndex].children;
      cityCol.options = cityColData.map(city => {
        return { text: city.name, value: city.code, disabled: false };
      });
      if (this.pickerColumnCmps && cityCol.options.length > 0) {
        setTimeout(() => {
          return that.pickerColumnCmps[1].setSelected(0, 100);
        }, 0);
      }
    }
    if (
      regionCol &&
      (this.cityCol != cityCol.selectedIndex ||
        this.provinceCol != provinceCol.selectedIndex)
    ) {
      let regionData = this.citiesData[provinceCol.selectedIndex].children[
        cityCol.selectedIndex
      ].children;
      regionCol.selectedIndex = 0;
      regionCol.options = regionData.map(city => {
        return { text: city.name, value: city.code, disabled: false };
      });
      if (this.pickerColumnCmps && regionCol.options.length > 0) {
        setTimeout(() => {
          return that.pickerColumnCmps[2].setSelected(0, 100);
        }, 0);
      }
    }
    this.provinceCol = provinceCol.selectedIndex;
    this.cityCol = cityCol ? cityCol.selectedIndex : 0;
    this.regionCol = regionCol ? regionCol.selectedIndex : 0;
  }

  /**
   * 设置value
   * @param newData
   */
  public setValue(newData) {
    if (newData === null || newData === undefined) {
      this.value = "";
    } else {
      this.value = newData;
    }
  }

  /**
   * 获取value值
   * @returns {string}
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * 改变value值的显示
   * @param val
   */
  public onChange(val) {
    this.setValue(this.getString(val));
  }

  /**
   *  获取当前选择的地区数据
   * @param newData
   * @returns {string}
   */
  public getString(newData): string {
    if (newData["city"]) {
      if (newData["region"]) {
        return (
          "" +
          newData["province"].text +
          this.separator +
          (newData["city"].text || "") +
          this.separator +
          (newData["region"].text || "")
        );
      }
      return (
        "" +
        newData["province"].text +
        this.separator +
        (newData["city"].text || "")
      );
    }
    return "" + newData["province"].text;
  }
}
