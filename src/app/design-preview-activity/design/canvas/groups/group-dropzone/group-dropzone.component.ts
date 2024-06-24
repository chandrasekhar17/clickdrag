import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { DragAndDropServiceService } from 'src/app/shared/services/drag-and-drop-service.service';

@Component({
  selector: 'app-group-dropzone',
  templateUrl: './group-dropzone.component.html',
  styleUrls: ['./group-dropzone.component.scss'],
})
export class GroupDropzoneComponent implements OnInit, AfterViewInit {
  stateData: any;
  bucket: any;
  bucketArrayLength: any;
  selected: boolean;

  @Input() group: { id: number; linkedLabel: number[]; height: number };
  @Input() index: string | number;
  @ViewChild('dropzone') dropzone: ElementRef;

  @Output() getSelectedBoolean = new EventEmitter();
  showLabel: any;
  droppedLabels = [];
  newHeight = 0;
  draggedLabelIndex = undefined;
  previouseGroupLinkedLabel = [];
  constructor(
    private cdStateService: CdStateService,
    private dragAndDropService: DragAndDropServiceService,
  ) { }
  ngAfterViewInit(): void {
    this.updateLabelsInDropzone();
    this.updateDockHeightOnLoad();
    this.dragAndDropService.dragStart.subscribe((result) => {
      if (result && parseInt(result.dropzoneId) === this.group.id) {
        // const index = this.group.linkedLabel.indexOf(parseInt(result.labelId));
        // this.group.linkedLabel.splice(index, 1);
        // this.updateLabelsInDropzone();draggedLabelIndex
        // this.updateDockHeightOnDeletion();
        const index = this.droppedLabels.findIndex((label) => {
          return label.id === parseInt(result.labelId);
        });
        if (index !== undefined && index !== null) {
          this.draggedLabelIndex = index;
          // this.updateDockHeightOnDeletion();
        }
      }
    });

    this.dragAndDropService.drop.subscribe((droppedObje) => {
      if (this.draggedLabelIndex !== undefined && this.draggedLabelIndex !== null) {
        const labelId = this.droppedLabels[this.draggedLabelIndex].id;
        const index = this.group.linkedLabel.indexOf(labelId);
        if (this.group.id !== parseInt(droppedObje.dropzoneId)) {
          this.group.linkedLabel.splice(index, 1);
          this.draggedLabelIndex = undefined;
          this.updateLabelsInDropzone();
          this.updateDockHeightOnDeletion();
        } else {
          this.draggedLabelIndex = undefined;
        }

      }
      if (!this.cdStateService.BuketAdded) {
        if (parseInt(droppedObje.dropzoneId) === this.group.id) {
          const labelId = parseInt(droppedObje.labelId);
          let flagPassed = false;
          if (Array.isArray(this.group.linkedLabel)) {
            if (!this.group.linkedLabel.includes(labelId)) {

              this.group.linkedLabel.push(labelId);
              flagPassed = true;
            }
          }
          this.updateLabelsInDropzone();
          this.updateDockHeightOndrop();
        }
      }
    });

    this.cdStateService.labelDeleted.subscribe((obj) => {
      if (obj.deleteLabel && this.group.linkedLabel.includes(obj.labelId)) {
        const index = this.group.linkedLabel.indexOf(obj.labelId);
        this.group.linkedLabel.splice(index, 1);
        this.updateLabelsInDropzone();
        this.updateDockHeightOnDeletion();
        if (this.stateData.activity.options.labelInteraction === 'one-label-one-dock') {
          this.dragAndDropService.removeDisbaleClass.next(obj.labelId);
        }
      }
    });
    this.cdStateService.updateDockHeightOnAddingMedia.subscribe(() => {
      this.updateDockHeightOnLoad();
    });

    this.cdStateService.updateHeightOnGroupDeletion.subscribe((obj) => {
      if (obj.isGroupDeleted) {
        this.updateDockHeightOndrop(220);
      }

    })

    this.cdStateService.updateGroupLabels.subscribe(() => {
      this.updateLabelsInDropzone();
      this.updateDockHeightOnDeletion();
      // this.updateDisabledClass();
    });

    this.dragAndDropService.removeDisbaleClass.subscribe((labelId) => {
      if (this.draggedLabelIndex !== undefined && this.draggedLabelIndex !== null) {
        const index = this.group.linkedLabel.indexOf(parseInt(labelId));
        this.group.linkedLabel.splice(index, 1);
        this.draggedLabelIndex = undefined;
        this.updateLabelsInDropzone();
        this.updateDockHeightOnDeletion();
      }
    });
    this.cdStateService.BuketAdded = false;
    setTimeout(() => {
      this.cdStateService.checkForMaxBoundryHeight();
    }, 100);
  }

  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.bucket = this.stateData.dockData.docks;
    this.cdStateService.iteratorDock = this.stateData.dockData.idCount;
    this.cdStateService.iteratorLabel = this.stateData.labelData.idCount;
    this.cdStateService.selectionUpdated.subscribe((selection) => {
      if (selection.objRef !== this.group) {
        this.selected = false;
      } else if (selection.objRef === this.group) {
        this.selected = true;
      }
      this.getSelectedBoolean.emit(this.selected);
    });
  }

  updateDockHeightOndrop(newHeight = 0) {
    let dropzonelements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    setTimeout(() => {
      let maxHeight = newHeight;
      if (!newHeight) {
        for (let i = 0; i < dropzonelements.length; i++) {
          if (maxHeight < dropzonelements[i].offsetHeight) {
            maxHeight = dropzonelements[i].offsetHeight;
          }
        }
        for (let i = 0; i < dropzonelements.length; i++) {
          dropzonelements[i].style.minHeight = maxHeight + 'px';
        }
      } else {
        for (let j = 0; j < dropzonelements.length; j++) {
          if (maxHeight) {
            dropzonelements[j].style.minHeight = maxHeight + 'px';
          }
        }
      }
      this.stateData.dockData.docks.forEach(element => {
        element.height = maxHeight;
      });
      this.updateDockHeightOnLoad();
    }, 100);
  }

  updateDockHeightOnDeletion(isLabeldeletd?) {
    let newHeight = 0;
    let dropzonelements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < dropzonelements.length; i++) {
      if (dropzonelements[i].getAttribute('dropzoneId') === this.group.id.toString()) {
        dropzonelements[i].style.minHeight =
          parseInt(dropzonelements[i].style.minHeight) - this.group.height > 220
            ? parseInt(dropzonelements[i].style.minHeight) - this.group.height + 'px'
            : 220 + 'px';
        newHeight = parseInt(dropzonelements[i].style.minHeight);
      }
    }
    this.updateDockHeightOndrop(newHeight);

  }

  updateDockHeightOnLoad() {
    let dropzonelements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    let maxHeight = 0;
    setTimeout(() => {
      for (let i = 0; i < dropzonelements.length; i++) {
        if (maxHeight < dropzonelements[i].offsetHeight) {
          maxHeight = dropzonelements[i].offsetHeight;
        }
      }
      for (let i = 0; i < dropzonelements.length; i++) {
        dropzonelements[i].style.minHeight = maxHeight + 'px';
      }
      this.stateData.dockData.docks.forEach(element => {
        element.height = maxHeight;
      });
      this.cdStateService.checkForMaxBoundryHeight();
    }, 100);
  }

  updateLabelsInDropzone() {
    this.droppedLabels = [];
    this.group.linkedLabel.forEach((element) => {
      for (let i = 0; i < this.stateData.labelData.labels.length; i++) {
        const label = this.stateData.labelData.labels[i];
        if (label.id.toString() === element.toString()) {
          if (!this.droppedLabels.includes(label) && !label.distractor) {
            this.droppedLabels.push(label);
          }
        }
      }
    });
  }
  selectGroup() {
    if (this.bucket.length > 0) {
      this.selected = true;
      this.cdStateService.updateSelectedObject({
        objRef: this.bucket[this.index],
        type: 'dropzone',
      });
    }
    this.getSelectedBoolean.emit(this.selected);
  }
}
