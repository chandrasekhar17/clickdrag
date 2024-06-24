import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { APP_CONFIG } from '../../../../../shared/constants/appconfig';
import { MediaService } from 'src/app/services/media/media.service';

@Component({
  selector: 'app-group-add-image',
  templateUrl: './group-add-image.component.html',
  styleUrls: ['./group-add-image.component.scss'],
})
export class GroupAddImageComponent implements OnInit {
  buttonPurpose = ButtonPurpose;
  stateData: any;
  bucket: any;

  bucketArrayLength: any;

  @Input() group;
  @Input() index;
  @ViewChild('grpImage') grpImage: ElementRef;
  @ViewChild('resizeEl') public resizeEl: ElementRef;
  @Output() getSelectedBoolean = new EventEmitter();
  containerWidth;
  containerHeight;
  imgWidth;
  imgHeight;
  selected;
  selectionObjRef;
  mediaPath;
  media;
  isDescriptionEdited = [];
  editedDescription = [];
  mediaDescription: string = '';
  hasImage: boolean;
  groupImageMaxHeight: number;

  constructor(
    private cdStateService: CdStateService,
    private modalService: ModalService,
    private undoRedoService: UndoRedoService,
    private mediaService: MediaService
  ) {}

  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.bucket = this.stateData.dockData.docks;
    this.selectionObjRef = { group: this.group };
    this.cdStateService.groupContainerWidthUpdate.next(true);
    this.groupImageMaxHeight = Math.max.apply(
      Math,
      this.stateData.dockData.docks.map((dock) => dock.image.height)
    );
    this.cdStateService.selectionUpdated.subscribe((selection) => {
      if (selection.objRef !== this.selectionObjRef) {
        this.selected = false;
      } else if (selection.objRef === this.selectionObjRef) {
        this.selected = true;
      }
      this.getSelectedBoolean.emit(this.selected);
    });
    this.cdStateService.bgImageDataUpdated.subscribe(() => {
      this.setMediaPath();
    });
    this.cdStateService.updateImageDescription.subscribe((val: any) => {
      this.setMediaPath();
    });
    this.cdStateService.groupImageDescUpdate.subscribe((val: any) => {
      if (val) {
        this.setMediaPath();
      }
    });
    this.setMediaPath();
    this.cdStateService.groupHasImage.subscribe((val: any) => {
      if (val) {
        this.hasImage = true;
      } else {
        this.hasImage = false;
      }
    });
    this.cdStateService.groupContainerWidthUpdate.subscribe((val) => {
      if (val) {
        this.groupImageMaxHeight = Math.max.apply(
          Math,
          this.stateData.dockData.docks.map((dock) => dock.image.height)
        );
      }
    });
    console.log('maxHeight', this.groupImageMaxHeight);
    console.log('group', this.group.id);
  }

  setMediaPath() {
    if (this.group.isImageAdded) {
      this.media = this.mediaService.getMediaDetails(this.group.media.mediaId);
      this.mediaPath = this.media.path;
      this.mediaDescription = this.group.media.description === '' ? this.media.description : this.group.media.description;
    } else {
      this.mediaPath = '';
    }
  }
  openLongDescriptionPopup(index) {
    this.modalService.longDescriptionPopup(this.mediaDescription);
  }

  addImage() {
    this.modalService.addMediaModal(this.cdStateService.updatedImageList(), true, 'group', this.index);
  }

  getImageEle() {
    // const height = this.grpImage.nativeElement.height;
    // const width = this.grpImage.nativeElement.width;
    // if (height > width) {
    //   this.grpImage.nativeElement.setAttribute('style', 'width :auto');
    //   this.grpImage.nativeElement.setAttribute('style', 'height :220px');
    // } else {
    //   this.grpImage.nativeElement.setAttribute('style', 'height :auto');
    //   this.grpImage.nativeElement.setAttribute('style', 'width :180px');
    // }
    // if (this.bucket.length > 3 && this.bucket.length <= 4) {
    //   let maxHeight = (414 + 220) * 2 + 20
    //   if (maxHeight > this.stateData.canvas.height) {
    //     const diff = maxHeight - this.stateData.canvas.height;
    //     this.cdStateService.updateIframeSize(this.stateData.canvas.width, this.stateData.canvas.height + diff);
    //     this.cdStateService.stateUpdated.next(true);
    //   }
    // }
  }

  selectImage() {
    this.selected = true;
    this.cdStateService.updateSelectedObject({
      objRef: this.selectionObjRef,
      type: 'image',
    });
  }

  onClickedOutside($event) {
    this.selected = false;
  }

  onImageLoad(event) {
    this.getImageEle();
    this.containerWidth = this.group.image.width;
    this.containerHeight = this.group.image.height;
    this.imgWidth = event.target.naturalWidth;
    this.imgHeight = event.target.naturalHeight;
    let imageCord = this.cdStateService.calculateAspectRatioFit(
      this.imgWidth,
      this.imgHeight,
      this.containerWidth,
      this.containerHeight
    );
    this.imgWidth = imageCord.width;
    this.imgHeight = imageCord.height;
    this.initDragSub();
    if (this.bucket.length > 3 && this.bucket.length <= 4) {
      let maxHeight = (414 + 220) * 2 + 20;
      if (maxHeight > this.stateData.canvas.height) {
        const diff = maxHeight - this.stateData.canvas.height;
        this.cdStateService.updateIframeSize(this.stateData.canvas.width, this.stateData.canvas.height + diff);
        this.cdStateService.checkForMaxBoundryHeight();
        this.cdStateService.stateUpdated.next(true);
      }
    }
    setTimeout(() => {
      this.cdStateService.checkForMaxBoundryHeight();
    }, 200);
  }

  initDragSub() {
    let initialX = 0;
    let initialY = 0;
    let resizePointer: any;
    let resizePointerDrag: any;
    let resizePointerDragEnd: any;

    resizePointer = fromEvent<MouseEvent>(this.resizeEl.nativeElement, 'mousedown');
    const dragEnd$ = fromEvent<MouseEvent>(document, 'mouseup');
    const drag$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(takeUntil(dragEnd$));

    resizePointer.subscribe((event) => {
      event.stopPropagation();
      const undoObj = {
        actionName: 'group-add-image',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      initialX = event.clientX;
      initialY = event.clientY;
      let initialWidth = this.containerWidth;
      let initialHeight = this.containerHeight;

      resizePointerDrag = drag$.subscribe((event: MouseEvent) => {
        event.preventDefault();
        const updatedX = event.clientX - initialX;
        const updatedY = event.clientY - initialY;

        let maxBoundaries = this.getMaxBoundaryWidthCheck();
        this.cdStateService.checkForMaxBoundryHeight();

        if (initialWidth + updatedX > maxBoundaries) {
          this.containerWidth = maxBoundaries;
        } else {
          if (initialWidth + updatedX > APP_CONFIG.MAXIMUM_WIDTH_ALLOWED_IMAGE_GROUPING) {
            this.containerWidth = initialWidth + updatedX;
          }
        }

        if (initialHeight + updatedY > APP_CONFIG.MAXIMUM_HEIGHT_ALLOWED_IMAGE_GROUPING) {
          this.containerHeight = initialHeight + updatedY;
        }

        let imageCord = this.cdStateService.calculateAspectRatioFit(
          this.imgWidth,
          this.imgHeight,
          this.containerWidth,
          this.containerHeight
        );

        this.imgWidth = imageCord.width;
        this.imgHeight = imageCord.height;

        this.group.image.width = this.containerWidth;
        this.group.image.height = this.containerHeight;
        this.cdStateService.groupContainerWidthUpdate.next(true);
      });

      resizePointerDragEnd = dragEnd$.subscribe(() => {
        undoObj.actionData.new = this.cdStateService.getDataOfFields();
        this.undoRedoService.updateUndoArray(undoObj);
        if (resizePointerDrag) {
          resizePointerDrag.unsubscribe();
        }
        if (resizePointerDragEnd) {
          resizePointerDragEnd.unsubscribe();
        }
        this.cdStateService.groupContainerWidthUpdate.next(true);
        console.log(this.groupImageMaxHeight, this.hasImage);
      });
    });
  }

  getMaxBoundaryWidthCheck() {
    let labelArea = (document.getElementsByClassName('label-area')[0] as HTMLElement).offsetWidth;
    let canvasWidth = this.cdStateService.getState().canvas.width;

    return canvasWidth - labelArea - 20;
  }
}
