import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../../shared/constants/appconfig';

@Component({
  selector: '.app-test-group',
  templateUrl: './test-group.component.html',
  styleUrls: ['./test-group.component.scss']
})
export class TestGroupComponent implements OnInit, AfterViewInit {
  stateData: any;
  bucket: any;
  droppedLabels = [];
  mediaPath: any;
  bucketArray = [];
  groupName = []
  _buttonPurpose = ButtonPurpose;
  imageCord: { width: number; height: number; };
  dropZoneAreaWidth = 0;

  constructor(private cdStateService: CdStateService, private cdr: ChangeDetectorRef) { }
  @ViewChild('dropzone') dropzone: ElementRef;
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cdStateService.checkForMaxBoundryHeight();
    }, 100);
    this.cdStateService.updateGroupLabels.subscribe(() => {
      this.bucket.forEach((element) => {
        let dockData;
        dockData = this.stateData.dockData.docks.filter((dock) => dock.id === element.id);
        element.media = { ...dockData[0].media, ...dockData[0].image };
        element.headerText = dockData[0].headerText;
        element.height = dockData[0].height;
      });
      this.setMediaPath();
    });
    this.dropZoneAreaWidth = this.stateData.canvas.width - APP_CONFIG.LABEL_ELE_WIDTH;
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.cdStateService.BuketAdded = false;
    this.bucket = this.stateData.response.docks;
    this.bucket.forEach(element => {
      let dockData;
      dockData = this.stateData.dockData.docks.filter((dock) => dock.id === element.id);
      element.media = { ...dockData[0].media, ...dockData[0].image }
      element.headerText = dockData[0].headerText;
      element.height = dockData[0].height;
    });
    this.setMediaPath();

  }
  setMediaPath() {
    for (let i = 0; i < this.bucket.length; i++) {
      if (this.bucket[i].media.mediaId !== '') {
        this.bucket[i].isImageAdded = true;
      } else {
        this.bucket[i].isImageAdded = false;

      }
    }
  }
}
