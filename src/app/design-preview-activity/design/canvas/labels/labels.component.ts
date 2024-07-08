import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ButtonPurpose, ButtonType, MheOption } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { APP_CONFIG } from '../../../../../../src/app/shared/constants/appconfig';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ReorderLabelsService } from '../../services/reorder-labels.service';
import { DragAndDropServiceService } from 'src/app/shared/services/drag-and-drop-service.service';
import { fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/services/config-translator/appConfig.service';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
})
export class LabelsComponent implements OnInit {
  labelItem;
  _buttonPurpose = ButtonPurpose;
  buttonType = ButtonType;
  labelList = [];
  labelOptionsSize = [];
  labelText: string;
  imageWidth = [];
  imageHeight = [];
  state: any;
  dragPlaceHolderHeight = 0;
  reorderLabel: any;

  mousemove;
  mouseMoveSub;

  labelOptions: any[];
  distractorOptions: MheOption[];
  mode;

  @ViewChild('labelElement') labelElement: ElementRef;
  isHighlightLabels = [];
  yScrolling: any;
  constructor(
    public cdStateService: CdStateService,
    private modalPopupService: ModalService,
    private undoRedoService: UndoRedoService,
    private reorderService: ReorderLabelsService,
    private dragDropService: DragAndDropServiceService,
    private translate: TranslateService,
    private appConfigService: AppConfigService
  ) {
    this.labelList = cdStateService.getState().labelData.labels;
  }

  async ngOnInit(): Promise<void> {
    await this.appConfigService.loadTranslations();
    this.mode = EZ.mode;
    this.checkForLabelAndDistractorOptions(0);
    this.state = this.cdStateService.getState();
    this.labelList = this.state.labelData.labels;
    this.reorderService.reorderLabels.subscribe((value) => {
      this.reorderLabel = value;
    });
    console.log(this.labelOptions)
    this.labelOptions = this.translateLabelOptions(APP_CONFIG.NEW_LABEL_OPTIONS);
    // this.labelOptions = this.translateLabelOptions(this.labelOptions);
  }
  translateLabelOptions(options: { [key: string]: string }): any[] {
    return Object.keys(options).map(key => {
      const translatedValue = this.translate.instant(options[key]);
      return { value: key, viewValue: translatedValue };
    });
  }
  disableOption(optionToDisable, distractor?) {
    const options = distractor === 'distractor' ? this.distractorOptions : this.labelOptions;
    for (let option of options) {
      if (option.viewValue === optionToDisable) {
        option.disabled = true;
      }
    }
  }
  enableOption(optionToEnable, distractor?) {
    const options = distractor === 'distractor' ? this.distractorOptions : this.labelOptions;
    for (let option of options) {
      if (option.viewValue === optionToEnable) {
        option.disabled = false;
      }
    }
  }

  onImageLoad(event, i) {
    if (event.target.width > event.target.height) {
      this.imageWidth[i] = 120;
    } else {
      this.imageHeight[i] = 120;
    }
  }

  checkForLabelAndDistractorOptions(index?) {
    let state = this.cdStateService.getState();
    let mediaType = state.labelData.labels[index].mediaType;
    let labelInteraction = state.activity.options.labelInteraction;
    let labelOccurence = state.activity.options.typeOfOccurrence;
    let activityType = state.activity.name;
    this.distractorOptions =
      mediaType === 'image'
        ? APP_CONFIG.DISTRACTOR_OPTIONS_BOTH_CASE_WITH_IMAGE
        : APP_CONFIG.DISTRACTOR_OPTIONS_BOTH_CASE;
    if (
      activityType === 'labeling' &&
      ((labelInteraction === 'one-label-multiple-dock' && labelOccurence === 'display-once') ||
        labelOccurence === 'display-each-instance')
    ) {
      this.labelOptions =
        mediaType === 'image'
          ? APP_CONFIG.LABEL_OPTIONS_SAME_LABEL_TO_MULTIPLE_DOCK_WITH_IMAGE
          : APP_CONFIG.LABEL_OPTIONS_SAME_LABEL_TO_MULTIPLE_DOCK;
    } else {
      this.labelOptions =
        mediaType === 'image'
          ? APP_CONFIG.LABEL_OPTIONS_SAME_LABEL_TO_SAME_DOCK_WITH_IMAGE
          : APP_CONFIG.LABEL_OPTIONS_SAME_LABEL_TO_SAME_DOCK;
    }
  }

  kebabClick(index) {
    this.cdStateService.labelIndex = index;
    let state = this.cdStateService.getState();
    let labelSize = state.labelData.labels.length;
    if (labelSize <= 2) {
      this.disableOption('Delete');
      this.disableOption('Mark as Distractor');
    }
    this.checkForLabelAndDistractorOptions(index);
    this.validationForDisablingKebabOptions(index);
  }

