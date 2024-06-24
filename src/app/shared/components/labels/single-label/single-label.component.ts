import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { DragAndDropServiceService } from 'src/app/shared/services/drag-and-drop-service.service';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';
import { A11yLabel } from '../../../constants/a11yLabel';

@Component({
  selector: 'app-shared-single-label',
  templateUrl: './single-label.component.html',
  styleUrls: ['./single-label.component.scss'],
})
export class SingleLabelComponent implements OnInit, AfterViewInit, OnDestroy {
  _buttonPurpose = ButtonPurpose;
  @Input() dropZoneEle;
  @Input() label;
  @Input() isInsideDropzone;
  @Input() isLabelDisabled;
  @Input() labelHeight;
  @ViewChild('labelElement') labelElement: ElementRef;
  @Output('note') note = new EventEmitter();
  @Output('feedback') feedback = new EventEmitter();
  @Input() index: number;
  @Input() dropzone;
  isDisabled: boolean = false;
  state: any;
  mediaPath: string = '';
  media: any;
  mode: any;
  disable = false;
  responseLabel: any;
  activitySingleLabelMultiDock: boolean = false;
  showFeedback = false;
  feedbackText: boolean;
  labelInteraction: any;
  typeOfOccurrence: any;
  startSubscription;
  dropSubscription;
  removeDisableClassSubscription;
  updateDockHeightSubscription;
  ariaPressed: boolean | null = false;

  set _ariaPressed(value) {
    if (EZ.mode === EZ.MODE_TEST) {
      this.ariaPressed = value;
    } else {
      this.ariaPressed = null;
    }
  }

  get _ariaPressed() {
    return this.ariaPressed;
  }

  constructor(
    private cdStateService: CdStateService,
    private mediaService: MediaService,
    private dragAndDropService: DragAndDropServiceService,
    private modalService: ModalService,
    private a11yHelper: A11yHelperService,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngAfterViewInit(): void {
    if (
      !this.isInsideDropzone &&
      (this.labelInteraction === 'one-label-one-dock' ||
        (this.labelInteraction === 'one-label-multiple-dock' && this.typeOfOccurrence === 'display-each-instance')) &&
      (this.state.activity.name === 'grouping' ||
        this.mode === 'test' ||
        this.mode === 'sample' ||
        this.mode === 'review')
    ) {
      if (this.label.dockedTo.length > 0) {
        this.disable = true;
      }
    }
    this.startSubscription = this.dragAndDropService.dragStart.subscribe((result) => {
      if (result !== false) {
        if (result && parseInt(result.labelId) === this.label.id && result.isDropzone) {
          const index = this.label.dockedTo.indexOf(parseInt(result.dropzoneId));
          if (index !== -1) {
            this.label.dockedTo.splice(index, 1);
          }
        } else {
          if (
            this.state.activity.options.labelInteraction === 'one-label-one-dock' ||
            this.state.activity.options.typeOfOccurrence === 'display-each-instance'
          ) {
            // if (result && parseInt(result.labelId) === this.label.id) {
            //   if (this.isInsideDropzone) {
            //     this.disable = false;
            //   } else {
            //     this.disable = true;
            //   }
            // }
            if (!this.isInsideDropzone && result && parseInt(result.labelId) === this.label.id) {
              this.disable = true;
            }
          }
        }
        if (result && parseInt(result.labelId) === this.label.id) {
          this._ariaPressed = true;
        }
      }
    });
    this.dropSubscription = this.dragAndDropService.drop.subscribe((obje) => {
      if (obje && parseInt(obje.labelId) === this.label.id) {
        let responseDock;
        const dropzoneId = obje.dropzoneId;
        this._ariaPressed = false;

        //this.responseLabel.dockedTo = [];
        if (!this.label.dockedTo.includes(parseInt(dropzoneId))) {
          const dropzone = this.state.response.docks.find(d => d.id === parseInt(dropzoneId));
          for (let i = 0; i < dropzone.linkedLabel.length; i++) {
            if (dropzone.linkedLabel[i] === this.label.id) {
              this.label.dockedTo.push(parseInt(dropzoneId));
            }
          }
          for (let i = 0; i < dropzone.linkedLabel.length; i++) {
            if (this.label.dockedTo.length === 0) {
              this.dragAndDropService.removeDisbaleClass.next(this.label.id);
            }
          }
        }
      }
    });

    this.removeDisableClassSubscription = this.dragAndDropService.removeDisbaleClass.subscribe((labelId) => {
      this.updatedLabelClassOnLoad();
      if (!this.isInsideDropzone && this.label.id === parseInt(labelId)) {
        this.disable = false;
        this._ariaPressed = false;
      }
    });
    this.updateDockHeightSubscription = this.cdStateService.checkHeight.subscribe((val) => {
      if (val) {
        this.label.height = this.labelElement.nativeElement.offsetHeight;
      }
      let maxHeight = Math.max.apply(
        Math,
        this.state.labelData.labels.map((label) => label.height)
      );
      this.cdStateService.labelHeight = maxHeight;
      this.modalService.updateHeightOfDocks(this.state.dockData.docks, maxHeight);
    });
    this.cdRef.detectChanges();
  }
  updatedLabelClassOnLoad() {
    let dropzonelements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    let maxHeight = 0;
    for (let i = 0; i < dropzonelements.length; i++) {
      if (maxHeight < dropzonelements[i].offsetHeight) {
        maxHeight = dropzonelements[i].offsetHeight;
      }
    }
    for (let i = 0; i < dropzonelements.length; i++) {
      dropzonelements[i].style.minHeight = maxHeight + 'px';
    }
  }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    this.mode = EZ.mode;
    this.labelInteraction = this.state.activity.options.labelInteraction;
    this.typeOfOccurrence = this.state.activity.options.typeOfOccurrence;
    if (
      !this.isInsideDropzone &&
      (this.labelInteraction === 'one-label-one-dock' ||
        (this.labelInteraction === 'one-label-multiple-dock' && this.typeOfOccurrence === 'display-each-instance')) &&
      (this.state.activity.name === 'grouping' || this.mode === 'test' || this.mode === 'sample')
    ) {
      if (this.label.dockedTo.length > 0) {
        this.disable = true;
      }
    }
    if (this.labelInteraction === 'one-label-one-dock' && !this.isInsideDropzone && this.label.dockedTo.length > 0) {
      this.isDisabled = true;
    } else if (
      this.labelInteraction === 'one-label-multiple-dock' &&
      this.typeOfOccurrence === 'display-each-instance' &&
      !this.isInsideDropzone &&
      this.label.dockedTo.length > 0
    ) {
      this.isDisabled = true;
    } else if (
      this.labelInteraction === 'one-label-multiple-dock' &&
      this.typeOfOccurrence === 'display-once' &&
      !this.isInsideDropzone
    ) {
      this.activitySingleLabelMultiDock = true;
    }
    if (EZ.mode === 'test' || EZ.mode === 'sample' || EZ.mode === 'review') {
      for (let i = 0; i < this.state.labelData.labels.length; i++) {
        const label = this.state.labelData.labels[i];
        if (label.id === this.label.orgId) {
          this.responseLabel = label;
          break;
        }
      }
    } else {
      this.responseLabel = this.label;
    }
    if (EZ.mode !== EZ.MODE_TEST) {
      this._ariaPressed = null;
    }
    if ((EZ.mode === EZ.MODE_PREGRADE || EZ.mode === EZ.MODE_POST_TEST) && this.isInsideDropzone) {
      //this.feedbackText = true;
      const combineId = this.dropzone.id + '_' + this.label.id;
      const feedback = this.state.feedback[combineId];
      if (feedback != undefined) {
        this.showFeedback = true;
        this.feedbackText = feedback;
      }
    }
    this.note.emit(this.responseLabel.note);
    this.feedback.emit(this.responseLabel.feedback);
    this.setAudioPath();
    this.cdStateService.makeLabelEnable.subscribe((id) => {
      if (id === this.label.id) {
        this.disable = false;
      }
    });
  }

