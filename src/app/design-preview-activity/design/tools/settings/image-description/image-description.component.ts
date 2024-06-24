import { Component, Input, OnInit } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';

import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { MediaService } from 'src/app/services/media/media.service';

@Component({
  selector: 'app-image-description',
  templateUrl: './image-description.component.html',
  styleUrls: ['./image-description.component.scss'],
})
export class ImageDescriptionComponent implements OnInit {
  _buttonPurpose = ButtonPurpose;
  @Input() bgData;
  @Input() index;
  @Input() disable;
  public isEditDescription = false;
  public description;
  public altText;

  state: any;
  isGrouping: boolean = false;
  bucketLength: number;
  longDescription: string = '';
  shortDescription: string = '';
  currentActivity: string = '';
  mediaData: any;

  constructor(
    private cdService: CdStateService,
    private undoRedoService: UndoRedoService,
    private mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this.state = this.cdService.getState();
    this.currentActivity = this.state.activity.name;
    this.mediaData = this.currentActivity === 'grouping' ? this.bgData.element.media : this.bgData;
    this.setImageDescription();
    if (this.currentActivity === 'grouping') {
      this.isGrouping = true;
      this.bucketLength = this.state.dockData.docks.length;
    }
    this.cdService.groupLengthUpdate.subscribe(() => {
      if (this.currentActivity === 'grouping') {
        this.bucketLength = this.state.dockData.docks.length;
      }
    });
  }

  setImageDescription() {
    const media = this.mediaService.getMediaDetails(this.mediaData.mediaId);
    if (media) {
      this.setDefaultShortDescription(media);
      this.setDefaultLongDescription(media);
    }
  }

  editDescription() {
    this.isEditDescription = true;
    this.cdService.editDescriptionButtonDisable.next(true);
  }
  setDescription(text) {
    this.longDescription = text;
  }
  setAltText(text) {
    this.shortDescription = text;
  }
  saveDescription() {
    const undoObj = {
      actionName: 'update-description-image-labeling',
      actionData: {
        old: this.cdService.getDataOfFields(),
        new: {},
      },
    };
    const media = this.mediaService.getMediaDetails(this.mediaData.mediaId);
    if (this.shortDescription !== media.altText) {
      this.mediaData.altText = this.shortDescription;
      this.setDefaultShortDescription(media);
    } else {
      if (this.shortDescription !== '') {
        this.mediaData.altText = this.shortDescription;
        this.setDefaultShortDescription(media);
      } else {
        this.mediaData.altText = '';
      }
    }
    if (this.longDescription !== media.description) {
      this.mediaData.description = this.longDescription;
      this.setDefaultLongDescription(media);
    } else {
      if (this.longDescription !== '') {
        this.mediaData.description = this.longDescription;
        this.setDefaultLongDescription(media);
      } else {
        this.mediaData.description = '';
      }
    }
    this.isEditDescription = false;
    undoObj.actionData.new = this.cdService.getDataOfFields();
    this.undoRedoService.updateUndoArray(undoObj);
    this.cdService.editDescriptionButtonDisable.next(false);
    if (this.state.activity.name === 'grouping') {
      this.cdService.updateImageDescription.next(true);
    } else {
      this.cdService.updateImageDescription.next({ isEdited: true, updatedFor: 'bgImage' });
    }
  }
  cancelDescription() {
    this.resetDescription();
    this.isEditDescription = false;
    this.cdService.editDescriptionButtonDisable.next(false);
  }

  resetDescription() {
    const media = this.mediaService.getMediaDetails(this.mediaData.mediaId);
    if (media) {
      this.setDefaultShortDescription(media);
      this.setDefaultLongDescription(media);
    }
  }

  getHeaderText(text: string) {
    if (text !== '') {
      return `: ${this.cdService.stripHtmlTags(text)}`;
    }
  }

  setDefaultShortDescription(media) {
    this.shortDescription = this.mediaData.altText === '' ? media.altText : this.mediaData.altText;
  }

  setDefaultLongDescription(media) {
    this.longDescription = this.mediaData.description === '' ? media.description : this.mediaData.description;
  }
}