  onDropDownSelection(event, index) {
    console.log('Dropdown Selection Event:', event);
    this.cdStateService.labelIndex = index;
    const state = this.cdStateService.getState();
    let labelSize = state.labelData.labels.length;
    let labelData = state.labelData.labels[index];
    const undoObj = {
      actionName: 'kebab-options',
      actionData: {
        old: this.cdStateService.getDataOfFields(),
        new: {},
      },
    };
    switch (event[0].viewValue) {
      case APP_CONFIG.LABEL_OPTIONS.ADD_LABEL_BELOW:
        if (labelSize < 20) this.cdStateService.addLabelData(false, index);
        break;

      case APP_CONFIG.LABEL_OPTIONS.MARK_AS_DISTRACTOR:
        if (labelSize > 2) this.cdStateService.markAsDistractor(index);
        break;

      case APP_CONFIG.LABEL_OPTIONS.ADD_DROPZONE:
        this.cdStateService.addDropZone(index);
        break;

      case APP_CONFIG.LABEL_OPTIONS.MARK_AS_LABEL:
        this.cdStateService.markAsLabel(index);
        break;

      case APP_CONFIG.LABEL_OPTIONS.DELETE:
        if (labelSize > 2) {
          this.modalPopupService.showDeleteLabelModal(index);
        }
        break;

      case APP_CONFIG.LABEL_OPTIONS.EDIT:
        this.modalPopupService.showAddLabelModal();
        break;
      default:
        console.log('Default case in dropdown selection');
        break;
    }
    if (event[0].viewValue !== 'Edit' && event[0].viewValue !== 'Delete') {
      undoObj.actionData.new = this.cdStateService.getDataOfFields();
      this.undoRedoService.updateUndoArray(undoObj);
    }

    this.cdStateService.stateUpdated.subscribe((value) => {
      this.validationForDisablingKebabOptions();
    });
  }
  validationForDisablingKebabOptions(index?) {
    let state = this.cdStateService.getState();
    let labelSize = state.labelData.labels.length;
    let labelData = state.labelData;
    let indexOfLabel = !index ? this.cdStateService.labelIndex : index;
    let dockedTo = state.labelData.labels[indexOfLabel] ? state.labelData.labels[indexOfLabel].dockedTo : [];

    if (labelSize <= 2) {
      this.disableOption('Delete');
      this.disableOption('Mark as Distractor');
    } else {
      this.enableOption('Delete');
      this.enableOption('Mark as Distractor');
    }
    if (labelSize > 19) {
      this.disableOption('Add Label Below');
    }
    if (labelSize <= 19) {
      this.enableOption('Add Label Below');
    }
    if (Array.isArray(dockedTo) && dockedTo.length === 5) {
      this.disableOption('Add Drop zone');
    } else {
      this.enableOption('Add Drop zone');
    }

    var distractorCount = 0;
    for (var i = 0; i < labelData.labels.length; i++) {
      if (labelData.labels[i].distractor === true) distractorCount++;
    }
    var size = labelSize - distractorCount;
    if (size === 2) {
      this.disableOption('Mark as Distractor');
      this.disableOption('Delete');
    }
    if (index) {
      if (state.labelData.labels[index].distractor) {
        if (labelSize === 20) {
          this.disableOption('Add Label Below', 'distractor');
        } else {
          this.enableOption('Add Label Below', 'distractor');
        }
      }
    }
  }
  onLabelClick(label, index) {
    if (this.state.activity.name === 'labeling') {
      const labelHighlightObj = {
        isHighlight: false,
      };
      this.cdStateService.highlightDropzone.next(labelHighlightObj);
      this.isHighlightLabels = [];
      const labelData = {
        label: label,
        isHighlight: true,
      };
      this.cdStateService.deselectObject();
      this.cdStateService.highlightDropzone.next(labelData);
      this.isHighlightLabels[index] = { val: true };
    }
  }

  updateChanged() {
    this.cdStateService.toggleShuffleForStudent();
  }

  reorderLabels() {
    this.reorderService.reorderLabels.next(true);
  }

  drop(event: any) {
    moveItemInArray(this.labelList, event.previousIndex, event.currentIndex);
    let ele = event.item.element.nativeElement;
    ele.style.border = '';
    if (this.mouseMoveSub) {
      this.mouseMoveSub.unsubscribe();
    }
    clearInterval(this.yScrolling);
    this.yScrolling = null;
  }

  dropStarted(event) {
    let ele = event.source.element.nativeElement;
    ele.style.border = 'solid 1px #007c91';
    this.dragDropService.clearPageScrollIntervals();
    this.dragPlaceHolderHeight = event.source.element.nativeElement.clientHeight;
    this.mousemove = fromEvent<MouseEvent>(document, 'mousemove');
    this.mouseMoveSub = this.mousemove.subscribe((evt: MouseEvent) => {
      const initialY = evt.clientY;
      const initialX = evt.clientX;
      evt.preventDefault();
      const client_x = evt.clientX;
      const client_y = evt.clientY;
      const iframeDim = window.parent.document.getElementById(EZ.id).getBoundingClientRect();
      if (evt.screenY > window.parent.innerHeight - 40 && iframeDim.bottom > window.parent.innerHeight) {
        // window.parent.scrollTo(window.parent.scrollX, window.parent.scrollY + 5);
        this.yScrolling = !this.yScrolling ? this.dragDropService.scrollPage('y', 10) : this.yScrolling;
      } else if (iframeDim.top < 0 && evt.screenY < 180) {
        // window.parent.scrollTo(window.parent.scrollX, window.parent.scrollY - 5);
        this.yScrolling = !this.yScrolling ? this.dragDropService.scrollPage('y', -10) : this.yScrolling;
      } else {
        clearInterval(this.yScrolling);
        this.yScrolling = null;
      }


      //this.dragDropService.scrollPage('y', 10);
    });
  }
}