  setAudioPath() {
    if (this.responseLabel.mediaType === 'audio') {
      const mediaId = this.responseLabel.audio.mediaId;
      const media = this.mediaService.getMediaDetails(mediaId);
      this.mediaPath = media.path;
      this.media = media;
    }
  }

  getLabelSRText() {
    let text = '';
    const label = 'Label';
    const currentActivity = this.state.activity.name;
    const feedbackText = this.feedbackText ? 'Correct' : 'Incorrect';
    const labelText = this.cdStateService.stripHtmlTags(this.responseLabel.text);
    if (currentActivity === 'grouping' && this.isInsideDropzone) {
      const index = this.dropzone.linkedLabel.findIndex((d) => d === this.label.id);
      if (EZ.mode === EZ.MODE_PREVIEW) {
        text = `${labelText} ${label} ${index + 1} of ${this.dropzone.linkedLabel.length}`;
      } else {
        text = `${feedbackText} ${labelText} ${label} ${index + 1} of ${this.dropzone.linkedLabel.length}`;
      }
    } else if (currentActivity === 'labeling' && this.isInsideDropzone) {
      const linkedLabel = this.state.labelData.labels.find((d) => d.dockedTo.includes(this.dropzone.id));
      const dropzoneDescription = this.cdStateService.stripHtmlTags(linkedLabel.dropzoneDescription);
      text = `${feedbackText} ${dropzoneDescription}. ${labelText} Drop zone ${this.index + 1} of ${this.a11yHelper.dockCount}`;
    } else if (!this.isInsideDropzone) {
      const labelText = this.cdStateService.stripHtmlTags(this.responseLabel.text);
      text = `${labelText} ${label} ${this.index + 1} of ${this.a11yHelper.labelCount}`;
    }
    return text;
  }

