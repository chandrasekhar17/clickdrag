import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { APP_CONFIG } from 'src/app/shared/constants/appconfig';

@Component({
  selector: '[app-background-image]',
  templateUrl: './background-image.component.html',
  styleUrls: ['./background-image.component.scss'],
})
export class BackgroundImageComponent implements AfterViewInit, OnInit {
  dragSubscriptions = [];
  xPos = 0;
  yPos = 0;
  bgWidth = 0;
  bgHeight = 0;
  selectedElement;
  imageHeight;
  imageWidth;
  selected;
  isRemoveDiv: boolean = true;
  isSafari: boolean = false;

  currentXValue = 0;
  currentYValue = 0;
  leaderLineNodesToMove;
  originalImageDimensions: any;
  resizeSubscription: any;
  media: any;
  isDescriptionEdited: boolean = false;
  editedDescription: string = '';

  constructor(
    private modalService: ModalService,
    public cdStateService: CdStateService,
    private undoRedoService: UndoRedoService,
    private mediaService: MediaService
  ) {
    cdStateService.imageDataUpdated.subscribe((action) => {
      if (action === 'delete') {
        this.imagePath = '';
        this.imageHeight = undefined;
        this.imageWidth = undefined;
        this.backgroundImage.media.width = 0;
        this.backgroundImage.media.height = 0;
        this.bgWidth = this.bgWidth < APP_CONFIG.MAX_BACKGROUND_IMAGE_WIDTH_ALLOWED ? 250 : this.bgWidth;
        this.bgHeight = this.bgHeight < APP_CONFIG.MAX_BACKGROUND_IMAGE_HEIGHT_ALLOWED ? 250 : this.bgHeight;
      } else {
        if (action !== false) {
          this.stateData = this.cdStateService.getState();
          this.backgroundImage = this.stateData.frameData.frames[0];
          this.media = this.mediaService.getMediaDetails(this.backgroundImage.media.mediaId);
          this.mediaDescription = this.media.description;
          this.bgHeight = this.backgroundImage.height;
          this.bgWidth = this.backgroundImage.width;
          this.xPos = this.backgroundImage.position.x;
          this.yPos = this.backgroundImage.position.y;
          this.imageHeight = this.backgroundImage.media.height || undefined;
          this.imageWidth = this.backgroundImage.media.width || undefined;
          this.imagePath = this.media.path;
        }
      }
    });
  }
  imagePath = '';
  stateData: any;
  framePosition: any;
  smallSvgRect: any;
  modalWithPanelClass = false;
  backgroundImage: any;
  mediaDescription: string = '';
  @ViewChild('rectpointer') rectpointer: ElementRef;
  @ViewChild('backgroundImageText') backgroundImageText: ElementRef;
  @ViewChild('addImageText') addImageText: ElementRef;
  @ViewChild('svgframe') svgframe: ElementRef;
  @ViewChild('imageElement') imageElement: ElementRef;
  @ViewChild('brPointer') brPointer: ElementRef;
  @ViewChild('blPointer') blPointer: ElementRef;
  @ViewChild('trPointer') trPointer: ElementRef;
  @ViewChild('tlPointer') tlPointer: ElementRef;

  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.backgroundImage = this.stateData.frameData.frames[0];
    this.bgHeight = this.backgroundImage.height;
    this.bgWidth = this.backgroundImage.width;
    this.xPos = this.backgroundImage.position.x;
    this.yPos = this.backgroundImage.position.y;
    this.imageHeight = this.backgroundImage.media.height || undefined;
    this.imageWidth = this.backgroundImage.media.width || undefined;
    this.isSafari = this.cdStateService.isSafari;

    this.cdStateService.heightAdjustingOfDock.subscribe(() => {
      this.yPos = this.backgroundImage.position.y;
    });

