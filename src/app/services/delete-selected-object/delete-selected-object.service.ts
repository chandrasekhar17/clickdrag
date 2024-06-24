import { Injectable, Injector } from '@angular/core';
import { CdStateService } from '../cd-state/cd-state.service';
import { ModalService } from '../modal-popup/modal.service';
import { StageRulerService } from '../../services/stage-ruler/stage-ruler.service';
import { UndoRedoService } from '../undo-redo/undo-redo.service';

@Injectable({
  providedIn: 'root',
})
export class DeleteSelectedObjectService {
  constructor(
    private cdStateService: CdStateService,
    private modalService: ModalService,
    private injector: Injector,
    private undoRedoService: UndoRedoService
  ) { }

  deleteSelectedObject(): void {
    const state = this.cdStateService.getState();
    const dropZones = state.dockData.docks;
    let undoObj;
    if (this.cdStateService.objectSelected === true) {
      const selectedObject: any = this.cdStateService.selectedObject.objRef;
      switch (this.cdStateService.selectedObject.type) {
        case 'backgroundImage':
          this.modalService.bgImageDealeteWarningPopUp();
          break;
        case 'dropzone':
          const labels = state.labelData.labels;
          const dropZone = dropZones.filter((dZ: any) => dZ === selectedObject)[0];
          const dropZoneIndex = dropZones.indexOf(selectedObject);
          if (state.activity.name !== 'grouping') {
            const label = labels.filter(function (lab) {
              return lab.id == dropZone.linkedLabel[0];
            }); //labels[(dropZone.linkedLabel[0])-1].dockedTo;
            let dockedTo = label[0].dockedTo;
            if (dockedTo && dockedTo.length > 1) {
              for (let i = 0; i < labels.length; i++) {
                if (labels[i].id === dropZone.linkedLabel[0] && labels[i].dockedTo.length > 1) {
                  dropZones.splice(dropZoneIndex, 1);
                  state.labelData.labels[i].dockedTo.splice(state.labelData.labels[i].dockedTo.indexOf(dropZone.id), 1);
                  let maxHeight = Math.max.apply(
                    Math,
                    state.labelData.labels.map((label) => label.height)
                  );
                  this.cdStateService.labelHeight = maxHeight;
                  this.cdStateService.heightAdjustingOfDock.next(true);
                  break;
                }
              }
            } else {
              this.modalService.deleteDocWarning(state, selectedObject);
            }
          } else {
            this.modalService.groupDeleteWarningPopUp(state, selectedObject);
            // console.log(labels);
          }
          this.cdStateService.selectedGroup.splice(dropZoneIndex, 1);
          // this.cdStateService.bucketArrayLength = dropZones.length;
          // if (state.activity.name === "grouping") {
          //   this.cdStateService.updateImageObject(selectedObject);
          // }
          this.cdStateService.bgImageDataUpdated.next(true);

          // const linkedLabel = labels.filter((lb) => lb.id === dropZone.linkedLabel);
          // for (let i = 0; i < this.cdStateService.leaderLineNodes.length;) {
          //   const node = this.cdStateService.leaderLineNodes[i];
          //   if (node.dockRef === dropZone) {
          //     this.cdStateService.leaderLineNodes.splice(i, 1);
          //   } else {
          //     i++;
          //   }
          // }

          // linkedLabel.dockedTo;
          this.cdStateService.stateUpdated.next(true);
          // this.cdStateService.leaderLineNodeUpdated.next(selectedObject);
          this.cdStateService.setLeaderLineNodes();
          break;
        case 'leaderLineNode':
          // selectedObject.dockRef.leaderLine = undefined;
          undoObj = {
            actionName: 'delete-leaderline-node',
            actionData: {
              old: this.cdStateService.getDataOfFields(),
              new: {},
            },
          };
          this.cdStateService.deleteLeaderLineFromState(selectedObject);
          this.cdStateService.deleteLeaderLineNode(selectedObject);
          this.cdStateService.leaderLineNodeUpdated.next(selectedObject);
          undoObj.actionData.new = this.cdStateService.getDataOfFields();
          this.undoRedoService.updateUndoArray(undoObj);
          break;
        case 'group':
          break;
        case 'guideLine':
          const guideService = this.injector.get<StageRulerService>(StageRulerService);
          guideService.removeGuide(selectedObject);
          break;
        case 'image':
          undoObj = {
            actionName: 'grouping-image-delete',
            actionData: {
              old: this.cdStateService.getDataOfFields(),
              new: {},
            },
          };
          this.cdStateService.updateImageObject(selectedObject);
          this.cdStateService.bgImageDataUpdated.next(true);
          undoObj.actionData.new = this.cdStateService.getDataOfFields();
          this.undoRedoService.updateUndoArray(undoObj);
          this.cdStateService.editDescriptionButtonDisable.next(false);
          for (let item of dropZones) {
            if (item.isImageAdded) {
              this.cdStateService.groupHasImage.next(true);
              break;
            }
            this.cdStateService.groupHasImage.next(false);
          }
          break;
        default:
          break;
      }
      // this.cdStateService.selectedObject = { objRef: {}, type: '' };
      // this.cdStateService.objectSelected = false;
      this.cdStateService.deselectObject();
    }
  }
}