  updateStyleForLabel() {
    let styles = '';
    if (this.activitySingleLabelMultiDock && !this.isInsideDropzone) {
      styles = styles + 'label-stack ';
    }
    if (EZ.mode === 'test') {
      styles = styles + 'grab-cursor ' + 'draggable ';
    }
    if ((this.isDisabled && !this.responseLabel.distractor && EZ.mode !== 'test') || this.disable) {
      styles = styles + 'disabled ';
    }
    if ((EZ.mode === EZ.MODE_PREGRADE || EZ.mode === EZ.MODE_POST_TEST) && this.isInsideDropzone) {
      if (this.feedbackText) {
        styles = styles + 'correct-answer';
      } else {
        styles = styles + 'incorrect-answer';
      }
    }
    // if (EZ.mode === 'review' && !this.isInsideDropzone) {
    //   if (!this.feedbackText) {
    //     styles = styles + 'incorrect-answer';
    //   }
    // }
    return styles;
  }

  setA11yTabIndex() {
    if (EZ.mode === EZ.MODE_TEST && !this.disable) return 0;
    return null;
  }

  setAriaLabelForNormalLabels() {
    if (EZ.mode !== EZ.MODE_TEST) return null;
    const activity = this.state.activity.name;
    const isLabeling = activity === 'labeling' ? true : false;
    let dropzoneType = 'normalDropZone';
    let labelObj = {
      label: this.cdStateService.stripHtmlTags(this.responseLabel.text),
      currentIndex: this.index + 1,
      totalLabelLength: this.isInsideDropzone ? this.a11yHelper.dockCount : this.a11yHelper.labelCount,
      labelDynamicText: this.mode === 'test' && !(this.isDisabled || this.disable) ? A11yLabel['labelKeyboardInteraction'] : "",
      mark: this.getLabelDynamicText()
    };

    if (!isLabeling) {
      dropzoneType = 'groupNormalDropZone';
      labelObj['groupTitle'] = this.isInsideDropzone ? this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(this.dropzone.headerText)) : '';
    }

    return this.a11yHelper.getAnnounceMsg(this.isInsideDropzone ? dropzoneType : 'normalLabel', labelObj);

  }

  getLabelDynamicText() {
    let str = '';
    if (this.isInsideDropzone && (this.mode === 'sample' || this.mode === 'review') && this.showFeedback) {
      if (this.feedbackText) {
        str = 'Correct,';
      } else {
        str = 'Incorrect,';
      }
    }
    return str;
  }
  setAriaLabelForMediaLabels() {
    if (EZ.mode !== EZ.MODE_TEST) return null;
    const media = this.mediaService.getMediaDetails(this.responseLabel.image.mediaId);
    const activity = this.state.activity.name;
    const isLabeling = activity === 'labeling' ? true : false;
    let dropzoneType = 'mediaDropZone';
    const labelObj = {
      label: this.cdStateService.stripHtmlTags(this.responseLabel.text),
      currentIndex: this.index + 1,
      totalLabelLength: this.isInsideDropzone ? this.a11yHelper.dockCount : this.a11yHelper.labelCount,
      shortDescription: this.responseLabel.mediaType === 'image' ? this.cdStateService.setImageAltText(media, this.responseLabel.image, 'altText') : '',
      labelType: this.responseLabel.mediaType,
      labelDynamicText: this.mode === 'test' && !(this.isDisabled || this.disable) ? A11yLabel['labelKeyboardInteraction'] : "",
      mark: this.getLabelDynamicText()
    };
    if (!isLabeling) {
      dropzoneType = 'groupMediaDropZone';
      labelObj['groupTitle'] = this.isInsideDropzone ? this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(this.dropzone.headerText)) : '';
    }
    return this.a11yHelper.getAnnounceMsg(this.isInsideDropzone ? dropzoneType : 'mediaLabel', labelObj);
  }

  setAriaGrabbed() {
    if (EZ.mode === EZ.MODE_TEST) return false;
    return null;
  }

  setAriaRoleDescription() {
    if (EZ.mode === EZ.MODE_TEST) return 'toggle button';
    return null;
  }

  setRoleButton() {
    if (EZ.mode === EZ.MODE_TEST) return 'button';
    return null;
  }

  setIdForLabel(id) {
    if (!this.isInsideDropzone) {
      return `label_${id}`;
    } else {
      return null;
    }
  }

  ngOnDestroy(): void {
    if (this.dropSubscription) {
      this.dropSubscription.unsubscribe();
    }
    if (this.startSubscription) {
      this.startSubscription.unsubscribe();
    }
    if (this.removeDisableClassSubscription) {
      this.removeDisableClassSubscription.unsubscribe();
    }
    if (this.updateDockHeightSubscription) {
      this.updateDockHeightSubscription.unsubscribe();
    }
  }
}
