import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';
import { DragAndDropServiceService } from 'src/app/shared/services/drag-and-drop-service.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';

@Component({
  selector: 'app-single-label',
  templateUrl: './single-label.component.html',
  styleUrls: ['./single-label.component.scss'],
})
export class SingleLabelComponent implements OnInit, AfterViewInit {
  @Input() label;
  @Input() isInsideDropzone;
  @Input() isHighlight;
  @ViewChild('labelElement') labelElement: ElementRef;
  id = 0;
  imageWidth: number = 0;
  imageHeight: number = 0;
  imageStyle: string;
  disable = false;
  stateData: any;
  activitySingleLabelMultiDock: boolean = false;
  mediaPath = '';
  media: any;
  isErrorHighlight: boolean = false;

  constructor(
    public cdStateService: CdStateService,
    private dragAndDropService: DragAndDropServiceService,
    private mediaService: MediaService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) { }
  ngAfterViewInit(): void {
    if (
      !this.isInsideDropzone &&
      this.stateData.activity.options.labelInteraction === 'one-label-one-dock' &&
      this.stateData.activity.name === 'grouping'
    ) {
      if (this.label.dockedTo.length > 0) {
        this.disable = true;
      }
    }

    this.dragAndDropService.dragStart.subscribe((result) => {
      if (result !== false) {
        if (result && parseInt(result.labelId) === this.label.id && result.isDropzone) {
          const index = this.label.dockedTo.indexOf(parseInt(result.dropzoneId));
          if (index !== -1) {
            this.label.dockedTo.splice(index, 1);
          }
        } else {
          if (this.cdStateService.getState().activity.options.labelInteraction === 'one-label-one-dock') {
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
      }
    });
    this.dragAndDropService.drop.subscribe((obje) => {
      if (obje && parseInt(obje.labelId) === this.label.id) {
        const dropzoneId = obje.dropzoneId;
        // this.label.dockedTo = [];
        if (!this.label.dockedTo.includes(parseInt(dropzoneId))) {
          this.label.dockedTo.push(parseInt(dropzoneId));
        }
      }
    });

    this.dragAndDropService.removeDisbaleClass.subscribe((labelId) => {
      this.updatedLabelClassOnLoad();
      if (!this.isInsideDropzone && this.label.id === parseInt(labelId)) {
        this.disable = false;
      }
    });
    this.cdStateService.checkHeight.subscribe((val) => {
      if (val) {
        this.label.height = this.labelElement.nativeElement.offsetHeight;
      }
      let maxHeight = Math.max.apply(
        Math,
        this.stateData.labelData.labels.map((label) => label.height)
      );
      this.cdStateService.labelHeight = maxHeight;
      this.modalService.updateHeightOfDocks(this.stateData.dockData.docks, maxHeight);
    });
    this.cdStateService.highlightErrorLabel.subscribe((val: any) => {
      if (val.id === this.label.id) {
        this.isErrorHighlight = true;
      }
      this.cdr.detectChanges();
    });
    this.cdStateService.removeHighlight.subscribe((val: any) => {
      if (val.id === this.label.id) {
        this.isErrorHighlight = false;
      }
    })
  }

  onImageLoad(event) {
    if (event.target.width > event.target.height) {
      this.imageWidth = 120;
      this.imageHeight = 0;
    } else {
      this.imageHeight = 120;
      this.imageWidth = 0;
    }
    this.imageStyle =
      'width:' +
      (this.imageWidth !== 0 ? this.imageWidth + 'px' : 'auto') +
      ';height:' +
      (this.imageHeight !== 0 ? this.imageHeight + 'px' : 'auto');
    this.cdStateService.updateDockHeightOnAddingMedia.next(true);
  }
  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.disable = false;
    this.activitySingleLabelMultiDock =
      this.stateData.activity.options.labelInteraction === 'one-label-one-dock' ? false : true;
    this.cdStateService.stateUpdated.subscribe(() => {
      this.setMediaPath();
    });
    this.setMediaPath();
    this.cdStateService.highlightLabel.subscribe((val: any) => {
      if (val.isHighlight) {
        if (val.dockObj.linkedLabel[0] === this.label.id) {
          this.isHighlight = true;
        }
      } else {
        if (this.isHighlight) {
          this.isHighlight = false;
          const labelData = {
            label: this.label,
            isHighlight: false
          }
          this.cdStateService.highlightDropzone.next(labelData);
        }
      }
    });
  }

  setMediaPath() {
    if (this.label.mediaType) {
      if (this.label.mediaType === 'audio') {
        const media = this.mediaService.getMediaDetails(this.label.audio.mediaId);
        this.media = media;
        this.mediaPath = media.path;
      } else if (this.label.mediaType === 'image') {
        const media = this.mediaService.getMediaDetails(this.label.image.mediaId);
        this.mediaPath = media.path;
      }
    }
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
}
