import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ModalRef } from 'src/app/design-preview-activity/design/shared/modal/manager/modal-ref';
import { ModalManagerService } from 'src/app/design-preview-activity/design/shared/modal/manager/modal.service';
import { ModalOptions } from '../modal-popup/modal.options';
import { take, takeUntil } from 'rxjs/operators';
import { AddLabelComponent } from '../../design-preview-activity/design/add-label/add-label.component';
import { CdStateService } from '../cd-state/cd-state.service';
import { BehaviorSubject } from 'rxjs';
import { AddMediaComponent } from '../../design-preview-activity/design/add-label/add-media/add-media.component';
import { APP_CONFIG } from 'src/app/shared/constants/appconfig';
import { MediaComponent } from '../../design-preview-activity/design/components/media/media.component';
import { EditImageDescriptionComponent } from '../../design-preview-activity/design/components/edit-image-description/edit-image-description.component';
import { DummyMediaData } from '../../config/dummyData';
import { GroupsComponent } from 'src/app/design-preview-activity/design/canvas/groups/groups.component';
import { UndoRedoService } from '../undo-redo/undo-redo.service';
import { MediaService } from '../media/media.service';
import { WarningMessageComponent } from 'src/app/design-preview-activity/design/warning-message/warning-message.component';
import { DragAndDropServiceService } from 'src/app/shared/services/drag-and-drop-service.service';
import { TranscriptPopupService } from '../../shared/services/transcript-popup/transcript-popup.service';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  modalRefs = [];
  labelList = [];
  modalOptions: any;
  // public labelData: BehaviorSubject<any> = new BehaviorSubject<any>({});
  stateUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  // public addLabelModalRef: ModalRef<AddLabelComponent>;
  public popupModalRef: ModalRef<any>;
  public defaultDesc: string = '';
  public defaultAltText: string = '';
  public tempLabelText: any;
  public tempNote: any;
  public tempMediaId: any;
  public tempFeedback: any;
  public defaultDescForLabels = [];
  public tempDropzoneDescription: any;
  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private modalService: ModalManagerService,
    private cdStateService: CdStateService,
    private undoRedoService: UndoRedoService,
    private mediaService: MediaService,
    private dragAndDropService: DragAndDropServiceService,
    private transcriptPopup: TranscriptPopupService,
    private undoRedo: UndoRedoService,
    private announcer: LiveAnnouncer,
    private a11yHelper: A11yHelperService,
    private translate: TranslateService
  ) {
    this.labelList = cdStateService.getState().labelData.labels;
    this.cdStateService.checkHeight.subscribe((val) => {
      if (val === true) {
        const state = this.cdStateService.getState();
        let maxHeight = Math.max.apply(
          Math,
          state.labelData.labels.map((label) => label.height)
        );
        this.cdStateService.labelHeight = maxHeight;
        this.updateHeightOfDocks(state.dockData.docks, maxHeight);
      }
    });
  }

  showAddLabelModal(labelText?, note?, feedback?, dropzoneDescription?, mediaId?) {
    let modalRef: ModalRef<AddLabelComponent>;
    this.tempFeedback = feedback;
    this.tempLabelText = labelText;
    this.tempMediaId = mediaId;
    this.tempNote = note;
    this.tempDropzoneDescription = dropzoneDescription;
    const initialState: ModalOptions = {
      type: 'custom',
      titleText: this.translate.instant('MODAL.EDIT_LABEL'),
      confirmButtonText: this.translate.instant('MODAL.SAVE_LABEL'),
      contentText: '',
      cancelButtonText: this.translate.instant('MODAL.CANCEL'),
      showFooter: true,
      panelClass: 'edit-label-custom-modal',
    };

    modalRef = this.modalService.open(AddLabelComponent, initialState, 1);
    this.popupModalRef = modalRef;
    // this.addLabelModalRef = modalRef;
    if (mediaId) {
      modalRef.modalContent.mediaId = mediaId;
      // modalRef.modalContent.mediaType = media.type;
      modalRef.modalContent.mediaFromMediaComponent = true;
    }
    if (labelText) {
      modalRef.modalContent.labelText = labelText;
    }
    if (note) {
      modalRef.modalContent.note = note;
    }
    if (feedback) {
      modalRef.modalContent.feedback = feedback;
    }
    if (dropzoneDescription) {
      modalRef.modalContent.dropzoneDescription = dropzoneDescription;
    }

    let closeSubscription = modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      this.transcriptPopup.close();
      modalRef.close();
      this.updateErrorForLabel();
      confirmSubscription.unsubscribe();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      this.transcriptPopup.close();
      modalRef.close();
      this.updateErrorForLabel();
      confirmSubscription.unsubscribe();
    });

    modalRef.componentRef.instance.open.pipe(take(1)).subscribe(() => {
      const modalEl = document.querySelector('.ahe-ui-dropdown > [aria-expanded="true"]') as HTMLElement;
      modalEl.focus({ preventScroll: true });
    });

    let confirmSubscription = modalRef.componentRef.instance.confirm
      .pipe(takeUntil(modalRef.componentRef.instance.destroy$))
      .subscribe(() => {
        console.log('confirm!', modalRef);
        const undoObj = {
          actionName: 'add-label-modal',
          actionData: {
            old: this.cdStateService.getDataOfFields(),
            new: {},
          },
        };
        this.tempLabelText = modalRef.modalContent.labelText;
        this.tempMediaId = modalRef.modalContent.mediaId;
        this.tempNote = modalRef.modalContent.note;
        this.tempFeedback = modalRef.modalContent.feedback;
        this.tempDropzoneDescription = modalRef.modalContent.dropzoneDescription;
        const mediaType = modalRef.modalContent.mediaType;
        const index = this.cdStateService.labelIndex;
        let labelData = this.cdStateService.getState().labelData.labels[index];
        const duplicateLabelFound = this.checkDuplicateLabels(modalRef.modalContent.labelText);
        if (duplicateLabelFound) {
          console.log('Show Popup');
          modalRef.close();
          this.onDuplicateLabelsFound(
            this.tempLabelText,
            this.tempNote,
            this.tempFeedback,
            this.tempMediaId,
            this.tempDropzoneDescription
          );
        } else {
          const labelText = modalRef.modalContent.labelText;
          const mediaId = modalRef.modalContent.mediaId;
          const note = modalRef.modalContent.note;
          const feedback = modalRef.modalContent.feedback;
          const dropzoneDescription = modalRef.modalContent.dropzoneDescription;
          const mediaType = modalRef.modalContent.mediaType;
          const index = this.cdStateService.labelIndex;
          const state = this.cdStateService.getState();
          if (mediaType === '' && labelText === '') {
            modalRef.modalContent.labelErrors = ['Field is mandatory'];
          } else if (!labelData.distractor && dropzoneDescription === '' && state.activity.name !== 'grouping') {
            modalRef.modalContent.dropzoneDescErrors = ['Please enter text for Drop Zone description'];
          } else {
            if (state.labelData.labels[index].image.mediaId !== '' && mediaId === '') {
              state.labelData.labels[index].height -= 120;
            } else {
              if (mediaId && mediaId !== '') {
                state.labelData.labels[index].height = document.getElementById('labelMediaPreview')?.offsetHeight;
              } else {
                state.labelData.labels[index].height = document.getElementById('labelPreview')?.offsetHeight;
              }
              // state.labelData.labels[index].height = modalRef.modalContent.labelHeight;
            }
            state.labelData.labels[index].text = labelText;
            state.labelData.labels[index].richText = labelText;
            state.labelData.labels[index].note = note;
            state.labelData.labels[index].feedback = feedback;
            state.labelData.labels[index].dropzoneDescription = dropzoneDescription;
            state.labelData.labels[index].mediaType = mediaType;
            if (mediaType === 'image') {
              state.labelData.labels[index].image.mediaId = mediaId; //= this.setMediaData(media);
              const media = this.mediaService.getMediaDetails(mediaId);
              if (modalRef.modalContent.longDescription !== media.description) {
                state.labelData.labels[index].image.description = modalRef.modalContent.longDescription;
              } else {
                state.labelData.labels[index].image.description = '';
              }
              if (modalRef.modalContent.shortDescription !== media.altText) {
                state.labelData.labels[index].image.altText = modalRef.modalContent.shortDescription;
              } else {
                state.labelData.labels[index].image.altText = '';
              }
              this.cdStateService.updateImageDescription.next({ isEdited: true, updatedFor: 'label' });
            } else {
              state.labelData.labels[index].audio.mediaId = mediaId;
            }
            let maxHeight = Math.max.apply(
              Math,
              state.labelData.labels.map((label) => label.height)
            );
            this.cdStateService.labelHeight = maxHeight;
            this.updateHeightOfDocks(state.dockData.docks, maxHeight);
            this.cdStateService.updateDockHeightOnAddingMedia.next(true);
            undoObj.actionData.new = this.cdStateService.getDataOfFields();
            this.undoRedoService.updateUndoArray(undoObj);
            this.cdStateService.labelTextUpdated.next(state.labelData.labels[index].id);
            this.cdStateService.stateUpdated.next(true);
            this.transcriptPopup.close();
            modalRef.close();
            confirmSubscription.unsubscribe();
          }

          if (state.activity.name === 'grouping') {
            setTimeout(() => {
              this.cdStateService.checkForMaxBoundryHeight();
            }, 100);
          }

          this.cdStateService.stateUpdated.next(true);
          this.cdStateService.removeHighlight.next(state.labelData.labels[index]);
        }
        this.cdStateService.updateMediaConsumption();
      });
  }

  ngOnInit() {
    this.translate.get([
      'IMG_DELETE_POPUP.WARNING_TITLE',
      'IMG_DELETE_POPUP.CONFIRM_BUTTON',
      'IMG_DELETE_POPUP.CONTENT_TEXT',
      'IMG_DELETE_POPUP.CANCEL_BUTTON'
    ]).subscribe(translations => {
      this.modalOptions = {
        type: 'custom',
        titleText: translations['IMG_DELETE_POPUP.WARNING_TITLE'],
        confirmButtonText: translations['IMG_DELETE_POPUP.CONFIRM_BUTTON'],
        contentText: translations['IMG_DELETE_POPUP.CONTENT_TEXT'],
        cancelButtonText: translations['IMG_DELETE_POPUP.CANCEL_BUTTON'],
      };
    });


  }
  translateLabelOptions(options: { [key: string]: string }): any[] {
    return Object.keys(options).map(key => {
      const translatedValue = this.translate.instant(`appconfig.label_options.${options[key]}`);
      console.log(`Translating ${options[key]} to ${translatedValue}`);
      return { value: options[key], viewValue: translatedValue };
    });
  }
  updateErrorForLabel() {
    const index = this.cdStateService.labelIndex;
    const state = this.cdStateService.getState();
    // this.cdStateService.removeHighlight.next(state.labelData.labels[index]);
    const label = state.labelData.labels[index];
    if (
      (label.text === '' && label.mediaType !== 'image') ||
      (label.dropzoneDescription === '' && !label.distractor && state.activity.name === 'labeling')
    ) {
      this.cdStateService.highlightErrorLabel.next(label);
    }
  }
  updateHeightOfDocks(docks, maxHeight) {
    const state = this.cdStateService.getState();
    let bgData = state.frameData.frames[0];
    let length = docks.length;
    let yPos, xPos, width;
    let docsAboveImg = [],
      docsBelowImg = [],
      docsLeftToImg = [],
      docsRightToImg = [];
    let bgMoved = false;
    let bgYPos = bgData.position.y;
    let tempDocks = JSON.parse(JSON.stringify(docks));
    tempDocks.sort((a, b) => {
      return a.position.y - b.position.y;
    });

    // Finding the docks which are above, below, right and left of the background image
    tempDocks.forEach((dock) => {
      if (dock.position.x < bgData.width + bgData.position.x && dock.position.x + dock.width > bgData.position.x) {
        if (dock.position.y < bgData.position.y) {
          docsAboveImg.push(dock);
        } else {
          docsBelowImg.push(dock);
        }
      }
      if (dock.position.x + dock.width < bgData.position.x) {
        docsLeftToImg.push(dock);
      } else if (dock.position.x > bgData.position.x + bgData.width) {
        docsRightToImg.push(dock);
      }
    });

    // adjusting the image position to avoid overlapping with docks which are above the image
    docsAboveImg.forEach((dock) => {
      // dock.height = maxHeight;
      if (bgData.position.y - dock.position.y) {
        // bgYPos = bgData.position.y;
        bgMoved = true;
        bgData.position.y = dock.position.y + this.cdStateService.labelHeight + 30;
        docks.forEach((dockAbove) => {
          if (dock.id === dockAbove.id) {
            if (dockAbove.leaderLine) {
              dockAbove.leaderLine.position.y = dockAbove.position.y + this.cdStateService.labelHeight;
            }
          }
        });
      }
    });

    // adjusting the image position to avoid overlapping with docks which are below the image
    for (let i = 0; i < docsBelowImg.length; i++) {
      docks.forEach((dock) => {
        // dock.height = maxHeight;
        if (docsBelowImg[i].id === dock.id) {
          if (dock.position.y - bgData.position.y < bgData.height) {
            dock.position.y = bgData.position.y + bgData.height + 20;
            docsBelowImg[i].position.y = bgData.position.y + this.cdStateService.labelHeight + 20;
            if (dock.leaderLine) {
              dock.leaderLine.position.y = dock.position.y + this.cdStateService.labelHeight / 2;
            }
          }
        }
      });
    }

    //  adjusting the y axis of docks which are right to image to avoid overlaping
    this.adjustingDockPosition(docsRightToImg, docks, maxHeight, bgMoved, bgYPos, bgData);

    //  adjusting the y axis of docks which are left to image to avoid overlaping
    this.adjustingDockPosition(docsLeftToImg, docks, maxHeight, bgMoved, bgYPos, bgData);
    if (this.cdStateService.getState().activity.name === 'labeling') {
      docks.forEach((dock) => {
        dock.height = this.cdStateService.labelHeight;
      });
    }

    this.cdStateService.leaderLineNodes.forEach((node) => {
      node.nodeRef.position.y += bgData.position.y - bgYPos;
    });

    // increasing the canvas height when docks height is increasing
    let maxYPos = Math.max.apply(
      Math,
      docks.map((dock) => dock.position.y)
    );
    const maximumHeight = maxYPos + this.cdStateService.labelHeight + 20;
    if (maximumHeight > state.canvas.height + APP_CONFIG.APP_BORDER) {
      state.canvas.height += maximumHeight - state.canvas.height;
      console.log(state.canvas.height);
      this.cdStateService.updateIframeSize(state.canvas.width, state.canvas.height);
    }
    this.cdStateService.heightAdjustingOfDock.next(true);
  }

  adjustingDockPosition(updatedDocs, docks, maxHeight, bgMoved, bgYPos, bgData) {
    let yPos, xPos, width;
    if (updatedDocs[0] !== undefined) {
      docks.forEach((dock) => {
        if (updatedDocs[0].id === dock.id) {
          if (dock.leaderLine) {
            switch (dock.leaderLine.direction) {
              case 'top':
                dock.leaderLine.position.y = dock.position.y;
                break;
              case 'bottom':
                dock.leaderLine.position.y = dock.position.y + this.cdStateService.labelHeight;
                break;
              case 'right':
              case 'left':
                dock.leaderLine.position.y = dock.position.y + this.cdStateService.labelHeight / 2;
            }
          }
        }
      });
    }

    for (let i = 1; i < updatedDocs.length; i++) {
      yPos = updatedDocs[i - 1].position.y;
      xPos = updatedDocs[i - 1].position.x;
      width = updatedDocs[i - 1].width;
      docks.forEach((dock) => {
        // dock.height = maxHeight;
        if (updatedDocs[i].id === dock.id) {
          if (
            dock.position.y - yPos - APP_CONFIG.NEW_DOCK_SEPARATION_GAP < this.cdStateService.labelHeight &&
            xPos + width > dock.position.x
          ) {
            dock.position.y = yPos + this.cdStateService.labelHeight + 20;
            if (dock.leaderLine) {
              dock.leaderLine.position.y = dock.position.y + this.cdStateService.labelHeight / 2;
            }
            updatedDocs[i].position.y = yPos + this.cdStateService.labelHeight + 20;
          }
        }
      });
    }
  }

  checkDuplicateLabels(labelText: string) {
    let text = this.cdStateService.stripHtmlTags(labelText).toLowerCase().replace(/ /g, '').trim();
    let state = this.cdStateService.getState();
    const index = this.cdStateService.labelIndex;
    const labels = state.labelData.labels;
    const currentLabelText = this.cdStateService
      .stripHtmlTags(labels[index].text)
      .toLowerCase()
      .replace(/ /g, '')
      .trim();
    if (currentLabelText === text) {
      return false;
    }
    for (var label of labels) {
      const currentText = this.cdStateService.stripHtmlTags(label.text).toLowerCase().replace(/ /g, '').trim();
      if (text === currentText && text !== '') {
        return true;
      }
    }
    return false;
  }

  onDuplicateLabelsFound(labelText?, note?, feedback?, mediaId?, dropzoneDescription?) {
    let state = this.cdStateService.getState();
    let contentText = 'Label text has already been used for another label. Please update the text and save again.';

    let title = 'Duplicate Labels Found';

    let modalOptions = {
      type: 'custom',
      titleText: title,
      contentText: contentText,
      cancelButtonText: '',
      confirmButtonText: 'OK',
    };

    let modalRef;

    modalRef = this.modalService.open(AddLabelComponent, modalOptions);
    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      console.log('confirm!', modalRef);
      modalRef.close();
      this.showAddLabelModal(labelText, note, feedback, dropzoneDescription, mediaId);
    });

    let closeSubscription = modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
      this.showAddLabelModal(labelText, note, feedback, dropzoneDescription, mediaId);
    });
  }
  // clearLabelFieldOnCloseCancel() {
  //   const state = this.cdStateService.getState();
  //   const index = this.cdStateService.labelIndex;
  //   state.labelData.labels[index].text = '';
  //   state.labelData.labels[index].hint = '';
  //   state.labelData.labels[index].feedback = '';
  //   this.cdStateService.setState(JSON.stringify(state));
  // }

  addMediaPopup(labelText?, feedback?, note?, dropzoneDescription?, mediaId?) {
    let modalRef: ModalRef<AddMediaComponent>;
    const initialState: ModalOptions = {
      type: 'custom',
      titleText: 'Label',
      showFooter: false,
      panelClass: 'custom-modal',
    };
    modalRef = this.modalService.open(AddMediaComponent, initialState, 2);
    this.popupModalRef = modalRef;
    modalRef.modalContent.mediaList = this.mediaService.mediaList; //DummyMediaData.dummyMediaList;
    modalRef.modalContent.labelText = labelText;
    modalRef.modalContent.feedback = feedback;
    modalRef.modalContent.note = note;
    modalRef.modalContent.mediaId = mediaId;
    modalRef.modalContent.dropzoneDescription = dropzoneDescription;
    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });
  }

  showDeleteLabelModal(index?) {
    let state = this.cdStateService.getState();
    let text =
      state.activity.name !== 'grouping'
        ? APP_CONFIG.MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL
        : APP_CONFIG.MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL_FOR_GROUPING;
    let contentText = state.labelData.labels[index].distractor
      ? APP_CONFIG.MODAL_POPUP_MESSAGE_ON_DELETE_FOR_DISTRACTOR
      : text;

    let title = state.labelData.labels[index].distractor
      ? APP_CONFIG.DELETE_CONFIRMATION_DISTRACTOR
      : APP_CONFIG.DELETE_CONFIRMATION_LABEL;

    let modalOptions = {
      type: 'custom',
      titleText: title,
      confirmButtonText: 'OK',
      contentText: contentText,
      cancelButtonText: 'Cancel',
    };

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      console.log('closed');
      modalRef.close();
    });

    modalRef.componentRef.instance.open.pipe(take(1)).subscribe(() => {
      const dropDownEl = document.querySelector('.ahe-ui-dropdown > [aria-expanded="true"]') as HTMLElement;
      dropDownEl.focus({ preventScroll: true });
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      console.log('confirm!', modalRef);
      const undoObj = {
        actionName: 'delete-Label-grouping',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      this.cdStateService.deleteLabelOrDistractor(index);
      let maxHeight = Math.max.apply(
        Math,
        state.labelData.labels.map((label) => label.height)
      );
      this.cdStateService.labelHeight = maxHeight;
      this.cdStateService.heightAdjustingOfDock.next(true);
      this.cdStateService.stateUpdated.next(true);
      undoObj.actionData.new = this.cdStateService.getDataOfFields();
      this.undoRedoService.updateUndoArray(undoObj);
      modalRef.close();
    });
  }

  // addImage() {
  //   let modalRef;
  //   const initialState: ModalOptions = {
  //     type: 'custom',
  //     titleText: 'Add Image',
  //     confirmButtonText: 'Add',
  //     cancelButtonText: 'Cancel',
  //   };
  //   modalRef = this.modalService.open(MediaComponent, initialState);
  addMediaModal(mediaList, showSearch, groupmedia?, index?) {
    let text, cancelButtonText, confirmButtonText, panelClass, isMedia;
    if (mediaList.length < 1) {
      text = APP_CONFIG.NO_IMAGE_MEDIA;
      cancelButtonText = '';
      confirmButtonText = 'OK';
      showSearch = false;
      panelClass = '';
      isMedia = false;
    } else {
      text = '';
      cancelButtonText = 'cancel';
      confirmButtonText = 'Add';
      panelClass = 'custom-modal';
      isMedia = true;
    }
    let modalRef: ModalRef<MediaComponent>;
    const initialState: ModalOptions = {
      type: 'custom',
      titleText: 'Add Image',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      panelClass: panelClass,
      contentText: text,
    };
    modalRef = this.modalService.open(MediaComponent, initialState);
    modalRef.modalContent.mediaList = mediaList;
    modalRef.modalContent.showSearch = showSearch;

    // modalRefs.push(this.modalRef);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      console.log('closed');
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      console.log('confirm!', modalRef);
      if (isMedia) {
        const undoObj = {
          actionName: 'bg-image-add-labeling',
          actionData: {
            old: this.cdStateService.getDataOfFields(),
            new: {},
          },
        };
        // state.frameData.frames[0].media = modalRef.modalContent.mediaContent;
        // this.defaultDesc = modalRef.modalContent.mediaContent.description;

        if (groupmedia === 'group') {
          let state = this.cdStateService.getState();
          let duplicateImage = this.checkDuplicateImage(modalRef.modalContent.mediaContent.mediaId);
          if (duplicateImage) {
            this.onDuplicateImageFound(mediaList, showSearch, groupmedia, index);
          } else {
            state.dockData.docks[index].isImageAdded = true;
            state.dockData.docks[index].media.mediaId = modalRef.modalContent.mediaContent.mediaId; //this.setMediaData(modalRef.modalContent.mediaContent);
            undoObj.actionData.new = this.cdStateService.getDataOfFields();
            this.undoRedoService.updateUndoArray(undoObj);
            console.log(state.dockData.docks[index].media);
            this.cdStateService.editDescriptionButtonDisable.next(false);
            this.cdStateService.groupHasImage.next(true);
            this.cdStateService.groupContainerWidthUpdate.next(true);
          }
        } else {
          let state = this.cdStateService.getState();
          state.frameData.frames[0].mediaAdded = true;
          state.frameData.frames[0].media.mediaId = modalRef.modalContent.mediaContent.mediaId; //this.setMediaData(modalRef.modalContent.mediaContent);
          undoObj.actionData.new = this.cdStateService.getDataOfFields();
          this.undoRedoService.updateUndoArray(undoObj);
          // this.defaultDesc = modalRef.modalContent.mediaContent.description;
        }
        this.cdStateService.bgImageDataUpdated.next(true);
        setTimeout(() => {
          this.cdStateService.checkForMaxBoundryHeight();
        }, 100);
        this.cdStateService.updateMediaConsumption();
        modalRef.close();
      } else {
        modalRef.close();
      }
    });
  }
  setMediaData(data) {
    return {
      mediaId: data.mediaId,
      description: '',
      altText: '',
      title: data.title,
      type: data.type,
    };
  }

  editImageDescriptionModal(labelData?, matchString?) {
    let modalRef: ModalRef<EditImageDescriptionComponent>;
    const initialState: ModalOptions = {
      type: 'custom',
      titleText: 'Edit Description',
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      showFooter: true,
      panelClass: 'edit-image-modal',
    };
    modalRef = this.modalService.open(EditImageDescriptionComponent, initialState);
    this.popupModalRef = modalRef;
    modalRef.modalContent.type = matchString;
    modalRef.modalContent.labelData = labelData;

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      const state = this.cdStateService.getState();
      if (matchString === 'editImageDescForLabels') {
        const media = this.mediaService.getMediaDetails(labelData.image.mediaId);
        if (modalRef.modalContent.description !== media.description) {
          labelData.image.description = modalRef.modalContent.description;
        } else {
          labelData.image.description = '';
        }
        if (modalRef.modalContent.altText !== media.altText) {
          labelData.image.altText = modalRef.modalContent.altText;
        } else {
          labelData.image.altText = '';
        }
        // labelData.image.editDesc = modalRef.modalContent.description;
        // labelData.image.altText = modalRef.modalContent.altText;
      } else {
        state.frameData.frames[0].media.description = modalRef.modalContent.description;
        state.frameData.frames[0].media.description = modalRef.modalContent.altText;
      }
      modalRef.close();
    });
  }
  onDuplicateImageFound(mediaList, showSearch, groupmedia?, index?) {
    let state = this.cdStateService.getState();
    //const index = this.cdStateService.labelIndex;
    let contentText = 'The selected image has already been used for another group.';

    let title = 'Duplicate Images Found';

    let modalOptions = {
      type: 'custom',
      titleText: title,
      contentText: contentText,
      cancelButtonText: '',
      confirmButtonText: 'OK',
    };

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);
    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      console.log('confirm!', modalRef);
      modalRef.close();
      this.addMediaModal(mediaList, showSearch, groupmedia, index);
    });

    let closeSubscription = modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
      this.addMediaModal(mediaList, showSearch, groupmedia, index);
    });
  }
  checkDuplicateImage(mediaId: any) {
    let state = this.cdStateService.getState();
    const docks = state.dockData.docks;
    for (var dock of docks) {
      if (mediaId === dock.media.mediaId) {
        console.log('Duplicate Image');
        return true;
      }
    }
    return false;
  }

  guideDeleteModal() {
    let modalOptions = {
      type: 'custom',
      titleText: 'Warning',
      confirmButtonText: 'OK',
      contentText: 'Are you sure you want to delete all guides?',
      cancelButtonText: 'Cancel',
    };

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      console.log('closed');
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      const undoObj = {
        actionName: 'delete-all-guides',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      this.cdStateService.guideLineDelete.next(true);
      undoObj.actionData.new = this.cdStateService.getDataOfFields();
      this.undoRedoService.updateUndoArray(undoObj);
      modalRef.close();
    });
  }

  viewPortWarning(value: string) {
    let modalOptions = {
      type: 'warning',
      titleText: 'Warning',
      confirmButtonText: 'OK',
      contentText: `Canvas ${value} is too small, please update the ${value} so that all Canvas elements are visible.`,
      cancelButtonText: '',
    };

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });
  }
  bgImageDealeteWarningPopUp() {
    let modalOptions = {
      type: 'custom',
      titleText: 'Warning',
      confirmButtonText: 'OK',
      contentText:
        'Are you sure you want to delete the Background image? All leader lines created will also be deleted.',
      cancelButtonText: 'Cancel',
    };

    console.log(modalOptions);
    this.translate.use(EZ.language).subscribe(() => {
      // this.currentLanguage = this.translate.currentLang; // Store current language
      this.translate.get('modalOptions.contentText').subscribe((translation: string) => {
        modalOptions.contentText = translation;
      });
      this.translate.get('modalOptions.cancelButtonText').subscribe((translation: string) => {
        modalOptions.cancelButtonText = translation;
      });
      this.translate.get('modalOptions.titleText').subscribe((translation: string) => {
        modalOptions.titleText = translation;
      });
      this.translate.get('modalOptions.confirmButtonText').subscribe((translation: string) => {
        modalOptions.confirmButtonText = translation;
      });
    });

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      console.log('closed');
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      let state = this.cdStateService.getState();
      this.cdStateService.imageDataUpdated.next('delete');
      state.frameData.frames[0].mediaAdded = false;
      state.frameData.frames[0].media.mediaId = '';
      state.frameData.frames[0].media.altText = '';
      state.frameData.frames[0].media.description = '';
      this.cdStateService.bgImageDataUpdated.next(true);
      this.cdStateService.deleteAllLeaderLines();
      this.cdStateService.updateMediaConsumption();
      modalRef.close();
    });
  }
  duplicateGroupName(dockIndex, label, editor) {
    let contentText = 'There is another group with the same title, please update and save again.';

    let title = 'Duplicate Group Name';
    const stateData = this.cdStateService.getState();
    const bucket = stateData.dockData.docks;

    let modalOptions = {
      type: 'custom',
      titleText: title,
      contentText: contentText,
      cancelButtonText: '',
      confirmButtonText: 'OK',
      focusOnConfirm: true,
    };

    let modalRef;
    // due to editor focus out some time its showing multiple popup and in ngx shared we dont have any option to check is popup opened
    const modalEl = Array.from(document.querySelectorAll('.modal-dialog'));
    if (modalEl.length === 0) {
      modalRef = this.modalService.open(WarningMessageComponent, modalOptions);
      modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
        bucket[dockIndex].headerText = label;
        // this.cdStateService.stateUpdated.next(true);
        if (label === '' || label === undefined) {
          this.cdStateService.updateTinyMcePlaceHolder(editor, APP_CONFIG.GROUP_EDITOR_PLACEHOLDER);
        }
        modalRef.close();
      });
      modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
        bucket[dockIndex].headerText = label;
        if (label === '' || label === undefined) {
          this.cdStateService.updateTinyMcePlaceHolder(editor, APP_CONFIG.GROUP_EDITOR_PLACEHOLDER);
        }
        modalRef.close();
      });
    }
  }
  groupDeleteWarningPopUp(state, selectedObject) {
    const dropZones = state.dockData.docks;
    const labels = state.labelData.labels;
    const dropZone = dropZones.filter((dZ) => dZ === selectedObject)[0];
    const dropZoneIndex = dropZones.indexOf(dropZone);
    const linkedLabel = dropZone.linkedLabel;
    const groupName = this.cdStateService.stripHtmlTags(selectedObject.headerText);
    const value = groupName !== '' ? groupName : dropZoneIndex + 1;
    let modalOptions = {
      type: 'custom',
      titleText: 'Warning',
      confirmButtonText: 'OK',
      contentText: `Are you sure you want to delete Group ${value}?`,
      cancelButtonText: 'Cancel',
    };

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      console.log('closed');
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      let undoObj = {
        actionName: 'add-new-group-grouping',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      dropZones.splice(dropZoneIndex, 1);
      const sortedlabel = labels.sort((a: { id: number }, b: { id: number }) => {
        return a.id - b.id;
      });
      for (let i = 0; i < sortedlabel.length; i++) {
        for (let j = 0; j < linkedLabel.length; j++) {
          if (sortedlabel[i].id === linkedLabel[j]) {
            sortedlabel[i].dockedTo.splice(sortedlabel[i].dockedTo.indexOf(dropZone.id), 1);
            if (state.activity.options.labelInteraction === 'one-label-one-dock') {
              this.dragAndDropService.removeDisbaleClass.next(linkedLabel[j]);
            }
          }
        }
      }
      this.cdStateService.updateHeightOnGroupDeletion.next({ isGroupDeleted: true });
      undoObj.actionData.new = this.cdStateService.getDataOfFields();
      this.undoRedoService.updateUndoArray(undoObj);
      this.cdStateService.bgImageDataUpdated.next(true);
      this.cdStateService.groupLengthUpdate.next(true);
      this.cdStateService.groupImageDescUpdate.next(true);
      setTimeout(() => {
        this.cdStateService.checkForMaxBoundryHeight();
      }, 100);
      modalRef.close();
    });
    this.cdStateService.editDescriptionButtonDisable.next(false);
    this.cdStateService.groupContainerWidthUpdate.next(true);
  }
  deleteDocWarning(state, selectedObject) {
    const dropZones = state.dockData.docks;
    const labels = state.labelData.labels;
    const dropZone = dropZones.filter((dZ) => dZ === selectedObject)[0];
    const dropZoneIndex = dropZones.indexOf(selectedObject);
    let index;
    let modalOptions = {
      type: 'custom',
      titleText: 'Warning',
      confirmButtonText: 'OK',
      contentText:
        'Are you sure you want to delete the selected Dock? Deleting the Dock will remove the corresponding Label as well.',
      cancelButtonText: 'Cancel',
    };

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      console.log('closed');
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      const undoObj = {
        actionName: 'delete-dropzone-from-header',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      const labelId = dropZone.linkedLabel[0];
      for (let i = 0; i < labels.length; i++) {
        if (labels[i].id === labelId) {
          index = i;
        }
      }
      this.cdStateService.deleteLabelOrDistractor(index);
      let maxHeight = Math.max.apply(
        Math,
        state.labelData.labels.map((label) => label.height)
      );
      for (let i = 0; i < this.cdStateService.leaderLineNodes.length;) {
        const node = this.cdStateService.leaderLineNodes[i];
        if (node.dockRef === dropZone) {
          this.cdStateService.leaderLineNodes.splice(i, 1);
        } else {
          i++;
        }
      }
      this.cdStateService.labelHeight = maxHeight;
      this.cdStateService.heightAdjustingOfDock.next(true);
      this.cdStateService.stateUpdated.next(true);
      undoObj.actionData.new = this.cdStateService.getDataOfFields();
      this.undoRedoService.updateUndoArray(undoObj);
      modalRef.close();
    });
  }

  longDescriptionPopup(value: string) {
    let modalOptions = {
      type: 'warning',
      titleText: 'Image Description',
      confirmButtonText: '',
      contentText: value,
      cancelButtonText: '',
      showFooter: false,
    };

    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });
  }

  onReset() {
    let modalOptions = {
      type: 'custom',
      titleText: 'Reset all?',
      confirmButtonText: 'Yes, proceed',
      contentText:
        ' If you reset the activity, all of your changes will be lost. Do you want to proceed?',
      cancelButtonText: 'Cancel',
    };
    let modalRef;

    modalRef = this.modalService.open(WarningMessageComponent, modalOptions);

    modalRef.componentRef.instance.close.pipe(take(1)).subscribe(() => {
      modalRef.close();
    });

    modalRef.componentRef.instance.cancel.pipe(take(1)).subscribe(() => {
      console.log('closed');
      modalRef.close();
    });

    modalRef.componentRef.instance.confirm.pipe(take(1)).subscribe(() => {
      // this.cdStateService.setResposeData(preservedState.stateFields.response);
      // this.cdStateService.stateResetTestMode.next(true);
      this.undoRedo.resetState();
      this.cdStateService.disablResetAll.next(true);
      modalRef.close();
      this.announcer.announce(this.a11yHelper.getAnnounceMsg('resetLabel'), 'assertive');
    });
  }
}
