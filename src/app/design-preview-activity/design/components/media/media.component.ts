import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { ModalService } from '../../../../services/modal-popup/modal.service';
import { CdStateService } from '../../../../services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent implements OnInit {
  @Input() mediaList;
  @Input() showSearch;
  @Input() isHeaderFilter;
  @Input() mediaId;
  @Input() labelText;
  @Input() note;
  @Input() feedback;
  @Input() dropzoneDescription;
  @Input() isLabel;
  media;
  mediaType = '';
  source = '';
  description = '';
  _buttonPurpose = ButtonPurpose;
  activeMedia;
  searchedList = [];
  mediaContent;
  isMediaAvailable: boolean = true;
  listOfMedia: Array<any>;
  counterOfChecked;
  mediaListWithCheck;
  constructor(
    private modalService: ModalService,
    private cdStateService: CdStateService,
    private mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this.listOfMedia = this.mediaList;
    this.isMediaAvailable = this.mediaList.length < 1 ? false : true;
    if (this.mediaId) {
      this.media = this.mediaService.getMediaDetails(this.mediaId);
      this.checkPreview(this.media);
    } else {
      this.checkPreview(this.mediaList[0]);
    }
  }

  checkPreview(media) {
    // let mediaDetails = JSON.parse(JSON.stringify(media));
    if (media) {
      this.mediaContent = media; //mediaDetails.isItemMedia ? mediaDetails : this.mediaService.getMediaDetails(mediaDetails.path);
      this.mediaType = media.type;
      this.source = media.path;
      this.description = media.description;
      this.activeMedia = media.mediaId;
    }
    // this.mediaSelected.emit(media);
  }
  selectedMedia(media) {
    this.modalService.popupModalRef.componentRef.instance.onClose();
    this.modalService.showAddLabelModal(
      this.labelText,
      this.note,
      this.feedback,
      this.dropzoneDescription,
      this.mediaContent.mediaId
    );
  }

  search(input) {
    if (this.counterOfChecked === 1) {
      this.listOfMedia = this.mediaListWithCheck;
      this.listOfMedia = this.listOfMedia.filter((item) =>
        item.title.toLowerCase().startsWith(input.value.toLowerCase())
      );
      if (input.value === '') {
        this.listOfMedia = this.mediaListWithCheck;
      }
    } else {
      this.listOfMedia = this.mediaList.filter((item) =>
        item.title.toLowerCase().startsWith(input.value.toLowerCase())
      );
    }
  }
  mediaListChanges(event) {
    this.counterOfChecked = event.counterOfCheck;
    this.listOfMedia = event.mediaListValue;
    this.mediaListWithCheck = this.listOfMedia;
  }

  // onChangeCheckBoxItems(value, isChecked) {
  //   this.counterOfChecked = isChecked ? ++this.counterOfChecked : --this.counterOfChecked;
  //   value.checked = isChecked;
  //   this.valueChangeForFilter(value, this.counterOfChecked);
  // }

  // valueChangeForFilter(value, counterOfCheck) {
  //   if (counterOfCheck === 0 || counterOfCheck === 2) {
  //     this.listOfMedia = this.mediaList;
  //   } else {
  //     if (value.viewValue === 'image') {
  //       if (value.checked) {
  //         this.listOfMedia = this.mediaList.filter(item => item.type === 'image');
  //       } else {
  //         this.listOfMedia = this.mediaList.filter(item => item.type === 'audio');
  //       }
  //     } else if (value.viewValue === 'audio') {
  //       if (value.checked) {
  //         this.listOfMedia = this.mediaList.filter(item => item.type === 'audio');
  //       } else {
  //         this.listOfMedia = this.mediaList.filter(item => item.type === 'image');
  //       }
  //     }
  //   }
  // }

  // backToAddLabel() {
  //   this.modalService.popupModalRef.componentRef.instance.onClose();
  //   this.modalService.showAddLabelModal();
  // }
  // selectMedia() {
  //   const state = this.cdStateService.getState();
  //   const index = this.cdStateService.labelIndex;
  //   state.labelData.labels[index].image = this.media;
  //   this.cdStateService.setState(JSON.stringify(state));
  //   this.modalService.popupModalRef.componentRef.instance.onClose();
  //   this.modalService.showAddLabelModal();
  // }
  // openFilter() {
  //   this.isFilterOpen = !this.isFilterOpen;
  // }
}
