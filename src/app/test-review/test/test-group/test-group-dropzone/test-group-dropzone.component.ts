import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { DragAndDropServiceService } from 'src/app/shared/services/drag-and-drop-service.service';

@Component({
  selector: 'app-test-group-dropzone',
  templateUrl: './test-group-dropzone.component.html',
  styleUrls: ['./test-group-dropzone.component.scss']
})
export class TestGroupDropzoneComponent implements OnInit {
  @Input() group: { id: number; linkedLabel: number[]; height: number };
  @Input() index: string | number;
  @ViewChild('dropzone') dropzone: ElementRef;
  @ViewChild('singleDropZone') singleDropZone;
  @Output('groupInfo') groupInfo = new EventEmitter();
  showLabel: any;
  droppedLabels = [];
  newHeight = 0;
  draggedLabelIndex = undefined;
  stateData: any;
  responseGroup: any;
  mode: string;

  constructor(private cdStateService: CdStateService, private dragAndDropService: DragAndDropServiceService) {
    this.mode = EZ.mode;
  }
  ngAfterViewInit(): void {

    this.updateDockHeightOnLoad();
    this.dragAndDropService.dragStart.subscribe((result) => {
      if (result && parseInt(result.dropzoneId) === this.group.id) {
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
          const orgId = this.stateData.response.labels.find(l => l.id === labelId).orgId;
          if (Array.isArray(this.group.linkedLabel)) {
            if (!this.group.linkedLabel.includes(labelId)) {
              if (this.group.linkedLabel.length > 0) {
                let droppedLabelCount = 0;
                for (let i = 0; i < this.group.linkedLabel.length; i++) {
                  const droppedLabelOrgId = this.stateData.response.labels.find(l => l.id === this.group.linkedLabel[i]).orgId;
                  if (droppedLabelOrgId !== orgId) {
                    droppedLabelCount++;
                  }
                }
                if (droppedLabelCount === this.group.linkedLabel.length) {
                  this.group.linkedLabel.push(labelId);
                }
              } else {
                this.group.linkedLabel.push(labelId);
              }
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
        // this.updateDockHeightOnDeletion();
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
    this.cdStateService.undoTestMode.subscribe(() => {
      this.updateLabelsInDropzone();
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
    for (let i = 0; i < this.stateData.dockData.docks.length; i++) {
      const group = this.stateData.dockData.docks[i];
      if (this.group.id === group.id) {
        this.responseGroup = group;
        break;
      }
    }
  }
  updateDockHeightOnDeletion() {
    let newHeight = 0;
    let dropzonelements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < dropzonelements.length; i++) {
      if (dropzonelements[i].getAttribute('dropzoneId') === this.group.id.toString()) {
        dropzonelements[i].style.minHeight =
          parseInt(dropzonelements[i].style.minHeight) - this.group.height > 220
            ? parseInt(dropzonelements[i].style.minHeight) - this.group.height + 'px'
            : this.group.height + 'px';
        newHeight = parseInt(dropzonelements[i].style.minHeight);
      }
    }
    this.updateDockHeightOndrop(newHeight);

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
      this.cdStateService.checkForMaxBoundryHeight();
      this.updateDockHeightOnLoad();
    }, 100);
  }
  updateDockHeightOnLoad() {
    let dropzonelements = document.getElementsByClassName('dropable') as HTMLCollectionOf<HTMLElement>;
    let maxHeight = 0;
    setTimeout(() => {
      for (let i = 0; i < dropzonelements.length; i++) {
        if (maxHeight < dropzonelements[i].offsetHeight) {
          maxHeight = dropzonelements[i].offsetHeight > this.group.height ? dropzonelements[i].offsetHeight : this.group.height;
        }
      }
      for (let i = 0; i < dropzonelements.length; i++) {
        dropzonelements[i].style.minHeight = maxHeight + 'px';
      }
      // for (let i = 0; i < dropzonelements.length; i++) {
      //   if (dropzonelements[i].getAttribute('dropzoneId') === this.group.id.toString()) {
      //     const groupData = this.stateData.response.docks.find(d => 'dropzone_' + d.id === dropzonelements[i].id);
      //     const groupCordinate = dropzonelements[i].getBoundingClientRect();
      //     let labelCordinate;
      //     if (groupData.linkedLabel.length > 0) {
      //       let label;
      //       const labelIndex = groupData.linkedLabel[groupData.linkedLabel.length - 1];
      //       const labelsEles = document.getElementsByClassName('draggable') as HTMLCollectionOf<HTMLElement>;
      //       for (let i = 0; i < labelsEles.length; i++) {
      //         if (labelsEles[i].id === 'label_' + labelIndex && !labelsEles[i].classList.contains('disabled')) {
      //           label = labelsEles[i];
      //         }
      //       }
      //       labelCordinate = label.getBoundingClientRect();
      //       const extraHeight = (groupCordinate.y + groupCordinate.height) - (labelCordinate.y + labelCordinate.height)
      //       if (extraHeight > labelCordinate.height) {
      //         for (let i = 0; i < dropzonelements.length; i++) {
      //           dropzonelements[i].style.minHeight = parseInt(dropzonelements[i].style.minHeight) - labelCordinate.height > this.group.height
      //             ? parseInt(dropzonelements[i].style.minHeight) - labelCordinate.height + 'px' :
      //             this.group.height + 'px';
      //         }
      //       }
      //     }
      //   }
      //   // break;
      // }
      this.cdStateService.checkForMaxBoundryHeight();
    }, 100);
  }

  updateLabelsInDropzone() {
    this.droppedLabels = [];
    this.group.linkedLabel.forEach((element) => {
      for (let i = 0; i < this.stateData.response.labels.length; i++) {
        const label = this.stateData.response.labels[i];
        if (label.id.toString() === element.toString()) {
          this.droppedLabels.push(label);
        }
      }
    });
  }

  getEmptyDropZonesText() {
    const GroupName = this.cdStateService.stripHtmlTags(this.group['headerText']);
    const groupTotalLength = this.stateData.dockData.docks.length;
    return `Empty drop zone ${+this.index + 1} of ${groupTotalLength} corresponding to the group ${GroupName}`;
  }


}
