import { Component, OnInit, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../../shared/constants/appconfig';

@Component({
  selector: '.app-preview-group',
  templateUrl: './preview-group.component.html',
  styleUrls: ['./preview-group.component.scss']
})
export class PreviewGroupComponent implements OnInit {
  stateData: any;
  bucket: any = [];
  droppedLabels = [];
  bucketArray = [];
  dockData: any;
  dropZoneAreaWidth = 0;

  @ViewChild('dropZone') dropZone;

  constructor(public cdStateService: CdStateService) { }

  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.bucket = this.stateData.dockData.docks;
    this.bucket.forEach(element => {
      let docks;
      this.dockData = this.stateData.dockData.docks.find((dock) => dock.id === element.id);
      docks = this.stateData.dockData.docks.filter((dock) => dock.id === element.id);
      element.media = { ...docks[0].media, ...docks[0].image }
    });
    this.bucketArray = JSON.parse(JSON.stringify(this.bucket));
    // this.updateDockHeightOnLoad();
    this.updateLabelsInDropzone();
    this.setMedia();
    setTimeout(() => {
      this.cdStateService.checkForMaxBoundryHeight();
    }, 100);
    this.dropZoneAreaWidth = this.stateData.canvas.width - APP_CONFIG.LABEL_ELE_WIDTH;
  }


  setMedia() {
    for (let i = 0; i < this.bucketArray.length; i++) {
      if (this.bucketArray[i].media.mediaId !== '') {
        this.bucketArray[i].isImageAdded = true;
      } else {
        this.bucketArray[i].isImageAdded = false;
      }
    }
  }
  updateDockHeightOnLoad() {
    let maxHeight = 0;
    let dropzoneElements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    setTimeout(() => {
      // for (let i = 0; i < dropzoneElements.length; i++) {
      //   if (maxHeight < dropzoneElements[i].offsetHeight) {
      //     maxHeight = dropzoneElements[i].offsetHeight > this.dockData.height ? dropzoneElements[i].offsetHeight : this.dockData.height;
      //   }
      // }
      for (let i = 0; i < dropzoneElements.length; i++) {
        if (maxHeight < dropzoneElements[i].offsetHeight) {
          maxHeight = dropzoneElements[i].offsetHeight;
        }
      }
      for (let i = 0; i < dropzoneElements.length; i++) {
        dropzoneElements[i].style.minHeight = maxHeight + 'px';
      }
      this.stateData.dockData.docks.forEach(element => {
        element.height = maxHeight;
      });
      this.cdStateService.checkForMaxBoundryHeight();
    }, 10);
  }
  updateLabelsInDropzone() {
    this.droppedLabels = [];
    for (let i = 0; i < this.bucket.length; i++) {
      this.bucket[i].linkedLabel.forEach(element => {
        for (let i = 0; i < this.stateData.labelData.labels.length; i++) {
          const label = this.stateData.labelData.labels[i];
          if (label.id.toString() === element.toString()) {
            if (!this.droppedLabels.includes(label) && !label.distractor) {
              this.droppedLabels.push(label);
            }
          }
        }
      });
    }
  }
}
