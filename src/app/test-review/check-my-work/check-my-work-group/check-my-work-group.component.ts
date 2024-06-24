import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';
import { APP_CONFIG } from '../../../shared/constants/appconfig';

@Component({
  selector: '.app-check-my-work-group',
  templateUrl: './check-my-work-group.component.html',
  styleUrls: ['./check-my-work-group.component.scss']
})
export class CheckMyWorkGroupComponent implements OnInit {
  stateData: any;
  bucket: any = [];
  droppedLabels = [];
  mediaPath: any;
  bucketArray = [];
  dockData: any;
  dropZoneAreaWidth = 0;

  constructor(public cdStateService: CdStateService, private mediaService: MediaService) { }
  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.bucket = this.stateData.response.docks;
    this.bucketArray = JSON.parse(JSON.stringify(this.bucket));
    this.bucketArray.forEach(element => {
      let dockData;
      this.dockData = this.stateData.dockData.docks.find((dock) => dock.id === element.id);
      element.headerText = this.dockData.headerText;
      dockData = this.stateData.dockData.docks.filter((dock) => dock.id === element.id);
      element.media = { ...dockData[0].media, ...dockData[0].image }
    });
    this.updateDockHeightOnLoad();
    this.updateLabelsInDropzone();
    this.setMediaPath();
    setTimeout(() => {
      this.cdStateService.checkForMaxBoundryHeight();
    }, 100);
    this.dropZoneAreaWidth = this.stateData.canvas.width - APP_CONFIG.LABEL_ELE_WIDTH;
  }

  setMediaPath() {
    for (let i = 0; i < this.bucketArray.length; i++) {
      if (this.bucketArray[i].media.mediaId !== '') {
        const media = this.mediaService.getMediaDetails(this.bucketArray[i].media.mediaId);
        this.bucketArray[i].path = media.path;
        this.bucketArray[i].isImageAdded = true;
        this.bucketArray[i].altText = this.cdStateService.setImageAltText(media, this.bucketArray[i].media, 'altText');
      } else {
        this.bucketArray[i].path = '';
        this.bucketArray[i].isImageAdded = false;
        this.bucketArray[i].altText = '';

      }
    }
  }
  updateDockHeightOnLoad() {
    let maxHeight = 0;
    let dropzoneElements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    setTimeout(() => {
      for (let i = 0; i < dropzoneElements.length; i++) {
        if (maxHeight < dropzoneElements[i].offsetHeight) {
          maxHeight = dropzoneElements[i].offsetHeight > this.dockData.height ? dropzoneElements[i].offsetHeight : this.dockData.height;
        }
      }
      for (let i = 0; i < dropzoneElements.length; i++) {
        dropzoneElements[i].style.minHeight = maxHeight + 'px';
      }
    }, 10);
  }
  updateLabelsInDropzone() {
    this.droppedLabels = [];
    for (let i = 0; i < this.bucket.length; i++) {
      this.bucket[i].linkedLabel.forEach(element => {
        for (let i = 0; i < this.stateData.response.labels.length; i++) {
          const label = this.stateData.response.labels[i];
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
