import { Component, OnInit } from '@angular/core';
import { MediaService } from 'src/app/services/media/media.service';
import { CdStateService } from '../../../services/cd-state/cd-state.service';
@Component({
  selector: 'app-add-label',
  templateUrl: './add-label.component.html',
  styleUrls: ['./add-label.component.scss']
})
export class AddLabelComponent implements OnInit {

  labelText: string;
  labelErrors: Array<string> = [];
  dropzoneDescErrors: Array<string> = [];
  mediaId;
  labelData;
  note;
  feedback;
  dropzoneDescription: string;
  mediaFromMediaComponent = false;
  mediaType;
  labelHeight;
  displayDropZone: boolean;
  longDescription;
  shortDescription;
  constructor(public cdStateService: CdStateService, private mediaService: MediaService) { }

  ngOnInit(): void {
    // this.labelState = this.cdStateService.getState();
    const state = this.cdStateService.getState();
    const index = this.cdStateService.labelIndex;
    this.labelData = state.labelData.labels[index];
    this.labelText = !this.labelText ? this.labelData.text : this.labelText;
    this.note = !this.note ? this.labelData.note : this.note;
    this.feedback = !this.feedback ? this.labelData.feedback : this.feedback;
    this.dropzoneDescription = !this.dropzoneDescription ? this.labelData.dropzoneDescription : this.dropzoneDescription;
    if (this.mediaFromMediaComponent === false) {
      this.mediaType = this.labelData.mediaType;
      if (this.mediaType === 'image') {
        this.mediaId = this.labelData.image.mediaId;
        // this.media = JSON.parse(JSON.stringify(this.media));
      }
      if (this.mediaType === 'audio') {
        this.mediaId = this.labelData.audio.mediaId;
        // this.media = JSON.parse(JSON.stringify(this.media));
      }
      // this.media = JSON.parse(JSON.stringify(this.media));
    }
    if (state.activity.name !== 'grouping') {
      this.displayDropZone = !this.labelData.distractor;
    } else {
      this.displayDropZone = false;
    }
    if (this.mediaId) {
      const media = this.mediaService.getMediaDetails(this.mediaId);
      this.mediaType = media.type;
    }
  }
  setLabelText(text) {
    this.labelText = text;
  }
  mediaDelete(event) {
    this.mediaId = event.mediaContent;
    this.mediaType = event.mediaType;
  }

  setNote(text) {
    this.note = text;
  }
  setFeedback(text) {
    this.feedback = text;
  }
  setDropzoneDesc(text) {
    this.dropzoneDescription = text;
  }
  setLabelHeight(height) {
    this.labelHeight = height;
  }
  setMedia(mediaId) {
    this.mediaId = mediaId;
  }
  setLongDescription(text) {
    this.longDescription = text;
  }
  setShortDescription(text) {
    this.shortDescription = text;
  }

}
