import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { last, map, takeUntil } from 'rxjs/operators';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { APP_CONFIG } from 'src/app/shared/constants/appconfig';

import { MagnifyPreviewService } from '../../../../../services/magnify-preview/magnify-preview.service';

@Component({
  selector: '[app-dropzone]',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
})
export class DropzoneComponent implements AfterViewInit, OnInit {
  dZonePos;
  @Input() dockObj;
  @Input() currentIndex;
  @ViewChild('ele') ele;
  @ViewChild('dropzoneRect') dropzoneRect;
  @ViewChild('labelText') labelText;
  @ViewChild('labelImg') labelImg;
  @ViewChild('leaderLineStartNodeTop') leaderLineStartNodeTop;
  @ViewChild('leaderLineStartNodeBottom') leaderLineStartNodeBottom;
  @ViewChild('leaderLineStartNodeLeft') leaderLineStartNodeLeft;
  @ViewChild('leaderLineStartNodeRight') leaderLineStartNodeRight;
  selectedElement: any;
  offset: any;
  label;
  labelData;
  labelTextValue;
  textToDisplay = '';
  textToDisplayBase64: string;
  svgTextToDisplay: string;
  labelId: Number;
  labelRichText: string = '';
  dragSubscriptions = [];
  selected;
  showLeaderLineStartNodes = true;
  leadLineNodeSub;
  topNode = { x: 0, y: 0 };
  bottomNode = { x: 0, y: 0 };
  leftNode = { x: 0, y: 0 };
  rightNode = { x: 0, y: 0 };
  hideNodes = false;
  dragEnd$;
  drag$;
  displayDrag = false;
  dxPos;
  dyPos;
  xPos;
  yPos;
  dockWidth;
  dockHeight;
  state: any;
  imageWidth;
  imageHeight;
  heightOfMedia = 36;
  // heightOfImageDescLink = 0;
  widthMargin = 0;
  isSafari: boolean;
  isRemoveDiv: boolean = true;
  mediaPath: any;
  media: any;
  mediaDescription: string = '';

  constructor(
    public cdStateService: CdStateService,
    private magnifyPreviewService: MagnifyPreviewService,
    private undoRedoService: UndoRedoService,
    private mediaService: MediaService,
    private modalService: ModalService) {
    cdStateService.labelTextUpdated.subscribe((id) => {
      if (id === this.labelId) {
        this.labelTextValue = this.labelData.richText;
        this.textToDisplay = this.labelTextValue;
      }
    });
  }
  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    this.label = this.state.labelData.labels.filter((label) => label.id === this.dockObj.linkedLabel[0]);
    this.labelData = this.label[0];
    this.labelTextValue = this.labelData.text;
    this.labelId = this.labelData.id;
    if (this.labelTextValue) {
      this.textToDisplay = this.labelTextValue;
    }
    this.xPos = this.dockObj.position.x;
    this.yPos = this.dockObj.position.y;
    this.dockWidth = this.dockObj.width;
    this.dockHeight = this.dockObj.height;
    this.isSafari = this.cdStateService.isSafari;
    this.cdStateService.heightAdjustingOfDock.subscribe(() => {
      this.yPos = this.dockObj.position.y;
      this.dockHeight = this.cdStateService.labelHeight;
    });
    // this.cdStateService.labelTextUpdated.subscribe((id) => {
    //   if (id === this.labelId) {
    //     this.labelTextValue = this.labelData.richText;
    //     this.textToDisplay = this.getParsedText(this.labelTextValue);
    //   }
    // });
    this.dragEnd$ = fromEvent<MouseEvent>(document, 'mouseup').pipe();
    this.drag$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(takeUntil(this.dragEnd$));

    this.cdStateService.selectionUpdated.subscribe((selection) => {
      if (selection.objRef !== this.dockObj) {
        this.selected = false;
        const dockData = {
          dockObj: this.dockObj,
          isHighlight: false
        }
        this.cdStateService.highlightLabel.next(dockData);
        this.initLeaderLineStartNodeDragUnSub();
      } else if (selection.objRef === this.dockObj) {
        this.selected = true;
      }
    });

