import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MagnifyPreviewService } from 'src/app/services/magnify-preview/magnify-preview.service';
import { MediaService } from 'src/app/services/media/media.service';
import { APP_CONFIG } from '../../constants/appconfig';
import { DragAndDropServiceService } from '../../services/drag-and-drop-service.service';
import { A11yHelperService } from '../../services/a11y-helper.service';

@Component({
  selector: 'app-shared-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
})
export class DropzoneComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dropZone') dropZone;
  @Input() dockObj: any;
  @Input() currentIndex: number;
  state: any;
  label: any;
  mode: any;
  labelData: any;
  labelTextValue: any = '';
  mediaPath = '';
  droppedLabels = [];
  draggedLabelIndex = undefined;
  responseDockObj: any;
  media: any;
  authoringDropZones: any;
  startSubscription;
  dropSubscription;
  removeDisableClassSubscription;

  constructor(
    public cdStateService: CdStateService,
    private magnifyPreviewService: MagnifyPreviewService,
    private mediaService: MediaService,
    private dragAndDropService: DragAndDropServiceService,
    private cdRef: ChangeDetectorRef,
    private a11yHelper: A11yHelperService
  ) { }

  ngAfterViewInit(): void {
    if (EZ.mode === 'test' || EZ.mode === 'sample' || EZ.mode === 'review') {
      this.updateLabelsInDropzone();
      this.startSubscription = this.dragAndDropService.dragStart.subscribe((result) => {
        if (result && parseInt(result.dropzoneId) === this.dockObj.id) {
          const index = this.droppedLabels.findIndex((label) => {
            return label.id === parseInt(result.labelId);
          });
          if (index !== undefined && index !== null) {
            this.draggedLabelIndex = index;
          }
        }
      });

      this.dropSubscription = this.dragAndDropService.drop.subscribe((droppedObje) => {
        if (this.draggedLabelIndex !== undefined && this.draggedLabelIndex !== null) {
          const labelId = this.droppedLabels[this.draggedLabelIndex].id;
          const index = this.dockObj.linkedLabel.indexOf(labelId);
          if (this.dockObj.id !== parseInt(droppedObje.dropzoneId)) {
            this.dockObj.linkedLabel.splice(index, 1);
            this.draggedLabelIndex = undefined;
            this.updateLabelsInDropzone();
          } else {
            this.draggedLabelIndex = undefined;
          }
        }
        if (parseInt(droppedObje.dropzoneId) === this.dockObj.id) {
          let orgId;
          const labelId = parseInt(droppedObje.labelId);
          let flagPassed = false;
          if (Array.isArray(this.dockObj.linkedLabel)) {
            if (!this.dockObj.linkedLabel.includes(labelId)) {
              if (this.dockObj.linkedLabel.length < 1) {
                this.dockObj.linkedLabel.push(labelId);
                flagPassed = true;
              } else {
                this.state.response.labels.forEach((element) => {
                  if (element.id === this.dockObj.linkedLabel[0]) {
                    element.dockedTo = [];
                    this.cdStateService.makeLabelEnable.next(element.id);
                  }
                });
                this.dockObj.linkedLabel = [];
                this.dockObj.linkedLabel.push(labelId);
              }
            }
          }
          this.updateLabelsInDropzone();
        }
      });

      this.removeDisableClassSubscription = this.dragAndDropService.removeDisbaleClass.subscribe((labelId) => {
        if (this.draggedLabelIndex !== undefined && this.draggedLabelIndex !== null) {
          const index = this.dockObj.linkedLabel.indexOf(parseInt(labelId));
          this.dockObj.linkedLabel.splice(index, 1);
          this.draggedLabelIndex = undefined;
          this.updateLabelsInDropzone();
        }
      });
      this.cdRef.detectChanges();
    }
  }

  updateLabelsInDropzone() {
    this.droppedLabels = [];
    this.dockObj.linkedLabel.forEach((element) => {
      for (let i = 0; i < this.state.response.labels.length; i++) {
        const label = this.state.response.labels[i];
        if (label.id.toString() === element.toString()) {
          this.droppedLabels.push(label);
        }
      }
    });
  }

  ngOnInit(): void {
    console.log(this.dockObj);
    this.state = this.cdStateService.getState();
    this.mode = EZ.mode;
    if (EZ.mode === 'preview') {
      this.labelData = this.state.labelData.labels.find((label) => label.id === this.dockObj.linkedLabel[0]);
      this.labelTextValue = this.labelData.text;
      this.setAudioPath(this.labelData);
    }
    if (EZ.mode === 'test' || EZ.mode === 'sample' || EZ.mode === 'review') {
      this.authoringDropZones = this.state.dockData.docks;
      for (let i = 0; i < this.state.dockData.docks.length; i++) {
        const dock = this.state.dockData.docks[i];
        if (this.dockObj.id === dock.id) {
          this.responseDockObj = dock;
          break;
        }
      }
    }
  }

  setAudioPath(label) {
    if (label?.mediaType && label.mediaType === 'audio') {
      const media = this.mediaService.getMediaDetails(label.audio.mediaId);
      this.mediaPath = media.path;
      this.media = media;
    }
  }

  mouseEnter(event) {
    if (EZ.mode === 'test' || EZ.mode === 'sample' || EZ.mode === 'review') {
      this.magnifyPreviewService.show(this.responseDockObj);
    } else {
      this.magnifyPreviewService.show(this.dockObj);
    }
  }

  mouseLeave(event) {
    this.magnifyPreviewService.hide();
  }

  setAriaLabelForEmptyDropZones(value?: any) {
    const linkedLabel = this.state.labelData.labels.find((d) => d.dockedTo.includes(this.dockObj.id));
    const labelObj = {
      currentIndex: this.currentIndex + 1,
      dropzoneDescription: this.cdStateService.stripHtmlTags(linkedLabel.dropzoneDescription),
      totalDropZoneLength: this.state.response.docks.length,
      incorrectValue: value === undefined ? '' : value
    };
    return this.a11yHelper.getAnnounceMsg('IncorrectEmptyDropzone', labelObj);
  }

  getEmptyDropZonesText() {
    const linkedLabel = this.state.labelData.labels.find((d) => d.dockedTo.includes(this.dockObj.id));
    const emptyDropZoneObj = {
      currentIndex: this.currentIndex + 1,
      docksLength: this.state.response.docks.length,
      dropzoneDescription: this.cdStateService.stripHtmlTags(linkedLabel.dropzoneDescription),
    }
    return this.a11yHelper.getAnnounceMsg('emptyDropZone', emptyDropZoneObj);
  }

  ngOnDestroy(): void {
    if (this.startSubscription) {
      this.startSubscription.unsubscribe();
    }
    if (this.removeDisableClassSubscription) {
      this.removeDisableClassSubscription.unsubscribe();
    }
    if (this.dropSubscription) {
      this.dropSubscription.unsubscribe();
    }
  }
}
