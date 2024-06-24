import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ButtonPurpose, AlertType } from '@mhe/ngx-shared';
import { CdStateService } from '../../../../../services/cd-state/cd-state.service';
import { StageRulerService } from '../../../../../services/stage-ruler/stage-ruler.service';
import { ModalService } from '../../../../../services/modal-popup/modal.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { APP_CONFIG } from '../../../../../shared/constants/appconfig';

@Component({
  selector: 'app-canvas-setting',
  templateUrl: './canvas-setting.component.html',
  styleUrls: ['./canvas-setting.component.scss'],
})
export class CanvasSettingComponent implements OnInit {
  buttonPurpose = ButtonPurpose;
  alertType = AlertType;
  state: any;
  canvasSettingForm: FormGroup;
  showCanvasWarning = false;
  config: any;
  constructor(
    private cdStateService: CdStateService,
    private guide: StageRulerService,
    private modal: ModalService,
    private undoRedoService: UndoRedoService
  ) {
    this.config = APP_CONFIG;
    this.state = cdStateService.getState();
    cdStateService.stateUpdated.subscribe((value) => {
      //update the width and height of canvas tool field when state get updated
      if (value) {
        this.updateState();
      }
    });

    cdStateService.guideLineDelete.subscribe((value) => {
      if (value) {
        this.onDeleteGuides();
      }
    });
  }

  updateState() {
    if (this.canvasSettingForm) {
      this.canvasSettingForm.setValue({
        width: this.state.canvas.width,
        height: this.state.canvas.height,
      });
    }
  }

  ngOnInit() {
    this.canvasSettingForm = new FormGroup(
      {
        width: new FormControl(this.state.canvas.width, [
          Validators.required,
          Validators.min(this.config.MIN_CANVAS_WIDTH),
        ]),
        height: new FormControl(this.state.canvas.height, [
          Validators.required,
          Validators.min(this.config.MIN_CANVAS_HEIGHT),
        ]),
      },
      { updateOn: 'blur' }
    );
    this.canvasSettingForm.valueChanges.subscribe((val) => {
      if (this.canvasSettingForm.status === 'VALID') {
        if (this.showCanvasWarning) {
          this.showCanvasWarning = false;
        }
        this.cdStateService.updateIframeSize(val.width, val.height);
      } else {
        this.showCanvasWarning = true;
      }
    });
  }

  onCanvasChange(width, height) {
    const currentActivity = this.state.activity.name;
    const undoObj = {
      actionName: 'canvas-change',
      actionData: {
        old: this.cdStateService.getDataOfFields(),
        new: {},
      },
    };
    const isInViewport = this.cdStateService.checkIsElementInViewport(width, height);
    if (currentActivity === 'grouping' && isInViewport && isInViewport.width) {
      isInViewport.width = true;
    }
    if (isInViewport === true) {
      this.canvasSettingForm.setValue({
        width: width,
        height: height,
      });
      undoObj.actionData.new = this.cdStateService.getDataOfFields();
      this.undoRedoService.updateUndoArray(undoObj);
    } else {
      if (width < this.config.MIN_CANVAS_WIDTH || height < this.config.MIN_CANVAS_HEIGHT) {
        this.canvasSettingForm.setValue({
          width: width,
          height: height,
        });
        undoObj.actionData.new = this.cdStateService.getDataOfFields();
        this.undoRedoService.updateUndoArray(undoObj);
      } else {
        this.onShowWarningPopup(isInViewport);
      }
    }
    this.cdStateService.checkForMaxBoundryHeight();
  }

  updateGuideAndGrid(
    event: boolean,
    type: 'showGrid' | 'hideGuide' | 'lockGuide' | 'snapGuide' | string,
    isUndoAllowed?
  ): void {
    this.state.canvas[type] = event;
    let undoObj;
    if (isUndoAllowed) {
      undoObj = {
        actionName: 'updateGuidesAndGrid',
        actionData: {
          old: { type, event },
          new: {},
        },
      };
    }

    switch (type) {
      case 'hideGuide':
        this.guide.hideGuides(event);
    }
    if (isUndoAllowed) {
      undoObj.actionData.new = { type, event };
      this.undoRedoService.updateUndoArray(undoObj);
    }
  }

  showDeleteGuidesPopup() {
    this.modal.guideDeleteModal();
  }

  onDeleteGuides() {
    const guideProperty = ['hideGuide', 'lockGuide', 'snapGuide'];
    guideProperty.forEach((item) => {
      this.updateGuideAndGrid(false, item, false);
    });
    this.guide.removeGuides(true);
  }

  checkDeleteDisabled() {
    if (this.state.canvas.guide.hGuide.length > 0) {
      return false;
    } else if (this.state.canvas.guide.vGuide.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  onShowWarningPopup(value) {
    const keys = Object.keys(value);
    const returnValue = keys.filter((key) => {
      return !value[key];
    });
    this.modal.viewPortWarning(returnValue[0]);
    this.updateState();
  }
}