    this.cdStateService.leaderLineNodeUpdated.subscribe((linkedDock) => {
      if (linkedDock && linkedDock.dockRef === this.dockObj) {
        this.updateLeaderLine();
      }
      this.showLeaderLineStartNodes = true;
    });

    if (this.dockObj.leaderLine !== undefined) {
      this.showLeaderLineStartNodes = false;
    }
    this.cdStateService.stateUpdated.subscribe(() => {
      this.setMediaPath();
    });
    this.setMediaPath();
  }

  setMediaPath() {
    if (this.labelData.mediaType) {
      if (this.labelData.mediaType === 'audio') {
        this.media = this.mediaService.getMediaDetails(this.labelData.audio.mediaId);
        this.mediaPath = this.media.path;
      } else if (this.labelData.mediaType === 'image') {
        this.media = this.mediaService.getMediaDetails(this.labelData.image.mediaId);
        this.mediaPath = this.media.path;
        this.mediaDescription = this.labelData.image.description === '' ? this.media.description : this.labelData.image.description;
        // this.heightOfImageDescLink = this.mediaDescription !== '' ? 20 : 0;
      }
    }
  }

  onImageLoad(event) {
    this.imageHeight = 120;
    this.imageWidth = 120;
    this.heightOfMedia = 120;
    this.isRemoveDiv = true;
  }
  // getParsedText(text, tagNode?) {
  //   return text;
  //   let tag = new RegExp("<(.|\n)+?>");
  //   let openingtag = new RegExp("<([a-z]+) *[^/]*?>");
  //   let node = text.match(tag);
  //   let textPart = [];
  //   let i = text.indexOf(node[0]);
  //   textPart[0] = text.substring(0, i);
  //   textPart[1] = text.substring(i);
  //   let index = textPart[1].indexOf(">");
  //   textPart[1] = textPart[1].slice(index + 1);
  //   let m = textPart[1].indexOf("<");
  //   let n = textPart[1].indexOf(">");
  //   node[1] = textPart[1].substring(m, n + 1);
  //   if (textPart[0] !== null && textPart[0] !== '') {
  //     textPart[0] = textPart[0].replace(/&nbsp;/g, ' ');
  //     let text1 = textPart[0];
  //     this.labelRichText = text1;
  //     console.log(text1);
  //   }
  //   if (textPart[1] !== "") {
  //     this.getParsedText(textPart[1], node[0]);
  //   }
  //   return this.labelRichText;
  // }

  // ngAfterViewInit(): void {
  //   this.ele.nativeElement.setAttribute('x', this.dockObj.position.x);
  //   this.ele.nativeElement.setAttribute('y', this.dockObj.position.y);
  //   this.ele.nativeElement.setAttribute('id', this.dockObj.id);
  //   // this.labelImg.nativeElement.setAttribute('x', this.dockObj.position.x);
  //   // this.labelImg.nativeElement.setAttribute('y', this.dockObj.position.y);
  // }

  // ngOnInit() {
  //   this.xPos = this.dockObj.position.x;
  //   this.yPos = this.dockObj.position.y;
  //   this.dockWidth = this.dockObj.width;
  //   this.dockHeight = this.dockObj.height;
  // }

  initDragSub() {
    let initialX = 0,
      initialY = 0,
      currentLeft = 0,
      currentTop = 0;
    let dragSub: Subscription;
    let dragEndSub: Subscription;

    this.cdStateService.bgMoved.subscribe(() => {
      this.xPos = this.dockObj.position.x;
      this.yPos = this.dockObj.position.y;
      this.moveLeaderLine();
    });
    this.cdStateService.bgMovedBy.subscribe((value) => {
      this.xPos = this.xPos + value.x;
      this.yPos = this.yPos + value.y;
      this.dockObj.position.x = this.xPos;
      this.dockObj.position.y = this.yPos;
      if (this.dockObj.leaderLine !== undefined) {
        this.dockObj.leaderLine.position.x = this.dockObj.leaderLine.position.x + value.x;
        this.dockObj.leaderLine.position.y = this.dockObj.leaderLine.position.y + value.y;
      }
    });

    const dragStart$ = fromEvent<MouseEvent>(this.ele.nativeElement, 'mousedown');
    const dropZoneMouseOver$ = fromEvent<MouseEvent>(this.ele.nativeElement, 'mouseover');
    const dropZoneMouseOut$ = fromEvent<MouseEvent>(this.ele.nativeElement, 'mouseout');

    const dropZoneMouseOverSub = dropZoneMouseOver$.subscribe((event: MouseEvent) => {
      event.preventDefault();
      const magnifySettings = this.state.magnifySettings;
      if (this.dockObj.leaderLine !== undefined && !this.displayDrag && magnifySettings.enabled) {
        this.magnifyPreviewService.show(this.dockObj);
      }
    });

    const dropZoneMouseOutSub = dropZoneMouseOut$.subscribe((event: MouseEvent) => {
      event.preventDefault();
      const magnifySettings = this.state.magnifySettings;
      if (this.dockObj.leaderLine !== undefined && magnifySettings.enabled) {
        this.magnifyPreviewService.hide();
      }
    });

    const dragStartSub = dragStart$.subscribe((event: MouseEvent) => {
      event.stopPropagation();
      const undoObj = {
        actionName: 'dropzone-move-labeling',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      this.selected = true;
      this.cdStateService.updateSelectedObject({
        objRef: this.dockObj,
        type: 'dropzone',
      });
      const dockData = {
        dockObj: this.dockObj,
        isHighlight: true
      }
      this.cdStateService.highlightLabel.next(dockData);
      this.initLeaderLineStartNodeDragSub();
      const startLeft = this.dockObj.position.x;
      const startTop = this.dockObj.position.y;
      initialX = event.clientX;
      initialY = event.clientY;
      this.dxPos = startLeft;
      this.dyPos = startTop;
      this.displayDrag = true;
      // console.log('Inside dragStartSub : initial X:', startLeft, ', Y:', startTop);

      // boundries = this.cdStateService.getBoundries();
      const maxBoundries = this.cdStateService.getMinAndMaxBoundries();
      // console.log(maxBoundries);
      const bgObject = this.cdStateService.getBGObject();

      dragSub = this.drag$.subscribe((event: MouseEvent) => {
        event.preventDefault();
        const changeInClientX = event.clientX - initialX;
        const changeInClientY = event.clientY - initialY;
        const shiftInX = startLeft + changeInClientX - this.xPos;
        const shiftInY = startTop + changeInClientY - this.yPos;
        this.dxPos = startLeft + changeInClientX;
        this.dyPos = startTop + changeInClientY;

        const dockObj = {
          position: { x: this.xPos, y: this.yPos },
          width: this.dockWidth,
          height: this.cdStateService.labelHeight,
        };

        const canMove = this.getCanMove(dockObj, bgObject, shiftInX, shiftInY, maxBoundries);

        const xLeft = startLeft + changeInClientX;
        const xRight = xLeft + this.dockWidth;
        const yTop = startTop + changeInClientY + 5;
        const yBottom = yTop + this.dockHeight;

        let xMoved = false,
          yMoved = false;
        if (canMove.x === true) {
          if (
            xLeft >= maxBoundries.minX &&
            xLeft < maxBoundries.maxX &&
            xRight > maxBoundries.minX &&
            xRight <= maxBoundries.maxX
          ) {
            if (this.state.canvas.snapGuide) {
              const guides = this.getGuidePos('vGuide', xLeft, xRight);
              let guideXL = 0;
              let guideXR = xLeft;
              if (guides.lGuides[0]) {
                guideXL = guides.lGuides[0];
              }
              if (guides.rGuides[0]) {
                guideXR = guides.rGuides[0] - this.dockWidth;
              }
              for (let i = 1; i < guides.lGuides.length; i++) {
                if (xLeft - guideXL > xLeft - guides.lGuides[i]) {
                  guideXL = guides.lGuides[i];
                }
              }
              for (let i = 1; i < guides.rGuides.length; i++) {
                if (xLeft - guideXR > xLeft - guides.lGuides[i]) {
                  guideXR = guides.lGuides[i] - this.dockWidth;
                }
              }
              const nearestXValue = this.getNearestGuide(guideXL, guideXR, xLeft);
              this.xPos = nearestXValue;
            } else {
              this.xPos = xLeft;
            }
            xMoved = true;
          }
        }
        if (canMove.y === true) {
          if (
            yTop > maxBoundries.minY &&
            yTop < maxBoundries.maxY &&
            yBottom > maxBoundries.minY &&
            yBottom < maxBoundries.maxY
          ) {
            if (this.state.canvas.snapGuide) {
              const guides = this.getGuidePos('hGuide', yTop, yBottom);
              let guideYT = 0;
              let guideYB = yTop;
              if (guides.tGuides[0]) {
                guideYT = guides.tGuides[0];
              }
              if (guides.bGuides[0]) {
                guideYB = guides.bGuides[0] - this.dockHeight;
              }
              for (let i = 1; i < guides.tGuides.length; i++) {
                if (yTop - guideYT > yTop - guides.tGuides[i]) {
                  guideYT = guides.tGuides[i];
                }
              }

              for (let i = 1; i < guides.bGuides.length; i++) {
                if (yTop - guideYB > yTop - guides.tGuides[i]) {
                  guideYB = guides.tGuides[i] - this.dockHeight;
                }
              }

              const nearestYValue = this.getNearestGuide(guideYT, guideYB, yTop);
              this.yPos = nearestYValue;
            } else {
              this.yPos = yTop;
            }

            yMoved = true;
          }
        }
        if (xMoved || yMoved) {
          this.cdStateService.dockMoved.next(true);
        }
        this.moveLeaderLine();
      });

      const dragEndSub = this.dragEnd$.subscribe(() => {
        this.displayDrag = false;
        this.dxPos = 0;
        this.dyPos = 0;
        let flagForChangeInPos = false;
        if (this.dockObj.position.x !== this.xPos || this.dockObj.position.y !== this.yPos) {
          flagForChangeInPos = true;
        }
        if (!this.checkForOverlapsAndForAdjustments()) {
          // console.log('Inside checkForOverlapsAndForAdjustments if: setting X:', this.xPos, ', Y:', this.yPos);
          this.dockObj.position.x = this.xPos;
          this.dockObj.position.y = this.yPos;
        } else {
          // console.log('Inside checkForOverlapsAndForAdjustments else: setting X:', startLeft, ', Y:', startTop);
          this.xPos = startLeft;
          this.yPos = startTop;
          this.dockObj.position.x = this.xPos;
          this.dockObj.position.y = this.yPos;
        }
        this.moveLeaderLine();
        this.adjustHeightOfCanvas();
        if (flagForChangeInPos) {
          undoObj.actionData.new = this.cdStateService.getDataOfFields();
          this.undoRedoService.updateUndoArray(undoObj);
        }
        this.cdStateService.dockMoved.next(true);

        if (dragSub) {
          dragSub.unsubscribe();
        }
        if (dragEndSub) {
          dragEndSub.unsubscribe();
        }
      });
    });
    this.dragSubscriptions.push.apply(this.dragSubscriptions, [dragStartSub, dragSub, dragEndSub]);
  }

  adjustHeightOfCanvas() {
    const eztoHeight = this.cdStateService.eztoHeight;
    let maxHeight = this.cdStateService.getBoundries().bottom;
    maxHeight = eztoHeight > maxHeight ? eztoHeight : maxHeight + 20;

    this.cdStateService.updateIframeSize(this.state.canvas.width, maxHeight);

    this.cdStateService.stateUpdated.next(true);
  }

  checkDockPositionRelativeToCanvas(currentDock, state) {
    let positionInCorrect = false;

    let dockLeft = currentDock.position.x;
    let dockTop = currentDock.position.y;
    let dockRight = dockLeft + currentDock.width;
    let dockBottom = dockTop + currentDock.height;

    // let canvas = state.canvas;
    let canvasWidth = 638;
    let canvasHeight = 686;

    if (dockLeft < 0 || dockTop < 0 || dockRight > canvasWidth || dockBottom > canvasHeight) {
      positionInCorrect = true;
    }
    return positionInCorrect;
  }

  ngOnDestroy() {
    this.dragSubscriptions.forEach((s) => (s ? s.unsubscribe() : ''));
  }

  ngAfterViewInit() {
    this.initDragSub();
    this.cdStateService.highlightDropzone.subscribe((val: any) => {
      const dropzone = this.dropzoneRect.nativeElement;
      this.state.dockData.docks.forEach((dock) => {
        if (val.isHighlight) {
          val.label.dockedTo.forEach((dockValue) => {
            const dockYPos = dropzone.getBBox().y;
            if (dockValue === dock.id && dockYPos === dock.position.y) {
              dropzone.setAttribute("stroke", '#007C91');
            }
          });
        } else {
          dropzone.setAttribute("stroke", '#c1cfd4');
        }
      })
    });
  }

  moveLeaderLine() {
    if (this.dockObj.leaderLine !== undefined) {
      const direction = this.dockObj.leaderLine.direction;
      const rootNode = this.dockObj.leaderLine.position;
      let x, y;
      switch (direction) {
        case 'top':
          x = this.xPos + this.dockWidth / 2;
          y = this.yPos;
          break;
        case 'bottom':
          x = this.xPos + this.dockWidth / 2;
          y = this.yPos + this.cdStateService.labelHeight;
          break;
        case 'left':
          x = this.xPos;
          y = this.yPos + this.cdStateService.labelHeight / 2;
          break;
        case 'right':
          x = this.xPos + this.dockWidth;
          y = this.yPos + this.cdStateService.labelHeight / 2;
          break;
      }
      rootNode.x = x;
      rootNode.y = y;
    }
  }

  setLeaderLineNodesXY() {
    this.topNode.x = this.xPos + this.dockWidth / 2;
    this.topNode.y = this.yPos - 5;
    this.bottomNode.x = this.xPos + this.dockWidth / 2;
    this.bottomNode.y = this.yPos + this.cdStateService.labelHeight + 5;
    this.leftNode.x = this.xPos - 5;
    this.leftNode.y = this.yPos + this.cdStateService.labelHeight / 2;
    this.rightNode.x = this.xPos + this.dockWidth + 5;
    this.rightNode.y = this.yPos + this.cdStateService.labelHeight / 2;
  }

  initLeaderLineStartNodeDragSub() {
    this.initLeaderLineStartNodeDragUnSub();
    if (this.selected && this.showLeaderLineStartNodes) {
      this.setLeaderLineNodesXY();
      setTimeout(() => {
        const leaderLineStartNodeTop$ = fromEvent<MouseEvent>(
          this.leaderLineStartNodeTop.nativeElement,
          'mousedown'
        ).pipe(map((evt) => ({ direction: 'top', event: evt })));
        const leaderLineStartNodeBottom$ = fromEvent<MouseEvent>(
          this.leaderLineStartNodeBottom.nativeElement,
          'mousedown'
        ).pipe(map((evt) => ({ direction: 'bottom', event: evt })));
        const leaderLineStartNodeLeft$ = fromEvent<MouseEvent>(
          this.leaderLineStartNodeLeft.nativeElement,
          'mousedown'
        ).pipe(map((evt) => ({ direction: 'left', event: evt })));
        const leaderLineStartNodeRight$ = fromEvent<MouseEvent>(
          this.leaderLineStartNodeRight.nativeElement,
          'mousedown'
        ).pipe(map((evt) => ({ direction: 'right', event: evt })));
        const leaderLineStartNode$ = merge(
          leaderLineStartNodeTop$,
          leaderLineStartNodeBottom$,
          leaderLineStartNodeLeft$,
          leaderLineStartNodeRight$
        );

        this.leadLineNodeSub = leaderLineStartNode$.subscribe((nodeEvent) => {
          this.setLeaderLineNodesXY();
          nodeEvent.event.stopPropagation();
          const undoObj = {
            actionName: 'leaderline-dock-circle',
            actionData: {
              old: this.cdStateService.getDataOfFields(),
              new: {},
            },
          };
          const direction = nodeEvent.direction;
          const event = nodeEvent.event;
          let dragSub, dragEndSub;
          let startX, x1;
          let startY, y1;
          let selectedNode;
          this.hideNodes = true;
          switch (direction) {
            case 'top':
              (startX = this.topNode.x), (startY = this.topNode.y);
              (x1 = startX), (y1 = startY + 5);
              // selectedNode = this.topNode;
              // this.hideTopNode = false;
              break;
            case 'bottom':
              (startX = this.bottomNode.x), (startY = this.bottomNode.y);
              (x1 = startX), (y1 = startY - 5);
              // selectedNode = this.bottomNode;
              // this.hideBottomNode = false;
              break;
            case 'left':
              (startX = this.leftNode.x), (startY = this.leftNode.y);
              (x1 = startX + 5), (y1 = startY);
              // selectedNode = this.leftNode;
              // this.hideLeftNode = false;
              break;
            case 'right':
              (startX = this.rightNode.x), (startY = this.rightNode.y);
              (x1 = startX - 5), (y1 = startY);
              // selectedNode = this.rightNode;
              // this.hideRightNode = false;
              break;
          }
          selectedNode = { direction, x1, y1, x2: startX, y2: startY };
          this.cdStateService.currentStartNode = selectedNode;
          const initialX = event.clientX;
          const initialY = event.clientY;
          const maxBoundries = this.cdStateService.getMinAndMaxBoundries();

          dragSub = this.drag$.subscribe((event) => {
            event.preventDefault();
            const updatedX = event.clientX - initialX;
            const updatedY = event.clientY - initialY;

            const tempX = startX + updatedX;
            const tempY = startY + updatedY;

            if (tempX > maxBoundries.minX && tempX < maxBoundries.maxX) {
              selectedNode.x2 = startX + updatedX;
            }
            if (tempY > maxBoundries.minY && tempY < maxBoundries.maxY) {
              selectedNode.y2 = startY + updatedY;
            }
          });

          dragEndSub = this.dragEnd$.subscribe((event) => {
            this.hideNodes = false;
            let validDrag = false;
            if (
              selectedNode.direction === 'top' &&
              selectedNode.y2 < selectedNode.y1 &&
              Math.abs(selectedNode.y2 - selectedNode.y1) >= 20
            ) {
              validDrag = true;
            } else if (
              selectedNode.direction === 'bottom' &&
              selectedNode.y2 > selectedNode.y1 &&
              Math.abs(selectedNode.y2 - selectedNode.y1) >= 20
            ) {
              validDrag = true;
            } else if (
              selectedNode.direction === 'left' &&
              selectedNode.x2 < selectedNode.x1 &&
              Math.abs(selectedNode.x2 - selectedNode.x1) >= 20
            ) {
              validDrag = true;
            } else if (
              selectedNode.direction === 'right' &&
              selectedNode.x2 > selectedNode.x1 &&
              Math.abs(selectedNode.x2 - selectedNode.x1) >= 20
            ) {
              validDrag = true;
            }
            if (
              validDrag &&
              !this.cdStateService.checkNodeOverlapsADock({ x: selectedNode.x2, y: selectedNode.y2 }).isOverlap
            ) {
              this.dockObj.leaderLine = { direction, position: { x: 0, y: 0 }, branches: [] };
              this.dockObj.leaderLine.position.x = selectedNode.x1;
              this.dockObj.leaderLine.position.y = selectedNode.y1;
              const newNode = { position: { x: 0, y: 0 } };
              newNode.position.x = selectedNode.x2;
              newNode.position.y = selectedNode.y2;
              this.dockObj.leaderLine.branches.push(newNode);

              const newNodeDetails = {
                nodeRef: newNode,
                parent: this.dockObj.leaderLine,
                dockRef: this.dockObj,
              };
              this.cdStateService.leaderLineNodes.push(newNodeDetails);
              this.showLeaderLineStartNodes = false;
              this.cdStateService.updateSelectedObject({
                objRef: newNodeDetails,
                type: 'leaderLineNode',
              });
              this.initLeaderLineStartNodeDragUnSub();
            }

            this.cdStateService.currentStartNode = undefined;

            undoObj.actionData.new = this.cdStateService.getDataOfFields();
            this.undoRedoService.updateUndoArray(undoObj);

            if (dragSub) {
              dragSub.unsubscribe();
            }
            if (dragEndSub) {
              dragEndSub.unsubscribe();
            }
          });
        });
      }, 10);
    }
  }

  updateLeaderLine() {
    if (this.dockObj.leaderLine === undefined) {
      this.showLeaderLineStartNodes = true;
    } else if (this.dockObj.leaderLine.branches && this.dockObj.leaderLine.branches.length === 0) {
      this.dockObj.leaderLine = undefined;
      this.showLeaderLineStartNodes = true;
    }
  }

  initLeaderLineStartNodeDragUnSub() {
    if (this.leadLineNodeSub) {
      this.leadLineNodeSub.unsubscribe();
    }
  }

  getCanMove(dock, bgobject, uX, uY, maxBoundries) {
    let moveX = true,
      moveY = true;
    const checkForMove = (source, bgObj, uX, uY, direction) => {
      // console.log('direction:', direction, ', uX:', uX, ', uY:', uY);
      let result = true;
      const sX1 = source.position.x;
      const sX2 = sX1 + source.width;
      const sY1 = source.position.y;
      const sY2 = sY1 + source.height;
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

      const obj = bgObj;
      const padding = 20;
      const objX1 = obj.position.x;
      const objX2 = objX1 + obj.width;
      const objY1 = obj.position.y;
      const objY2 = objY1 + obj.height;

      if (direction === 'x') {
        // if (uX > 0 && (((objY2 + padding) > sY1 && sY2 > (objY2 + padding)) || (sY2 > (objY1 - padding) && sY1 < (objY1 - padding)) ||
        //   ((objY2 + padding) > sY2 && sY1 > (objY1 - padding))) && objX1 > sX2) {
        if (uX > 0 && objY1 - padding - source.height < sY1 && objY2 + padding > sY1 && objX1 > sX2) {
          // console.log('Right!');
          // objects which are on right side of the source.
          if (cX2 > objX1 - padding && cX2 < objX2 + padding + source.width) {
            // overlaps
            result = false;
          }
          // } else if (uX < 0 && (((objY2 + padding) > sY1 && sY2 > (objY2 + padding)) || (sY2 > (objY1 - padding) && sY1 < (objY1 - padding)) ||
          //   ((objY2 + padding) > sY2 && sY1 > (objY1 - padding))) && objX2 < sX1) {
        } else if (uX < 0 && objY1 - padding - source.height < sY1 && objY2 + padding > sY1 && objX2 < sX1) {
          // objects which are on left side of the source.
          if (cX1 < objX2 + padding && cX1 > objX1 - padding - source.width) {
            // overlaps
            result = false;
          }
        }
      } else if (direction === 'y') {
        // if (uY > 0 && (((objX2 + padding) > sX1 && sX2 > (objX2 + padding)) || (sX2 > (objX1 - padding) && sX1 < (objX1 - padding)) ||
        //   ((objX2 + padding) > sX2 && sX1 > (objX1 - padding))) && objY1 > sY2) {
        if (uY > 0 && objX1 - padding - source.width < sX1 && objX2 + padding > sX1 && objY1 > sY2) {
          // objects which are on bottom side of the source.
          if (cY2 > objY1 - padding && cY2 < objY2 + padding + source.height) {
            // overlaps
            result = false;
          }
          // } else if (uY < 0 && (((objX2 + padding) > sX1 && sX2 > (objX2 + padding)) || (sX2 > (objX1 - padding) && sX1 < (objX1 - padding)) ||
          //   ((objX2 + padding) > sX2 && sX1 > (objX1 - padding))) && objY2 < sY1) {
        } else if (uY < 0 && objX1 - padding - source.width < sX1 && objX2 + padding > sX1 && objY2 < sY1) {
          // objects which are on top side of the source.
          if (cY1 < objY2 + padding && cY1 > objY1 - padding - source.height) {
            // overlaps
            result = false;
          }
        }
      }
      return result;
    };
    moveX = checkForMove(dock, bgobject, uX, uY, 'x');
    moveY = checkForMove(dock, bgobject, uX, uY, 'y');

    return { x: moveX, y: moveY };
  }

  checkForOverlapsAndForAdjustments() {
    const docksAndBg = this.cdStateService.getDocksAndBg().filter((item) => item !== this.dockObj);
    const totalOverlaps = [];
    let failed = false;
    docksAndBg.forEach((canObj) => {
      // if (canObj !== this.dockObj) {
      const dockObj = { position: { x: this.xPos, y: this.yPos }, width: this.dockWidth, height: this.dockHeight };
      const result = this.isOverlap(dockObj, [canObj]);
      if (result) {
        totalOverlaps.push(canObj);
      }
      // }
    });
    if (totalOverlaps.length > 0) {
      failed = true;
      failed = !this.adjustForCoords(docksAndBg);
    }
    return failed;
  }

  adjustForCoords(docksAndBg) {
    const dockObj = { position: { x: this.xPos, y: this.yPos }, width: this.dockWidth, height: this.dockHeight };
    let pos = dockObj.position;
    let fixed = false;
    let adjustCount = 30;
    for (let i = 0; i < adjustCount; i++) {
      let overlps = false;
      pos.x = this.xPos + i + 1;
      overlps = this.isOverlap(dockObj, docksAndBg);
      if (!overlps) {
        fixed = true;
        break;
      }
    }
    if (!fixed) {
      pos.x = this.xPos;
      for (let i = 0; i < adjustCount; i++) {
        pos.x = this.xPos - i - 1;
        let overlps = false;
        overlps = this.isOverlap(dockObj, docksAndBg);
        if (!overlps) {
          fixed = true;
          break;
        }
      }
    }
    if (!fixed) {
      pos.x = this.xPos;
      for (let i = 0; i < adjustCount; i++) {
        let overlps = false;
        pos.y = this.yPos + i + 1;
        overlps = this.isOverlap(dockObj, docksAndBg);
        if (!overlps) {
          fixed = true;
          break;
        }
      }
    }
    if (!fixed) {
      pos.y = this.yPos;
      for (let i = 0; i < adjustCount; i++) {
        let overlps = false;
        pos.y = this.yPos - i - 1;
        overlps = this.isOverlap(dockObj, docksAndBg);
        if (!overlps) {
          fixed = true;
          break;
        }
      }
    }
    if (fixed) {
      this.xPos = pos.x;
      this.yPos = pos.y;
    }
    return fixed;
  }

  isOverlap(dockObj, canObjs) {
    let result = false;
    const sX1 = dockObj.position.x;
    const sX2 = sX1 + dockObj.width;
    const sY1 = dockObj.position.y;
    const sY2 = sY1 + dockObj.height;
    const dockPoints = [
      { x: sX1, y: sY1 },
      { x: sX1, y: sY2 },
      { x: sX2, y: sY1 },
      { x: sX2, y: sY2 },
    ];
    const padding = 20;
    for (let k = 0; k < canObjs.length; k++) {
      const canObj = canObjs[k];

      const objX1 = canObj.position.x - padding;
      const objX2 = canObj.position.x + canObj.width + padding;
      const objY1 = canObj.position.y - padding;
      const objY2 = canObj.position.y + canObj.height + padding;

      for (let i = 0; i < dockPoints.length; i++) {
        const point = dockPoints[i];
        result = point.x > objX1 && point.x < objX2 && point.y > objY1 && point.y < objY2 ? true : false;
        if (result) {
          break;
        }
      }
      if (result) {
        break;
      }
    }
    return result;
  }

  // get guide left, right, top and bottom guide position
  getGuidePos(type, leftTop, rightBottom) {
    const guideState = this.state.canvas.guide[type];
    const guideSort = guideState.sort((a, b) => a - b);
    if (type === 'vGuide') {
      const leftGuides = guideSort.filter((val) => {
        return val < leftTop;
      });

      const rightGuides = guideSort.filter((val) => {
        return val > rightBottom;
      });
      return { lGuides: leftGuides, rGuides: rightGuides };
    } else if (type === 'hGuide') {
      const topGuides = guideSort.filter((val) => {
        return val < leftTop;
      });

      const bottomGuides = guideSort.filter((val) => {
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
  openLongDescriptionPopup() {
    this.modalService.longDescriptionPopup(this.media.description);
  }
}
