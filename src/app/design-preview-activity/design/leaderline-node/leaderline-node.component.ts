import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { DELETE } from '@angular/cdk/keycodes';
import { fromEvent } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { DeleteSelectedObjectService } from 'src/app/services/delete-selected-object/delete-selected-object.service';

@Component({
  selector: '[app-leaderline-node]',
  templateUrl: './leaderline-node.component.html',
  styleUrls: ['./leaderline-node.component.scss'],
})
export class LeaderlineNodeComponent implements OnInit, AfterViewInit {
  @Input() nodeObj;
  @ViewChild('nodeEle') nodeEle;
  @ViewChild('plusIcon') plusIcon;
  xPos = 0;
  yPos = 0;
  iconXPos = 0;
  iconYPos = 0;
  iconDir = '';
  dragEnd$;
  drag$;
  dragStartSub;
  onDeleteNodeSub;
  selected = false;
  plusIconClickSub;
  plusIconMousedownSub;

  constructor(
    private cdStateService: CdStateService,
    private undoRedoService: UndoRedoService,
    private deleteSelectedObjectService: DeleteSelectedObjectService
  ) { }

  ngOnInit(): void {
    this.xPos = this.nodeObj.nodeRef.position.x;
    this.yPos = this.nodeObj.nodeRef.position.y;
    this.dragEnd$ = fromEvent<MouseEvent>(document, 'mouseup');
    this.drag$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(takeUntil(this.dragEnd$));
    this.setPlusIconPos();

    this.cdStateService.selectionUpdated.subscribe((selection) => {
      if (selection.objRef === this.nodeObj) {
        this.selected = true;
        this.initSubscriptionForPlus();
      } else {
        this.selected = false;
        this.unsubscribeForPlusIcon();
      }
    });

    this.cdStateService.bgMovedBy.subscribe((value) => {
      this.xPos = this.xPos + value.x;
      this.yPos = this.yPos + value.y;
      this.nodeObj.nodeRef.position.x = this.xPos;
      this.nodeObj.nodeRef.position.y = this.yPos;
      this.setPlusIconPos();
    });
    this.cdStateService.heightAdjustingOfDock.subscribe(() => {
      this.xPos = this.nodeObj.nodeRef.position.x;
      this.yPos = this.nodeObj.nodeRef.position.y;
      this.setPlusIconPos();
    });
    this.cdStateService.bgMoved.subscribe(() => {
      this.xPos = this.nodeObj.nodeRef.position.x;
      this.yPos = this.nodeObj.nodeRef.position.y;
      this.setPlusIconPos();
    });
  }

  setPlusIconPos() {
    const nodePos = this.nodeObj.nodeRef.position;
    const parentPos = this.nodeObj.parent.position;
    const direction = this.nodeObj.dockRef.leaderLine.direction;
    this.iconDir = direction;

    switch (direction) {
      case 'top':
      case 'bottom':
        this.iconXPos = this.xPos;
        this.iconYPos = this.yPos + (direction === 'top' ? -15 : 15);
        break;
      case 'left':
      case 'right':
        this.iconXPos = this.xPos + (direction === 'left' ? -15 : 15);
        this.iconYPos = this.yPos;
        break;
    }
  }

  ngAfterViewInit() {
    this.initDragSub();
  }

