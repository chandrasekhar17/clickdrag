import { Component, Input, OnInit } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';
import { ModalService } from '../../../services/modal-popup/modal.service';

export interface Media {
  path: string;
  altText: string;
  description: string;
}

@Component({
  selector: 'app-background-image',
  templateUrl: './background-image.component.html',
  styleUrls: ['./background-image.component.scss'],
})
export class BackgroundImageComponent implements OnInit {
  @Input() imageType: 'canvas' | 'label' | 'group';
  @Input() backgroundImage: any;
  @Input() labelIndex: number = null;
  @Input() label: any;
  @Input() isDisabled: boolean = false;
  @Input() group: any;
  @Input() groupIndex: number;
  @Input() isPreviewLabel: boolean = false;
  @Input() editedDescription: string = '';
  imageCord = { width: 0, height: 0 };
  media = {} as Media;
  imageStyle: any;
  groupImageMaxHeight: number;

  ariaLabelForGroupImage: string | null = '';
  ariaDescribeForGroupImage: string = '';
  isGroupImageFocus: boolean = false;
  stateData: any;

  constructor(
    private cdStateService: CdStateService,
    private mediaService: MediaService,
    private a11yHelper: A11yHelperService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.groupImageMaxHeight = Math.max.apply(
      Math,
      this.stateData.dockData.docks.map((dock) => dock.image.height)
    );
    if (this.backgroundImage?.media?.mediaId && this.imageType === 'canvas') {
      this.setMedia(this.backgroundImage.media, this.backgroundImage.media.mediaId);
    } else if (this.imageType === 'label' || (this.imageType === 'group' && this.backgroundImage.mediaId !== '')) {
      this.setMedia(this.backgroundImage, this.backgroundImage.mediaId);
      if (this.imageType === 'group') this.setAriaLabelForGroupImage();
    }
    this.cdStateService.updateImageDescription.subscribe((val: any) => {
      if (val.isEdited && val.updatedFor === 'label') {
        this.setMedia(this.backgroundImage, this.backgroundImage.mediaId);
      }
    });
  }

  setMedia(mediaData, mediaId) {
    const media = this.mediaService.getMediaDetails(mediaId);
    this.media = {
      path: media.path,
      altText: this.cdStateService.setImageAltText(media, mediaData, 'altText'),
      description: this.cdStateService.setImageAltText(media, mediaData, 'description'),
    };
  }

  onImageLoad(event, image) {
    const state = this.cdStateService.getState();
    const activityName = state.activity.name;
    const naturalWidth = event.target.naturalWidth;
    const naturalHeight = event.target.naturalHeight;
    this.imageCord = this.cdStateService.getUpdatedImageSize(naturalWidth, naturalHeight, image.width, image.height);

    if (activityName === 'labeling') {
      let imageXPos = this.backgroundImage.position.x + (this.backgroundImage.width - this.imageCord.width) / 2;
      let imageYPos = this.backgroundImage.position.y + (this.backgroundImage.height - this.imageCord.height) / 2;

      this.backgroundImage.position.x = imageXPos;
      this.backgroundImage.position.y = imageYPos;
      this.backgroundImage.width = this.imageCord.width;
      this.backgroundImage.height = this.imageCord.height;
    }
  }

  onLabelImageLoad(event) {
    this.imageCord.width = 0;
    this.imageCord.height = 0;
    if (event.target.width > event.target.height) {
      this.imageCord.width = 120;
    } else {
      this.imageCord.height = 120;
    }
    this.imageStyle =
      'width:' +
      (this.imageCord.width !== 0 ? this.imageCord.width + 'px' : 'auto') +
      ';height:' +
      (this.imageCord.height !== 0 ? this.imageCord.height + 'px' : 'auto');
  }

  openLongDescriptionPopup() {
    if (!this.isDisabled) {
      this.modalService.longDescriptionPopup(this.media.description);
    }
  }

  setAriaLabelForLabelImage() {
    const labelObj = {
      labelText: this.cdStateService.stripHtmlTags(this.label?.text),
      imageIndex:
        this.labelIndex !== null && this.cdStateService.stripHtmlTags(this.label?.text) === ''
          ? this.labelIndex + 1
          : '',
    };
    return this.a11yHelper.getAnnounceMsg('labelImageDescription', labelObj);
  }

  setTabIndexForImageLabel() {
    if (this.isDisabled) return -1;
    return null;
  }

  setRoleApplication() {
    if (EZ.mode === EZ.MODE_TEST) {
      return 'application';
    }
    return null;
  }

  setAriaLabelForGroupImage() {
    const labelObj = {
      groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(this.group?.headerText)),
      shortDescription: '',
    };
    this.ariaLabelForGroupImage = this.a11yHelper.getAnnounceMsg('groupImageDescription', labelObj);
  }

  onFocusInGroupAriaLabel() {
    const labelObj = {
      groupTitle: this.cdStateService.stripHtmlTags(this.a11yHelper.getGroupTitle(this.group?.headerText)),
      shortDescription: this.cdStateService.stripHtmlTags(this.media.altText),
    };
    this.ariaLabelForGroupImage = null;
    this.ariaDescribeForGroupImage = this.a11yHelper.getAnnounceMsg('groupImageDescription', labelObj);
    this.isGroupImageFocus = true;
  }

  onFocusOutGroupAriaLabel() {
    this.setAriaLabelForGroupImage();
    this.isGroupImageFocus = false;
  }

  getImageDescriptionAriaLabel(text) {
    const hasDot = text.endsWith('.');
    return `Image description - Detailed description of the ${hasDot ? text : (text + '.')} opens in a modal.`;
  }
}