    this.cdStateService.selectionUpdated.subscribe((selection) => {
      if (selection.objRef !== this.backgroundImage) {
        this.selected = false;
      }
    });
    this.cdStateService.bgImageDataUpdated.subscribe(() => {
      if (this.backgroundImage && this.backgroundImage.media.mediaId !== '') {
        this.media = this.mediaService.getMediaDetails(this.backgroundImage.media.mediaId);
        this.imagePath = this.media.path;
        this.mediaDescription = this.backgroundImage.media.description === '' ? this.media.description : this.backgroundImage.media.description;
      } else {
        this.imagePath = '';
      }
    });
    this.cdStateService.updateImageDescription.subscribe((val: any) => {
      if (val.isEdited && val.updatedFor === 'bgImage') {
        if (this.backgroundImage && this.backgroundImage.media.mediaId !== '') {
          this.media = this.mediaService.getMediaDetails(this.backgroundImage.media.mediaId);
          this.imagePath = this.media.path;
          this.mediaDescription = this.backgroundImage.media.description === '' ? this.media.description : this.backgroundImage.media.description;
        } else {
          this.imagePath = '';
        }
      }
    })
  }
  // mediaList = [];
  ngAfterViewInit(): void {
    this.initDragSub();
  }

  openLongDescriptionPopup() {
    this.modalService.longDescriptionPopup(this.mediaDescription);
  }

  getUpdatedWidthAndHeightByDirection(pointer, direction, val, updatedVal) {
    if (pointer === 'bottomRight') {
      return val + updatedVal;
    }
    if (pointer === 'bottomLeft') {
      if (direction === 'x') {
        return updatedVal > 0 ? val - updatedVal : val + Math.abs(updatedVal);
      } else if (direction === 'y') {
        return val + updatedVal;
      }
    }
    if (pointer === 'topRight') {
      if (direction === 'x') {
        return val + updatedVal;
      } else if (direction === 'y') {
        return updatedVal > 0 ? val - updatedVal : val + Math.abs(updatedVal);
      }
    }
    if (pointer === 'topLeft') {
      return updatedVal > 0 ? val - updatedVal : val + Math.abs(updatedVal);
    }
  }

  getUpdatedBoundries(boundries, x, y) {
    return {
      top: boundries.top + y,
      left: boundries.left + x,
      right: boundries.right + x,
      bottom: boundries.bottom + y,
    };
  }

  initDragSub() {
    let initialX = 0,
      initialY = 0,
      currentLeft = 0,
      currentTop = 0;
    let dragSub: Subscription;
    let dragEndSub: Subscription;
    let imageDrag: Subscription;
    let resizePointerDrag: Subscription;
    let moveImage: Subscription;
    let imageDragEnd: Subscription;
    let resizePointerDragEnd: Subscription;
    let imageElement$;
    let resizeFrameFromBr$;
    let resizeFrameFromBl$;
    let resizeFrameFromTr$;
    let resizeFrameFromTl$;
    let resizePointer;
    let boundries;
    let maxBoundries;
    let canvasObjects;
    const moveAll = false;

    const dragStart$ = fromEvent<MouseEvent>(this.svgframe.nativeElement, 'mousedown');
    const dragEnd$ = fromEvent<MouseEvent>(document, 'mouseup');
    const drag$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(takeUntil(dragEnd$));
    if (this.backgroundImage.mediaAdded) {
      imageElement$ = fromEvent<MouseEvent>(this.imageElement.nativeElement, 'mousedown');
      resizeFrameFromBr$ = fromEvent<MouseEvent>(this.brPointer.nativeElement, 'mousedown').pipe(
        map((evt) => ({ direction: 'bottomRight', event: evt }))
      );
      // resizeFrameFromBl$ = fromEvent<MouseEvent>(this.blPointer.nativeElement, 'mousedown').
      //   pipe(map((evt) => ({ direction: 'bottomLeft', event: evt })));
      // resizeFrameFromTr$ = fromEvent<MouseEvent>(this.trPointer.nativeElement, 'mousedown').
      //   pipe(map((evt) => ({ direction: 'topRight', event: evt })));
      // resizeFrameFromTl$ = fromEvent<MouseEvent>(this.tlPointer.nativeElement, 'mousedown').
      //   pipe(map((evt) => ({ direction: 'topLeft', event: evt })));
      resizePointer = merge(resizeFrameFromBr$); //, resizeFrameFromBl$, resizeFrameFromTr$, resizeFrameFromTl$);
    }

    // Pointers
    if (this.backgroundImage.mediaAdded) {
      if (this.resizeSubscription) {
        this.resizeSubscription.unsubscribe();
      }
      this.resizeSubscription = resizePointer.subscribe((resizeDirection) => {
        // console.log('resize dir', resizeDirection.direction);
        resizeDirection.event.stopPropagation();
        resizeDirection.event.preventDefault();
        const direction = resizeDirection.direction;
        const event = resizeDirection.event;

        let changeInX = false;
        let changeInY = false;

        switch (direction) {
          case 'bottomLeft':
            changeInX = true;
            break;
          case 'topRight':
            changeInY = true;
            break;
          case 'topLeft':
            changeInY = true;
            changeInX = true;
            break;
          default:
            break;
        }

        const bgObj = { position: { x: this.xPos, y: this.yPos }, width: this.bgWidth, height: this.bgHeight };
        canvasObjects = this.cdStateService.getDockObjects(bgObj);

        initialX = event.clientX;
        initialY = event.clientY;
        currentLeft = this.xPos;
        currentTop = this.yPos;
        const intialWidth = this.bgWidth;
        const intialHeight = this.bgHeight;
        const nodesOnImage = canvasObjects.nodesOnImage;

        const undoObj = {
          actionName: 'resize-image-labeling',
          actionData: {
            old: this.cdStateService.getDataOfFields(),
            new: {},
          },
        };
        let shiftInX;
        let shiftInY;
        let nodePosInPercentage = [];

        let cord = this.cdStateService.getUpdatedImageSize(this.originalImageDimensions.width, this.originalImageDimensions.height, this.imageWidth, this.imageHeight);
        let imageXPos = this.xPos + ((this.bgWidth - cord.width) / 2);
        let imageYPos = this.yPos + ((this.bgHeight - cord.height) / 2);

        // maintaining percentage of leaderline  nodes over image for resize.
        for (let node of nodesOnImage) {
          let initNodeXPos = node.position.x - imageXPos;
          let initNodeYPos = node.position.y - imageYPos;
          let initXPercent = (initNodeXPos * 100 / cord.width);
          let initYPercent = (initNodeYPos * 100 / cord.height);
          nodePosInPercentage.push({ initXPercent, initYPercent });
        }

        resizePointerDrag = drag$.subscribe((evnt: MouseEvent) => {
          evnt.preventDefault();
          const updatedX = evnt.clientX - initialX;
          const updatedY = evnt.clientY - initialY;

          boundries = this.cdStateService.getBoundries();
          maxBoundries = this.cdStateService.getMinAndMaxBoundries();

          let oldbgWidth = this.bgWidth;
          let oldbgHeight = this.bgHeight;

          this.bgWidth = this.getUpdatedWidthAndHeightByDirection(direction, 'x', intialWidth, updatedX);
          this.bgHeight = this.getUpdatedWidthAndHeightByDirection(direction, 'y', intialHeight, updatedY);

          if (this.bgWidth < APP_CONFIG.MAXIMUM_WIDTH_ALLOWED_IMAGE_GROUPING) {
            this.bgWidth = oldbgWidth;
          }
          if (this.bgHeight < APP_CONFIG.MAXIMUM_HEIGHT_ALLOWED_IMAGE_GROUPING) {
            this.bgHeight = oldbgHeight;
          }

          const bgObj = { position: { x: this.xPos, y: this.yPos }, width: oldbgWidth, height: oldbgHeight };
          canvasObjects = this.cdStateService.getDockObjects(bgObj);

          this.cdStateService.sortByXPosition(canvasObjects.leftToRight, updatedX > 0 ? true : false);
          this.cdStateService.sortByYPosition(canvasObjects.topToBottom, updatedY > 0 ? true : false);

          shiftInX = this.bgWidth - this.imageWidth;
          shiftInY = this.bgHeight - this.imageHeight;

          if (shiftInX > 0) {
            maxBoundries.maxX += 2000;
          }

          if (shiftInY > 0) {
            maxBoundries.maxY += 2000;
          }

          const canMove = this.getCanMove(bgObj, canvasObjects, shiftInX, shiftInY, maxBoundries);

          if (canMove.x) {
            this.imageWidth = this.bgWidth;
          }
          let canvas = this.cdStateService.getState().canvas;
          if (shiftInX > 0 && (boundries.right + shiftInX + APP_CONFIG.LABEL_ELE_WIDTH + 20 > canvas.width)) {
            // max boundry hit so increase canvas width.
            canvas.width += shiftInX;
          } else {
            //decrease image size.
            this.imageWidth = this.bgWidth;
          }

          if (canMove.y) {
            this.imageHeight = this.bgHeight;
          }
          if (shiftInY > 0 && (boundries.bottom + shiftInY + 30 > canvas.height)) {
            // max boundry hit so increase canvas height
            canvas.height += shiftInY;
          } else {
            // decrease image size.
            this.imageHeight = this.bgHeight;
          }

          //update leaderline position on resize.
          let cord = this.cdStateService.getUpdatedImageSize(this.originalImageDimensions.width, this.originalImageDimensions.height, this.imageWidth, this.imageHeight);

          let imageXPos = this.xPos + ((this.bgWidth - cord.width) / 2);
          let imageYPos = this.yPos + ((this.bgHeight - cord.height) / 2);

          for (let node of nodesOnImage) {
            let index = nodesOnImage.indexOf(node);
            let newNodePos = imageXPos + ((nodePosInPercentage[index].initXPercent * cord.width) / 100);
            node.position.x = newNodePos;
          }

          for (let node of nodesOnImage) {
            let index = nodesOnImage.indexOf(node);
            let newNodePos = imageYPos + ((nodePosInPercentage[index].initYPercent * cord.height) / 100);
            node.position.y = newNodePos;
          }

          if (changeInX) {
            this.xPos = currentLeft + updatedX;
          }
          if (changeInY) {
            this.yPos = currentTop + updatedY;
          }

          this.backgroundImage.width = this.bgWidth;
          this.backgroundImage.height = this.bgHeight;

          this.cdStateService.bgMoved.next(true);
          this.cdStateService.stateUpdated.next(true);
        });
        resizePointerDragEnd = dragEnd$.subscribe(() => {
          this.bgWidth = this.imageWidth;
          this.bgHeight = this.imageHeight;
          this.backgroundImage.width = this.bgWidth;
          this.backgroundImage.height = this.bgHeight;
          this.backgroundImage.media.width = this.imageWidth;
          this.backgroundImage.media.height = this.imageHeight;
          if (changeInX) {
            this.backgroundImage.position.x = this.xPos;
          }
          if (changeInY) {
            this.backgroundImage.position.y = this.yPos;
          }

          undoObj.actionData.new = this.cdStateService.getDataOfFields();
          this.undoRedoService.updateUndoArray(undoObj);
          this.cdStateService.bgMoved.next(true);

          if (resizePointerDrag) {
            resizePointerDrag.unsubscribe();
          }
          if (resizePointerDragEnd) {
            resizePointerDragEnd.unsubscribe();
          }
        });
      });
      imageDrag = imageElement$.subscribe((evt: MouseEvent) => {
        evt.stopPropagation();
        evt.preventDefault();
        let bgObj = { position: { x: this.xPos, y: this.yPos }, width: this.bgWidth, height: this.bgHeight };
        const undoObjDrag = {
          actionName: 'drag-image-labeling',
          actionData: {
            old: this.cdStateService.getDataOfFields(),
            new: {},
          },
        };
        this.selected = true;
        this.cdStateService.updateSelectedObject({
          objRef: this.backgroundImage,
          type: 'backgroundImage',
        });
        const startLeft = this.backgroundImage.position.x;
        const startTop = this.backgroundImage.position.y;
        initialX = evt.clientX;
        initialY = evt.clientY;

        boundries = this.cdStateService.getBoundries();
        maxBoundries = this.cdStateService.getMinAndMaxBoundries();
        canvasObjects = this.cdStateService.getDockObjects(bgObj);
        const nodesOnImage = canvasObjects.nodesOnImage;

        moveImage = drag$.subscribe((evnt: MouseEvent) => {
          evnt.preventDefault();
          if (moveAll) {
            const updatedX = evnt.clientX - initialX;
            const updatedY = evnt.clientY - initialY;
            let shiftInX = 0;
            let shiftInY = 0;
            // console.log('drag image shift cordinates', shiftInX, shiftInY);

            const updatedBoundries = this.getUpdatedBoundries(boundries, updatedX, updatedY);
            // console.log('Boundries Updated :', updatedBoundries);

            // const tempX = startLeft + updatedX;
            // const tempY = startTop + updatedY;

            let xMoved = false;
            let yMoved = false;

            if (
              updatedBoundries.left > maxBoundries.minX &&
              updatedBoundries.left < maxBoundries.maxX &&
              updatedBoundries.right < maxBoundries.maxX &&
              updatedBoundries.right > maxBoundries.minX
            ) {
              if (this.stateData.canvas.snapGuide) {
                const leftX = startLeft + updatedX;
                const rightX = leftX + this.backgroundImage.width;
                const guides = this.getGuidePos('vGuide', leftX, rightX);
                let guideXL = 0;
                let guideXR = leftX;
                if (guides.lGuides[0]) {
                  guideXL = guides.lGuides[0];
                }
                if (guides.rGuides[0]) {
                  guideXR = guides.rGuides[0] - this.bgWidth;
                }
                for (let i = 1; i < guides.lGuides.length; i++) {
                  if (leftX - guideXL > leftX - guides.lGuides[i]) {
                    guideXL = guides.lGuides[i];
                  }
                }
                for (let i = 1; i < guides.rGuides.length; i++) {
                  if (leftX - guideXR > leftX - guides.lGuides[i]) {
                    guideXR = guides.lGuides[i] - this.bgWidth;
                  }
                }
                const nearestXValue = this.getNearestGuide(guideXL, guideXR, leftX);
                const value = leftX - nearestXValue;
                if (value === -5) {
                  shiftInX = Math.abs(value);
                } else if (value === 5) {
                  shiftInX = -value;
                } else {
                  if (this.currentXValue === nearestXValue) {
                    shiftInX = 0;
                  } else {
                    shiftInX = startLeft + updatedX - this.xPos;
                  }
                }

                this.currentXValue = nearestXValue;
                this.xPos = nearestXValue;
              } else {
                // this.xPos = xLeft;
                shiftInX = startLeft + updatedX - this.xPos;
                this.xPos = startLeft + updatedX;
              }

              xMoved = true;
            } else if (updatedBoundries.left < maxBoundries.minX) {
              // this.xPos = maxBoundries.minX;
              // xMoved = true;
            } else if (updatedBoundries.right > maxBoundries.maxX) {
              // this.xPos = maxBoundries.maxX - (boundries.right - boundries.left);
              // xMoved = true;
            }
            if (
              updatedBoundries.top > maxBoundries.minY &&
              updatedBoundries.top < maxBoundries.maxY &&
              updatedBoundries.bottom < maxBoundries.maxY &&
              updatedBoundries.bottom > maxBoundries.minY
            ) {
              if (this.stateData.canvas.snapGuide) {
                const topY = startTop + updatedY;
                const bottomY = topY + this.backgroundImage.height;
                const guides = this.getGuidePos('hGuide', topY, bottomY);
                let guideYT = 0;
                let guideYB = topY;
                if (guides.tGuides[0]) {
                  guideYT = guides.tGuides[0];
                }
                if (guides.bGuides[0]) {
                  guideYB = guides.bGuides[0] - this.bgHeight;
                }
                for (let i = 1; i < guides.tGuides.length; i++) {
                  if (topY - guideYT > topY - guides.tGuides[i]) {
                    guideYT = guides.tGuides[i];
                  }
                }

                for (let i = 1; i < guides.bGuides.length; i++) {
                  if (topY - guideYB > topY - guides.tGuides[i]) {
                    guideYB = guides.tGuides[i] - this.bgHeight;
                  }
                }

                const nearestYValue = this.getNearestGuide(guideYT, guideYB, topY);
                const value = topY - nearestYValue;
                if (value === -5) {
                  shiftInY = Math.abs(value);
                } else if (value === 5) {
                  shiftInY = -value;
                } else {
                  if (this.currentXValue === nearestYValue) {
                    shiftInY = 0;
                  } else {
                    shiftInY = startTop + updatedY - this.yPos;
                  }
                }

                this.currentYValue = nearestYValue;
                this.yPos = nearestYValue;
              } else {
                shiftInY = startTop + updatedY - this.yPos;
                this.yPos = startTop + updatedY;
              }
              // this.yPos = startTop + updatedY;
              yMoved = true;
            } else if (updatedBoundries.top < maxBoundries.minY) {
              // this.yPos = maxBoundries.minY;
              // yMoved = true;
            } else if (updatedBoundries.bottom > maxBoundries.maxY) {
              // this.yPos = maxBoundries.maxY - (boundries.bottom - boundries.top);
              // yMoved = true;
            }
            if (xMoved || yMoved) {
              this.cdStateService.bgMovedBy.next({ x: xMoved ? shiftInX : 0, y: yMoved ? shiftInY : 0 });
            }
          } else {
            const changeInClientX = evnt.clientX - initialX;
            const changeInClientY = evnt.clientY - initialY;
            // console.log('drag image cordinates', updatedX, updatedY);
            const bgObj = { position: { x: this.xPos, y: this.yPos }, width: this.bgWidth, height: this.bgHeight };

            let shiftInX = startLeft + changeInClientX - this.xPos;
            let shiftInY = startTop + changeInClientY - this.yPos;

            this.cdStateService.sortByXPosition(canvasObjects.leftToRight, shiftInX > 0 ? true : false);
            this.cdStateService.sortByYPosition(canvasObjects.topToBottom, shiftInY > 0 ? true : false);

            const canMove = this.getCanMove(bgObj, canvasObjects, shiftInX, shiftInY, maxBoundries);
            // console.log("canMove:", canMove);
            const tempX1 = startLeft + changeInClientX;
            const tempX2 = tempX1 + this.bgWidth;
            const tempY1 = startTop + changeInClientY;
            const tempY2 = tempY1 + this.bgHeight;

            let xMoved = false,
              yMoved = false;
            if (canMove.x === true) {
              if (
                tempX1 >= maxBoundries.minX &&
                tempX1 < maxBoundries.maxX &&
                tempX2 > maxBoundries.minX &&
                tempX2 <= maxBoundries.maxX
              ) {
                if (this.stateData.canvas.snapGuide) {
                  const leftX = startLeft + changeInClientX;
                  const rightX = leftX + this.backgroundImage.width;
                  const guides = this.getGuidePos('vGuide', leftX, rightX);
                  let guideXL = 0;
                  let guideXR = leftX;
                  if (guides.lGuides[0]) {
                    guideXL = guides.lGuides[0];
                  }
                  if (guides.rGuides[0]) {
                    guideXR = guides.rGuides[0] - this.bgWidth;
                  }
                  for (let i = 1; i < guides.lGuides.length; i++) {
                    if (leftX - guideXL > leftX - guides.lGuides[i]) {
                      guideXL = guides.lGuides[i];
                    }
                  }
                  for (let i = 1; i < guides.rGuides.length; i++) {
                    if (leftX - guideXR > leftX - guides.lGuides[i]) {
                      guideXR = guides.lGuides[i] - this.bgWidth;
                    }
                  }
                  const nearestXValue = this.getNearestGuide(guideXL, guideXR, leftX);
                  const value = leftX - nearestXValue;
                  // const value = startLeft + changeInClientX - this.xPos;
                  if (value === -5) {
                    shiftInX = Math.abs(value);
                  } else if (value === 5) {
                    shiftInX = -value;
                  } else {
                    if (this.currentXValue === nearestXValue) {
                      shiftInX = 0;
                    } else {
                      shiftInX = startLeft + changeInClientX - this.xPos;
                    }
                  }

                  console.log(shiftInX);
                  this.currentXValue = nearestXValue;
                  this.xPos = nearestXValue;
                } else {
                  // this.xPos = xLeft;
                  shiftInX = startLeft + changeInClientX - this.xPos;
                  this.xPos = startLeft + changeInClientX;
                }
                // this.xPos = startLeft + changeInClientX;
                xMoved = true;
                for (let node of nodesOnImage) {
                  node.position.x += shiftInX;
                }
              }
            }
            if (canMove.y === true) {
              if (
                tempY1 > maxBoundries.minY &&
                tempY1 < maxBoundries.maxY &&
                tempY2 > maxBoundries.minY &&
                tempY2 < maxBoundries.maxY
              ) {
                if (this.stateData.canvas.snapGuide) {
                  const topY = startTop + changeInClientY;
                  const bottomY = topY + this.backgroundImage.height;
                  const guides = this.getGuidePos('hGuide', topY, bottomY);
                  let guideYT = 0;
                  let guideYB = topY;
                  if (guides.tGuides[0]) {
                    guideYT = guides.tGuides[0];
                  }
                  if (guides.bGuides[0]) {
                    guideYB = guides.bGuides[0] - this.bgHeight;
                  }
                  for (let i = 1; i < guides.tGuides.length; i++) {
                    if (topY - guideYT > topY - guides.tGuides[i]) {
                      guideYT = guides.tGuides[i];
                    }
                  }

                  for (let i = 1; i < guides.bGuides.length; i++) {
                    if (topY - guideYB > topY - guides.tGuides[i]) {
                      guideYB = guides.tGuides[i] - this.bgHeight;
                    }
                  }

                  const nearestYValue = this.getNearestGuide(guideYT, guideYB, topY);
                  const value = topY - nearestYValue;
                  if (value === -5) {
                    shiftInY = Math.abs(value);
                  } else if (value === 5) {
                    shiftInY = -value;
                  } else {
                    if (this.currentXValue === nearestYValue) {
                      shiftInY = 0;
                    } else {
                      shiftInY = startTop + changeInClientY - this.yPos;
                    }
                  }

                  this.currentYValue = nearestYValue;
                  this.yPos = nearestYValue;
                } else {
                  shiftInY = startTop + changeInClientY - this.yPos;
                  this.yPos = startTop + changeInClientY;
                }
                // this.yPos = startTop + changeInClientY;
                yMoved = true;
                for (let node of nodesOnImage) {
                  node.position.y += shiftInY;
                }
              }
            }
            if (xMoved || yMoved) {
              this.cdStateService.bgMoved.next(true);
            }
          } //else close
        });
        imageDragEnd = dragEnd$.subscribe(() => {
          // if (this.xPos > 20 && this.yPos > 20) {
          this.backgroundImage.position.x = this.xPos;
          this.backgroundImage.position.y = this.yPos;
          // }

          undoObjDrag.actionData.new = this.cdStateService.getDataOfFields();
          this.undoRedoService.updateUndoArray(undoObjDrag);

          if (moveImage) {
            moveImage.unsubscribe();
          }
          if (imageDragEnd) {
            imageDragEnd.unsubscribe();
          }
        });
      });
    }
  }

  getCanMove(sourceObj, canvasObjects, uX, uY, maxBoundries) {
    let topC = 0,
      leftC = 0,
      rightC = 0,
      bottomC = 0;
    let moveX = true,
      moveY = true;
    const changedInX = [],
      changedInY = [];
    const checkForMove = (source, objs, from, uX, uY, direction) => {
      // console.log('direction:', direction, ', uX:', uX, ', uY:', uY);
      const checkedForX = {},
        checkedForY = {};
      let result = true;
      const sX1 = source.position.x;
      const sX2 = sX1 + (source.width ? source.width : 10);
      const sY1 = source.position.y;
      const sY2 = sY1 + (source.height ? source.height : 10);
      const cX1 = sX1 + uX;
      const cX2 = sX2 + uX;
      const cY1 = sY1 + uY;
      const cY2 = sY2 + uY;

      if (
        direction === 'x' &&
        !(cX1 >= maxBoundries.minX && cX1 < maxBoundries.maxX && cX2 > maxBoundries.minX && cX2 <= maxBoundries.maxX)
      ) {
        return false;
      }
      if (
        direction === 'y' &&
        !(cY1 >= maxBoundries.minY && cY1 < maxBoundries.maxY && cY2 > maxBoundries.minY && cY2 <= maxBoundries.maxY)
      ) {
        return false;
      }

      const length = objs.length;
      for (let i = from; i < length; i++) {
        const obj = objs[i];
        const objX1 = obj.width ? obj.position.x : obj.position.x - 5;
        const objX2 = objX1 + (obj.width ? obj.width : 10);
        const objY1 = obj.width ? obj.position.y : obj.position.y - 5;
        const objY2 = objY1 + (obj.height ? obj.height : 10);
        const padding = obj.width ? 20 : 20;
        if (direction === 'x') {
          if (checkedForX[i] === undefined) {
            if (
              uX > 0 &&
              ((objY2 + padding > sY1 && sY2 > objY2 + padding) ||
                (sY2 > objY1 - padding && sY1 < objY1 - padding) ||
                (objY2 + padding > sY2 && sY1 > objY1 - padding)) &&
              objX1 > sX2
            ) {
              // objects which are on right side of the source.
              rightC++;
              if (cX2 > objX1 - padding) {
                // overlaps
                const newUX = cX2 - (objX1 - padding);
                // console.log('Calling checkForMove! i:', i);
                result = checkForMove(obj, objs, i + 1, uX, uY, direction);
                if (result) {
                  obj.position.x = obj.position.x + uX;
                  changedInX.push(obj);
                }
              }
            } else if (
              uX < 0 &&
              ((objY2 + padding > sY1 && sY2 > objY2 + padding) ||
                (sY2 > objY1 - padding && sY1 < objY1 - padding) ||
                (objY2 + padding > sY2 && sY1 > objY1 - padding)) &&
              objX2 < sX1
            ) {
              // objects which are on left side of the source.
              leftC++;
              if (cX1 < objX2 + padding) {
                // overlaps
                const newUX = objX2 + padding - cX1;
                result = checkForMove(obj, objs, i + 1, uX, uY, direction);
                if (result) {
                  obj.position.x = obj.position.x + uX;
                  changedInX.push(obj);
                }
              }
            }
            checkedForX[i] = i;
          }
        } else if (direction === 'y') {
          if (checkedForY[i] === undefined) {
            if (
              uY > 0 &&
              ((objX2 + padding > sX1 && sX2 > objX2 + padding) ||
                (sX2 > objX1 - padding && sX1 < objX1 - padding) ||
                (objX2 + padding > sX2 && sX1 > objX1 - padding)) &&
              objY1 > sY2
            ) {
              // objects which are on bottom side of the source.
              bottomC++;
              if (cY2 > objY1 - padding) {
                // overlaps
                const newUY = cY2 - (objY1 - padding);
                result = checkForMove(obj, objs, i + 1, uX, uY, direction);
                if (result) {
                  obj.position.y = obj.position.y + uY;
                  changedInY.push(obj);
                }
              }
            } else if (
              uY < 0 &&
              ((objX2 + padding > sX1 && sX2 > objX2 + padding) ||
                (sX2 > objX1 - padding && sX1 < objX1 - padding) ||
                (objX2 + padding > sX2 && sX1 > objX1 - padding)) &&
              objY2 < sY1
            ) {
              // objects which are on top side of the source.
              topC++;
              if (cY1 < objY2 + padding) {
                // overlaps
                const newUY = objY2 + padding - cY1;
                result = checkForMove(obj, objs, i + 1, uX, uY, direction);
                if (result) {
                  obj.position.y = obj.position.y + uY;
                  changedInY.push(obj);
                }
              }
            }
            checkedForY[i] = i;
          }
        }
        if (!result) {
          break;
        }
      }
      return result;
    };
    moveX = checkForMove(sourceObj, canvasObjects.leftToRight, 0, uX, uY, 'x');
    moveY = checkForMove(sourceObj, canvasObjects.topToBottom, 0, uX, uY, 'y');
    // console.log('items count == left:',leftC,', right:', rightC,', top:', topC, ', bottom:', bottomC);
    if (!moveX) {
      changedInX.forEach((item) => {
        item.position.x = item.position.x - uX;
      });
    }
    if (!moveY) {
      changedInY.forEach((item) => {
        item.position.y = item.position.y - uY;
      });
    }
    return { x: moveX, y: moveY };
  }

  onImageLoad(e) {
    this.selectedElement = e.target;
    let imageDimentions;
    if (this.isSafari) {
      if (e.target && e.target.getBBox !== undefined) {
        imageDimentions = e.target.getBBox();
      } else {
        imageDimentions = { width: e.target.width, height: e.target.height };
      }
    } else {
      imageDimentions = e.target.getBBox();
    }
    // const state = this.cdStateService.getState();
    this.originalImageDimensions = imageDimentions;
    // this.bgWidth = this.bgWidth < APP_CONFIG.MAX_BACKGROUND_IMAGE_WIDTH_ALLOWED ? 250 : this.bgWidth;
    // this.bgHeight = this.bgHeight < APP_CONFIG.MAX_BACKGROUND_IMAGE_HEIGHT_ALLOWED ? 250 : this.bgHeight;

    const imgWidth = imageDimentions.width;
    const imgHeight = imageDimentions.height;
    const frameWidth = this.bgWidth;
    const frameHeight = this.bgHeight;

    if (imgWidth !== undefined && imgHeight !== undefined) {
      const imageAspectRatio = imgWidth / imgHeight;
      const frameAspectRatio = frameWidth / frameHeight;
      let uWidth, uHeight, uX, uY;

      if (frameWidth > frameHeight) {
        if (imageAspectRatio > frameAspectRatio) {
          //imgWidth > imgHeight) {
          uWidth = frameWidth;
          uHeight = frameWidth * (1 / imageAspectRatio);
          uX = this.xPos;
          uY = this.yPos + parseInt(((frameHeight - uHeight) / 2).toString(), 10);
        } else {
          uHeight = frameHeight;
          uWidth = frameHeight * imageAspectRatio;
          uX = this.xPos + parseInt(((frameWidth - uWidth) / 2).toString(), 10);
          uY = this.yPos;
        }
      } else {
        if (imageAspectRatio > frameAspectRatio) {
          //imgWidth >= imgHeight) {
          uWidth = frameWidth;
          uHeight = frameWidth * (1 / imageAspectRatio);
          uX = this.xPos;
          uY = this.yPos + parseInt(((frameHeight - uHeight) / 2).toString(), 10);
        } else {
          uHeight = frameHeight;
          uWidth = frameHeight * imageAspectRatio;
          uX = this.xPos + parseInt(((frameWidth - uWidth) / 2).toString(), 10);
          uY = this.yPos;
        }
      }

      this.backgroundImage.media.width = uWidth;
      this.backgroundImage.media.height = uHeight;
      // this.backgroundImage.media.position.x = uX;
      // this.backgroundImage.media.position.y = uY;
      this.backgroundImage.width = uWidth;
      this.backgroundImage.height = uHeight;
      this.backgroundImage.position.x = uX;
      // this.backgroundImage.position.y = uY;
      this.bgWidth = uWidth;
      this.bgHeight = uHeight;
      this.imageWidth = uWidth;
      this.imageHeight = uHeight;
      this.xPos = uX;
      // this.yPos = uY;
      this.initDragSub();
      this.isRemoveDiv = false;
    }
  }
  openEditPopup() {
    this.modalService.editImageDescriptionModal();
  }

  addImage() {
    // this.modalWithPanelClass = !this.modalWithPanelClass;
    this.modalService.addMediaModal(this.cdStateService.updatedImageList(), true);
  }

  ngOnDestroy() {
    this.dragSubscriptions.forEach((s) => (s ? s.unsubscribe() : ''));
  }

  // get guide left, right, top and bottom guide position
  getGuidePos(type, leftTop, rightBottom) {
    const guideState = this.stateData.canvas.guide[type];
    if (type === 'vGuide') {
      const leftGuides = guideState.filter((val) => {
        return val < leftTop;
      });

      const rightGuides = guideState.filter((val) => {
        return val > rightBottom;
      });
      return { lGuides: leftGuides, rGuides: rightGuides };
    } else if (type === 'hGuide') {
      const topGuides = guideState.filter((val) => {
        return val < leftTop;
      });

      const bottomGuides = guideState.filter((val) => {
        return val > rightBottom;
      });
      return { tGuides: topGuides, bGuides: bottomGuides };
    }
  }

  // get Nearest Guide value to snap
  getNearestGuide(leftTop, rightBottom, position) {
    const distanceLT = Math.abs(position - leftTop);
    const distanceRB = Math.abs(position - rightBottom);
    let nearestValue = 0;

    if (distanceLT < distanceRB) {
      nearestValue = leftTop;
    } else {
      if (leftTop - position <= 5 && distanceRB == 0) {
        nearestValue = leftTop;
      } else if (rightBottom - position <= 5) {
        nearestValue = rightBottom;
      }
    }

    if (nearestValue == undefined || nearestValue <= 0) {
      nearestValue = position;
    }

    if (position - nearestValue > 5) {
      nearestValue = position;
    }

    return nearestValue;
  }
}
