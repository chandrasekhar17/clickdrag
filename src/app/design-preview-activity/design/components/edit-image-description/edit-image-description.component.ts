import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { CdStateService } from '../../../../services/cd-state/cd-state.service';
import { ModalService } from '../../../../services/modal-popup/modal.service';
import { MediaService } from 'src/app/services/media/media.service';
@Component({
  selector: 'app-edit-image-description',
  templateUrl: './edit-image-description.component.html',
  styleUrls: ['./edit-image-description.component.scss'],
})
export class EditImageDescriptionComponent implements OnInit {
  _buttonPurpose = ButtonPurpose;
  backgroundImageData;
  @Input() description: string;
  @Input() altText: string;
  @Input() index;
  @Output() getDescription = new EventEmitter();
  @Output() getAltText = new EventEmitter();
  @Input() type: string;
  @Input() mediaDetail: any;
  labelData;
  state: any;

  constructor(
    public cdStateService: CdStateService,
    public modalService: ModalService,
    public mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    if (this.type === 'editImageDescForLabels') {
      this.setDescriptionForLabel();
    }
  }

  setDescriptionForLabel() {
    const mediaData = this.mediaDetail;
    const mediaId = mediaData.mediaId;
    const media = this.mediaService.getMediaDetails(mediaId);
    if (media) {
      this.description = mediaData.description === '' ? media.description : mediaData.description;
      this.altText = mediaData.altText === '' ? media.altText : mediaData.altText;
    }
    this.getAltText.emit(this.altText);
    this.getDescription.emit(this.description);
  }

  inputChange(event) {
    this.getDescription.emit(event.value);
    if (this.type === 'editImageDescForLabels') {
      this.description = event.value;
      // if (this.description === '') {
      //   this.modalService.popupModalRef.componentRef.instance.disableConfirm = true;
      //   this.modalService.popupModalRef.componentRef.changeDetectorRef.detectChanges();
      // } else {
      //   this.modalService.popupModalRef.componentRef.instance.disableConfirm = false;
      //   this.modalService.popupModalRef.componentRef.changeDetectorRef.detectChanges();
      // }
    }
  }

  inputChangeAltText(event) {
    this.getAltText.emit(event.value);
    if (this.type === 'editImageDescForLabels') {
      this.altText = event.value;
      // if (this.altText === '') {
      //   this.modalService.popupModalRef.componentRef.instance.disableConfirm = true;
      //   this.modalService.popupModalRef.componentRef.changeDetectorRef.detectChanges();
      // } else {
      //   this.modalService.popupModalRef.componentRef.instance.disableConfirm = false;
      //   this.modalService.popupModalRef.componentRef.changeDetectorRef.detectChanges();
      // }
    }
  }

  resetDescription() {
    let labelIndex = this.cdStateService.labelIndex;
    const state = this.cdStateService.getState();

    if (this.type === 'editImageDescForLabels') {
      const mediaId = this.mediaDetail.mediaId;
      this.description = this.mediaService.getMediaLongDescription(mediaId);
      this.getDescription.emit(this.description);
      this.getAltText.emit(this.altText);
    } else if (state.activity.name !== 'grouping') {
      const mediaId = state.frameData.frames[0].media.mediaId;
      this.description = this.mediaService.getMediaLongDescription(mediaId);
      this.getDescription.emit(this.description);
    } else {
      const mediaId = state.dockData.docks[this.index].media.mediaId;
      this.description = this.mediaService.getMediaLongDescription(mediaId);
      this.getDescription.emit(this.description);
    }
  }
  resetAltText() {
    let labelIndex = this.cdStateService.labelIndex;
    const state = this.cdStateService.getState();
    if (this.type === 'editImageDescForLabels') {
      const mediaId = this.mediaDetail.mediaId;
      this.altText = this.mediaService.getMediaShortDescription(mediaId);
      this.getAltText.emit(this.altText);
      this.getDescription.emit(this.description);
    } else if (state.activity.name !== 'grouping') {
      const mediaId = state.frameData.frames[0].media.mediaId;
      const altText = this.mediaService.getMediaShortDescription(mediaId);
      this.getAltText.emit(altText);
    } else {
      const mediaId = state.dockData.docks[this.index].media.mediaId;
      this.altText = this.mediaService.getMediaShortDescription(mediaId);
      this.getAltText.emit(this.altText);
    }
  }
}
