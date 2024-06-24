import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MheOption, AlertType } from '@mhe/ngx-shared';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { CdStateService } from '../../../../../services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../../../../shared/constants/appconfig';

@Component({
  selector: 'app-magnify',
  templateUrl: './magnify.component.html',
  styleUrls: ['./magnify.component.scss'],
})
export class MagnifyComponent implements OnInit {
  alertType = AlertType;
  magnifyOptions: MheOption[] = [
    { value: 2, viewValue: '200%' },
    { value: 4, viewValue: '400%' },
    { value: 6, viewValue: '600%' },
  ];
  selectedMagnifyOptions: MheOption[];
  magnifySettingForm: FormGroup;
  showMagnifyWarning: boolean = false;
  warningMsg: string;
  state: any;

  constructor(private cdService: CdStateService, private undoRedoService: UndoRedoService) {
    this.state = cdService.getState();
  }

  ngOnInit(): void {
    this.magnifySettingForm = new FormGroup(
      {
        width: new FormControl(this.state.magnifySettings.width, [
          Validators.required,
          Validators.min(APP_CONFIG.MIN_MAGNIFY_WIDTH),
          Validators.max(APP_CONFIG.MAX_MAGNIFY_WIDTH),
        ]),
        height: new FormControl(this.state.magnifySettings.height, [
          Validators.required,
          Validators.min(APP_CONFIG.MIN_MAGNIFY_HEIGHT),
          Validators.max(APP_CONFIG.MAX_MAGNIFY_HEIGHT),
        ]),
      },
      { updateOn: 'blur' }
    );
    this.magnifySettingForm.valueChanges.subscribe((val) => {
      if (!this.undoRedoService.isMagnifyFromUndoRedo) {
        const undoObj = {
          actionName: 'magnify-width-height',
          actionData: {
            old: this.cdService.getMagnifySettingWithoutRef(),
            new: {},
          },
        };
        if (this.magnifySettingForm.status === 'VALID') {
          if (this.showMagnifyWarning) {
            this.showMagnifyWarning = false;
          }
          this.cdService.updateMagnifySize(val.width, val.height);
        } else {
          this.magnifyWarning(val);
        }
        undoObj.actionData.new = this.cdService.getMagnifySettingWithoutRef();
        this.undoRedoService.updateUndoArray(undoObj);
      }
    });

    this.cdService.stateUpdated.subscribe(() => {
      let magnifySettings = this.cdService.getState().magnifySettings;
      this.undoRedoService.isMagnifyFromUndoRedo = true;
      this.magnifySettingForm.controls['width'].setValue(magnifySettings.width);
      this.magnifySettingForm.controls['height'].setValue(magnifySettings.height);
      this.setScaleForMagnify(magnifySettings.scale);
      this.undoRedoService.isMagnifyFromUndoRedo = false;
    });

    this.setMagnifyOptions();
  }

  setScaleForMagnify(scale) {
    const prIndex = this.magnifyOptions.findIndex((x) => x.value === scale);
    this.selectedMagnifyOptions = [this.magnifyOptions[prIndex]];
  }

  setMagnifyOptions() {
    const selectedOptions = this.magnifyOptions.filter((item) => item.value === this.state.magnifySettings.scale);
    this.selectedMagnifyOptions = [...selectedOptions];
  }

  onMagnifyChange(selectedOptions: MheOption[]) {
    const undoObj = {
      actionName: 'magnify-options',
      actionData: {
        old: this.cdService.getMagnifySettingWithoutRef(),
        new: {},
      },
    };
    this.selectedMagnifyOptions = [...selectedOptions];
    this.state.magnifySettings.scale = selectedOptions[0].value;
    undoObj.actionData.new = this.cdService.getMagnifySettingWithoutRef();
    this.undoRedoService.updateUndoArray(undoObj);
  }

  onShowAuthoring(event: boolean) {
    this.state.magnifySettings.enabled = event;
  }

  magnifyWarning(value: { width: number; height: number }) {
    const { width, height } = value;
    const min = APP_CONFIG.MIN_MAGNIFY_WIDTH;
    const max = APP_CONFIG.MAX_MAGNIFY_WIDTH;
    switch (true) {
      case width < min:
        this.warningMsg = `The width of the image preview box must be greater than or equal to ${min}px.`;
        break;
      case width > max:
        this.warningMsg = `The width of the image preview box cannot be greater than ${max}px.`;
        break;
      case height < min:
        this.warningMsg = `The height of the image preview box must be greater than or equal to ${min}px.`;
        break;
      case height > max:
        this.warningMsg = `The height of the image preview box cannot be greater than ${max}px.`;
        break;
    }
    this.showMagnifyWarning = true;
  }
}
