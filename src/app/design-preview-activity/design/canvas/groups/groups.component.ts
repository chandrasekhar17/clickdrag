import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { APP_CONFIG } from '../../../../shared/constants/appconfig';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit, AfterViewInit {
  buttonPurpose = ButtonPurpose;
  stateData: any;
  bucket: any = [];
  labelErrors = [];
  bucketArrayLength: number;
  labelText = [];
  disabledAddGroupBtn: boolean = false;
  dropZoneAreaWidth = 0;

  @ViewChild('groupContainer') groupContainer: ElementRef;

  constructor(public cdStateService: CdStateService, private undoRedoService: UndoRedoService) { }
  ngAfterViewInit(): void {
    const mousedown$ = fromEvent(this.groupContainer.nativeElement, 'mousedown');
    mousedown$.subscribe((event) => {
      this.cdStateService.deselectObject();
    });
    setTimeout(() => {
      this.cdStateService.checkForMaxBoundryHeight();
    }, 100);
  }

  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.cdStateService.BuketAdded = false;
    this.bucket = this.stateData.dockData.docks;
    for (let i = 0; i < this.bucket.length; i++) {
      if (this.cdStateService.selectedGroup[i] === undefined) {
        this.cdStateService.selectedGroup[i] = false;
      }
    }
    this.cdStateService.stateUpdated.subscribe((value) => {
      if (value) {
        for (let i = 0; i < this.bucket.length; i++) {
          if (this.bucket[i].hasError) {
            this.disabledAddGroupBtn = true;
            break;
          } else {
            this.disabledAddGroupBtn = false;
          }
        }
        this.dropZoneAreaWidth = this.stateData.canvas.width - APP_CONFIG.LABEL_ELE_WIDTH;
      }
    });
  }

  setSelected(evt, index) {
    this.cdStateService.selectedGroup[index] = evt;
  }
  addOneGroup() {
    const undoObj = {
      actionName: 'add-new-group-grouping',
      actionData: {
        old: this.cdStateService.getDataOfFields(),
        new: {},
      },
    };
    this.cdStateService.addDockToLabel(this.stateData);
    this.cdStateService.bucketArrayLength = this.bucket.length;
    this.cdStateService.groupLengthUpdate.next(true);
    this.cdStateService.BuketAdded = true
    for (let i = 0; i < this.bucket.length; i++) {
      if (this.cdStateService.selectedGroup[i] === undefined) {
        this.cdStateService.selectedGroup[i] = false;
      }
    }
    this.cdStateService.groupLengthUpdate.next(true);
    setTimeout(() => {
      this.cdStateService.checkForMaxBoundryHeight();
      undoObj.actionData.new = this.cdStateService.getDataOfFields();
      this.undoRedoService.updateUndoArray(undoObj);
    }, 100);
    this.cdStateService.groupLengthUpdate.next(true);
    this.cdStateService.groupContainerWidthUpdate.next(true);
  }
}
