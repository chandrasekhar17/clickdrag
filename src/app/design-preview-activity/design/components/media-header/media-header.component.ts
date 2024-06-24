import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { ModalService } from '../../../../services/modal-popup/modal.service';
import { CdStateService } from '../../../../services/cd-state/cd-state.service';

@Component({
  selector: 'app-media-header',
  templateUrl: './media-header.component.html',
  styleUrls: ['./media-header.component.scss']
})
export class MediaHeaderComponent implements OnInit {
  @Input() mediaList;
  @Input() isHeaderFilter;
  @Input() media;
  @Input() labelText;
  @Input() note;
  @Input() feedback;
  @Input() dropzoneDescription;
  @Output() filterMediaListChanges = new EventEmitter();
  @Output() selectedMedia = new EventEmitter();
  _buttonPurpose = ButtonPurpose;
  isFilterOpen: boolean = false;
  counterOfChecked: number = 2;
  isDisable: boolean = false;
  options: Array<any> = [
    { viewValue: 'image', checked: true },
    { viewValue: 'audio', checked: true }
  ];
  constructor(private modalService: ModalService, private cdStateService: CdStateService) { }

  ngOnInit(): void {
    this.isDisable = this.mediaList.length < 1 ? true : false;
  }

  onChangeCheckBoxItems(value, isChecked) {
    this.counterOfChecked = isChecked ? ++this.counterOfChecked : --this.counterOfChecked;
    value.checked = isChecked;
    this.valueChangeForFilter(value, this.counterOfChecked);
  }

  valueChangeForFilter(value, counterOfCheck) {
    let mediaListValue;
    if (counterOfCheck === 0 || counterOfCheck === 2) {
      mediaListValue = this.mediaList;
    } else {
      if (value.viewValue === 'image') {
        if (value.checked) {
          mediaListValue = this.mediaList.filter(item => item.type === 'image');
        } else {
          mediaListValue = this.mediaList.filter(item => item.type === 'audio');
        }
      } else if (value.viewValue === 'audio') {
        if (value.checked) {
          mediaListValue = this.mediaList.filter(item => item.type === 'audio');
        } else {
          mediaListValue = this.mediaList.filter(item => item.type === 'image');
        }
      }
    }
    this.filterMediaListChanges.emit({ mediaListValue, counterOfCheck });
  }

  backToAddLabel() {
    this.modalService.popupModalRef.componentRef.instance.onClose();
    this.modalService.showAddLabelModal(this.labelText, this.note, this.feedback, this.dropzoneDescription, this.media ? this.media.mediaId : "");
  }
  selectMedia() {
    this.selectedMedia.emit(this.media);
  }
  openFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

}
