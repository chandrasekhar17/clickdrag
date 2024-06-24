import { Component, OnInit } from '@angular/core';
import { InputType, AlertType } from '@mhe/ngx-shared';

@Component({
  selector: 'app-labels-setting',
  templateUrl: './labels-setting.component.html',
  styleUrls: ['./labels-setting.component.scss'],
})
export class LabelsSettingComponent implements OnInit {
  inputType = InputType;
  alertType = AlertType;
  constructor() {}

  ngOnInit(): void {}
}
