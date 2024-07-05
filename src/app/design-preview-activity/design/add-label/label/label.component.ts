import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild } from '@angular/core';
import { ButtonPurpose, ButtonType, MheOption } from '@mhe/ngx-shared';
import { CdStateService } from '../../../../services/cd-state/cd-state.service';
import { ModalService } from '../../../../services/modal-popup/modal.service';
import { APP_CONFIG } from '../../../../shared/constants/appconfig';
import { MediaService } from '../../../../services/media/media.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
})
export class LabelComponent implements OnInit, AfterViewInit {
  @Output() getLabelText = new EventEmitter();
  @Output() deleteMedia = new EventEmitter();
  @Output() getShortDescription = new EventEmitter();
  @Output() getLongDescription = new EventEmitter();
  @Output() getLabelHeight = new EventEmitter();
  @Input() labelText;
  @Input() feedback;
  @Input() note;
  @Input() dropzoneDescription;
  @Input() mediaId;
  @Input() labelErrors;
  @Input() labelData;

  _buttonPurpose = ButtonPurpose;
  buttonType = ButtonType;
  mediaContent;
  expand = true;
  labelPreviewData: string;
  isLabelText: boolean;
  isMediaContent: boolean;
  labelHeight: Number;
  imageWidth: Number = 0;
  imageHeight: Number = 0;
  imageStyle: string;
  media;
  mediaType;
  editedDescription: string = '';

  labelOptions: MheOption[] = [
    { value: 0, viewValue: 'Edit' },
    { value: 1, viewValue: 'Delete' },
  ];

  @ViewChild('editor') editor;

  constructor(
    public _cdStateService: CdStateService,
    private modalService: ModalService,
    private mediaService: MediaService,
    private translate: TranslateService
  ) { }
  getTranslatedText(key: string): string {
    return this.translate.instant(key);
  }
  ngOnInit(): void {
    this.labelPreviewData = this.labelText ? this.labelText : this.getTranslatedText('LABEL.PREVIEW');
    this.isLabelText = this.labelText ? true : false;
    this.mediaInitialized();
    if (this.labelData) {
      if ((this.labelData.image.description !== '' || this.labelData.image.altText !== '') && this.labelData.image.mediaId === this.mediaId) {
        this.media = JSON.parse(JSON.stringify(this.mediaService.getMediaDetails(this.labelData.image.mediaId)));
        this.media.description = this.labelData.image.description;
        this.media.altText = this.labelData.image.altText;
        this.mediaType = this.media.type;
      } else if (this.mediaId) {
        this.media = this.mediaService.getMediaDetails(this.mediaId);
        this.mediaType = this.media.type;
      }
    }
  }
  expandPanel() {
    this.expand = !this.expand;
  }
  setDescription(text) {
    this.editedDescription = text;
    this.getLongDescription.emit(text);
  }
  setAltText(text) {
    this.getShortDescription.emit(text);
  }
  ngAfterViewInit(): void {
    if (this.isMediaContent) {
      this.labelHeight = document.getElementById('labelMediaPreview')?.offsetHeight;
    } else {
      this.labelHeight = document.getElementById('labelPreview')?.offsetHeight;
    }
    this.getLabelHeight.emit(this.labelHeight);

    this.editor.richTextEditorComponent.loadComplete.subscribe((value) => {
      if (value && this.labelText === '') {
        this._cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.LABEL_EDITOR_PLACEHOLDER);
      }
    });
  }

  mediaInitialized() {
    if (this.mediaId) {
      this.isMediaContent = this.mediaId !== '' ? true : false;
    } else {
      this.isMediaContent = false;
    }
  }

  onImageLoad(event) {
    if (event.target.width > event.target.height) {
      this.imageWidth = 120;
      this.imageHeight = 0;
    } else {
      this.imageHeight = 120;
      this.imageWidth = 0;
    }
    this.imageStyle = 'width:' + (this.imageWidth !== 0 ? this.imageWidth + 'px' : 'auto') + ';height:' + (this.imageHeight !== 0 ? this.imageHeight + 'px' : 'auto');
    if (this.isMediaContent) {
      this.labelHeight = document.getElementById('labelMediaPreview').offsetHeight;
    } else {
      this.labelHeight = document.getElementById('labelPreview').offsetHeight;
    }
    this.getLabelHeight.emit(this.labelHeight);
  }

  // This funcion will keep the tinymce content uptodate for label
  onEditorContentChange(text) {
    this.labelText = text;
    this.getLabelText.emit(text);
    this.labelPreviewData = this.labelText ? this.labelText : 'Label Preview';
    this.isLabelText = this.labelText ? true : false;
    if (text === '') {
      this._cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.LABEL_EDITOR_PLACEHOLDER);
    } else {
      this._cdStateService.updateTinyMcePlaceHolder(this.editor);
    }
  }

  addMedia() {
    // this.modalService.addLabelModalRef.componentRef.instance.hideModal();
    // const mediaContent = JSON.parse(JSON.stringify(this.media));
    this.modalService.popupModalRef.componentRef.instance.onClose();
    this.modalService.addMediaPopup(this.labelText, this.feedback, this.note, this.dropzoneDescription);
  }

  onDropDownSelection(event) {
    console.log(event);
    switch (event[0].viewValue) {
      case 'Edit':
        this.editSelectedMedia();
        break;

      case 'Delete':
        this.deleteSelectedMedia();
        break;

      default:
        console.log('default clicked.');
        break;
    }
  }
  editSelectedMedia() {
    const mediaContent = this.mediaId;
    this.modalService.popupModalRef.componentRef.instance.onClose();
    this.modalService.addMediaPopup(this.labelText, this.feedback, this.note, this.dropzoneDescription, mediaContent);
  }
  deleteSelectedMedia() {
    this.mediaId = '';
    this.mediaType = '';
    const mediaContent = this.mediaId;
    const mediaType = this.mediaType;
    this.mediaInitialized();
    this.deleteMedia.emit({ mediaContent, mediaType });
  }
  heightOfLabel() {
    if (this.isMediaContent) {
      this.labelHeight = document.getElementById('labelMediaPreview').offsetHeight;
    } else {
      this.labelHeight = document.getElementById('labelPreview').offsetHeight;
    }
    this.getLabelHeight.emit(this.labelHeight);
  }
}
