import { Component, OnInit } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';

@Component({
  selector: 'app-image-setting',
  templateUrl: './image-setting.component.html',
  styleUrls: ['./image-setting.component.scss'],
})
export class ImageSettingComponent implements OnInit {
  imageData = [];
  state: any;
  disable: boolean = false;
  constructor(private cdService: CdStateService) {}

  ngOnInit(): void {
    const state = (this.state = this.cdService.getState());
    this.cdService.bgImageDataUpdated.subscribe(() => {
      if (state.activity.name !== 'grouping') {
        this.imageData.length = 0;
        this.imageData.push(state.frameData.frames[0].media);
      } else {
        this.updateImageData();
      }
    });
    this.cdService.bgImageDataUpdated.subscribe(() => {
      if (this.cdService.imageDeleted) {
        this.updateImageData();
      }
    });
    this.cdService.editDescriptionButtonDisable.subscribe((value) => {
      if (state.activity.name === 'grouping') {
        if (value) {
          this.disable = true;
        } else {
          this.disable = false;
        }
      }
    });
  }

  updateImageData() {
    this.imageData = [];
    this.state.dockData.docks.forEach((element, index) => {
      if (element.isImageAdded === true) {
        this.imageData.push({ element, index });
      }
    });
  }
}