  initDragSub() {
    const dragStart$ = fromEvent<MouseEvent>(this.nodeEle.nativeElement, 'mousedown');
    const onDeleteNode$ = fromEvent<KeyboardEvent>(this.nodeEle.nativeElement, 'keydown');

    this.onDeleteNodeSub = onDeleteNode$.subscribe((event) => {
      if (event.keyCode === DELETE) {
        this.deleteSelectedObjectService.deleteSelectedObject();
      }
    });

    this.dragStartSub = dragStart$.subscribe((event) => {
      event.stopPropagation();
      const undoObj = {
        actionName: 'leaderline-node-move',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
      };
      this.selected = true;
      this.cdStateService.updateSelectedObject({
        objRef: this.nodeObj,
        type: 'leaderLineNode',
      });

      const maxBoundries = this.cdStateService.getMinAndMaxBoundries();

      let dragSub, dragEndSub;
      const startX = this.xPos;
      const startY = this.yPos;
      const initialX = event.clientX;
      const initialY = event.clientY;

      dragSub = this.drag$.subscribe((event) => {
        event.preventDefault();
        const updatedX = event.clientX - initialX;
        const updatedY = event.clientY - initialY;

        const tempX = startX + updatedX;
        const tempY = startY + updatedY;

        if (tempX > maxBoundries.minX && tempX < maxBoundries.maxX) {
          this.xPos = startX + updatedX;
        }
        if (tempY > maxBoundries.minY && tempY < maxBoundries.maxY) {
          this.yPos = startY + updatedY;
        }

        this.nodeObj.nodeRef.position.x = this.xPos;
        this.nodeObj.nodeRef.position.y = this.yPos;
        this.setPlusIconPos();
      });

      dragEndSub = this.dragEnd$.subscribe((event) => {
        // check for overlaps
        const result = this.cdStateService.checkNodeOverlapsADock({ x: this.xPos, y: this.yPos });
        if (result.isOverlap) {
          if (
            result.overLapedDock.leaderLine === this.nodeObj.parent &&
            this.hasOneNode(this.nodeObj.nodeRef, this.nodeObj.parent)
          ) {
            // delete the node.
            this.nodeObj.dockRef.leaderLine = undefined;
            let index = this.cdStateService.leaderLineNodes.indexOf(this.nodeObj);
            this.cdStateService.leaderLineNodes.splice(index, 1);
            this.cdStateService.leaderLineNodeUpdated.next(this.nodeObj);
            this.cdStateService.deselectObject();
          } else {
            this.xPos = startX;
            this.yPos = startY;
            this.nodeObj.nodeRef.position.x = this.xPos;
            this.nodeObj.nodeRef.position.y = this.yPos;
            this.setPlusIconPos();
          }
        }

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
  }

  hasOneNode(node, parent) {
    return (node.branches === undefined || node.branches.length === 0) &&
      parent.branches &&
      parent.branches.length === 1
      ? true
      : false;
  }

  getNewNodeXY() {
    let distance = 50,
      sections = 6,
      sectionSize = 20,
      sectionOffset = 6,
      axisToScan;
    let newXY = { x: 0, y: 0 },
      xyFound = false;

    const getSectionXY = (section, isOdd) => {
      let sectionToScan = { x1: 0, y1: 0, x2: 0, y2: 0 };
      let blockDistance = sectionSize * (isOdd ? (section - 1) / 2 : section / 2);
      switch (this.iconDir) {
        case 'top':
          sectionToScan.x1 = this.xPos + (isOdd ? blockDistance : -(blockDistance + sectionSize));
          sectionToScan.y1 = this.yPos - distance - sectionSize / 2;
          sectionToScan.x2 = this.xPos + (isOdd ? blockDistance + sectionSize : -blockDistance);
          sectionToScan.y2 = this.yPos - distance + sectionSize / 2;
          axisToScan = 'x';
          break;
        case 'bottom':
          sectionToScan.x1 = this.xPos + (isOdd ? blockDistance : -(blockDistance + sectionSize));
          sectionToScan.y1 = this.yPos + distance - sectionSize / 2;
          sectionToScan.x2 = this.xPos + (isOdd ? blockDistance + sectionSize : -blockDistance);
          sectionToScan.y2 = this.yPos + distance + sectionSize / 2;
          axisToScan = 'x';
          break;
        case 'left':
          sectionToScan.x1 = this.xPos - distance - sectionSize / 2;
          sectionToScan.y1 = this.yPos + (isOdd ? -(blockDistance + sectionSize) : blockDistance);
          sectionToScan.x2 = this.xPos - distance + sectionSize / 2;
          sectionToScan.y2 = this.yPos + (isOdd ? -blockDistance : blockDistance + sectionSize);
          axisToScan = 'y';
          break;
        case 'right':
          sectionToScan.x1 = this.xPos + distance - sectionSize / 2;
          sectionToScan.y1 = this.yPos + (isOdd ? -(blockDistance + sectionSize) : blockDistance);
          sectionToScan.x2 = this.xPos + distance + sectionSize / 2;
          sectionToScan.y2 = this.yPos + (isOdd ? -blockDistance : blockDistance + sectionSize);
          axisToScan = 'y';
          break;
      }
      sectionToScan.x1 = sectionToScan.x1 - sectionOffset;
      sectionToScan.y1 = sectionToScan.y1 - sectionOffset;
      sectionToScan.x2 = sectionToScan.x2 + sectionOffset;
      sectionToScan.y2 = sectionToScan.y2 + sectionOffset;
      return sectionToScan;
    };

    while (xyFound === false && distance < 201) {
      for (let i = 0; i < sections; i++) {
        const sectionArea = getSectionXY(i, i % 2 !== 0);
        const hasNode = this.checkForANodeInTheSectionArea(sectionArea);
        if (!hasNode) {
          xyFound = true;
          newXY.x = sectionArea.x1 + sectionSize / 2 + sectionOffset;
          newXY.y = sectionArea.y1 + sectionSize / 2 + sectionOffset;
          break;
        }
      }
      distance = distance + 50;
    }

    if (xyFound) {
      return newXY;
    } else {
      return xyFound;
    }
  }

  checkForANodeInTheSectionArea(sectionArea) {
    let result = false;
    const x1 = sectionArea.x1;
    const x2 = sectionArea.x2;
    const y1 = sectionArea.y1;
    const y2 = sectionArea.y2;
    for (let i = 0; i < this.cdStateService.leaderLineNodes.length; i++) {
      const node = this.cdStateService.leaderLineNodes[i];
      const x = node.nodeRef.position.x;
      const y = node.nodeRef.position.y;
      if (x > x1 && x < x2 && y > y1 && y < y2) {
        result = true;
      }
      if (result) {
        break;
      }
    }
    return result;
  }

  initSubscriptionForPlus() {
    this.unsubscribeForPlusIcon();
    if (this.selected) {
      setTimeout(() => {
        const iconMousedown$ = fromEvent<MouseEvent>(this.plusIcon.nativeElement, 'mousedown');
        const iconClick$ = fromEvent<MouseEvent>(this.plusIcon.nativeElement, 'click').pipe(throttleTime(500));

        this.plusIconMousedownSub = iconMousedown$.subscribe((event) => {
          event.stopPropagation();
        });
        this.plusIconClickSub = iconClick$.subscribe((event) => {
          event.stopPropagation();
          const undoObj = {
            actionName: 'leaderline-new-node-added',
            actionData: {
              old: this.cdStateService.getDataOfFields(),
              new: {},
            },
          };
          const newNodePos: any = this.getNewNodeXY();
          if (newNodePos !== false) {
            if (this.nodeObj.nodeRef.branches === undefined) {
              this.nodeObj.nodeRef.branches = [];
            }
            const newNode = { position: { x: 0, y: 0 } };
            newNode.position.x = newNodePos.x;
            newNode.position.y = newNodePos.y;
            this.nodeObj.nodeRef.branches.push(newNode);
            const newNodeDetails = {
              nodeRef: newNode,
              parent: this.nodeObj.nodeRef,
              dockRef: this.nodeObj.dockRef,
            };
            this.cdStateService.leaderLineNodes.push(newNodeDetails);
            undoObj.actionData.new = this.cdStateService.getDataOfFields();
            this.undoRedoService.updateUndoArray(undoObj);
          }
        });
      }, 10);
    }
  }

  unsubscribeForPlusIcon() {
    if (this.plusIconMousedownSub) {
      this.plusIconMousedownSub.unsubscribe();
    }
    if (this.plusIconClickSub) {
      this.plusIconClickSub.unsubscribe();
    }
  }
}
