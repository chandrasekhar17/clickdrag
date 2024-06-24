/*
  List of actions to be considered for undo redo
  - Select Tool
  - Type Tool
  - Create Labels :
      - groups (capture drag and delete actions also)
      - labels (capture drag and delete actions also)
      - distractor (capture drag and delete actions also)
  - Frames
  - Bring Back
  - Bring Front
  - Font
  - Bold
  - Italic
  - Underline
  - Align Left Text
  - Align Middle Text
  - Align Right Text
  - Align Justify Text
  - Align Left Component
  - Align Center Component
  - Align Right Component
  - Delete
*/

import { Injectable } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { APP_CONFIG } from 'src/app/shared/constants/appconfig';
import { CdStateService } from '../cd-state/cd-state.service';
import { StageRulerService } from '../stage-ruler/stage-ruler.service';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';
@Injectable({
  providedIn: 'root',
})
export class UndoRedoService {
  undoArray = []; // array of objects {actionName: '', actionData: ''}
  // for every action, push action into undo array.
  // array length will always be less than or equal to appConfig.undoLimit, if it increases remove first element and then push action.
  redoArray = []; // array of objects {actionName: '', actionData: ''}
  // empty redo array after every action.
  initialState: any;
  autoSaveTimer: any;

  isMagnifyFromUndoRedo: boolean = false;
  constructor(private cdStateService: CdStateService, private stageRulerService: StageRulerService, private announcer: LiveAnnouncer,
    private a11yHelper: A11yHelperService) {
  }

  undo() {
    const undoArrLength = this.undoArray.length;
    const undoAction = this.undoArray[undoArrLength - 1];
    // push action to redoArray
    this.redoArray.push(undoAction);
    const undoActionName = undoAction.actionName;
    const undoActionData = undoAction.actionData;
    // Note: You need to perform opposite action
    switch (undoActionName) {
      case 'kebab-options':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'bg-image-add-labeling':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'resize-image-labeling':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'drag-image-labeling':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'dropzone-move-labeling':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'add-new-group-grouping':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'group-add-image':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'canvas-change':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'add-label-modal':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'drag-and-drop-label-grouping':
        this.cdStateService.setFrameData(undoActionData.old.stateFields.frameData);
        this.cdStateService.setLabelData(undoActionData.old.stateFields.labelData);
        this.cdStateService.setCanvasData(undoActionData.old.stateFields.canvas);
        this.cdStateService.setDockDataForDragAndDropCase(undoActionData.old);
        this.cdStateService.setLabelHeight(undoActionData.old.variableFields.labelHeight);
        this.cdStateService.setLeaderLineNodes();
        this.cdStateService.updateGroupLabels.next(true);
        break;

      case 'text-area-grouping':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'leaderline-dock-circle':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'leaderline-node-move':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'leaderline-new-node-added':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'delete-leaderline-node':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'updateGuidesAndGrid':
        this.updateGuidesAndGrid(undoActionData.old, !undoActionData.new.event);
        break;

      case 'magnify-width-height':
        this.cdStateService.updateMagnifySize(undoActionData.old.width, undoActionData.old.height);
        break;

      case 'magnify-options':
        this.cdStateService.setMagnifyScale(undoActionData.old.scale);
        break;

      case 'grouping-image-delete':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'guides-move':
        this.cdStateService.guideLineDelete.next(true);
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'update-description-image-labeling':
        this.cdStateService.setDataOfFields(undoActionData.old);
        this.cdStateService.expandToolsPanel.next(true);
        break;

      case 'delete-all-guides':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      case 'delete-Label-grouping':
        this.cdStateService.setFrameData(undoActionData.old.stateFields.frameData);
        this.cdStateService.setLabelData(undoActionData.old.stateFields.labelData);
        this.cdStateService.setCanvasData(undoActionData.old.stateFields.canvas);
        this.cdStateService.setDockDataForDragAndDropCase(undoActionData.old);
        this.cdStateService.setLabelHeight(undoActionData.old.variableFields.labelHeight);
        this.cdStateService.setLeaderLineNodes();
        // this.fetchLabelsToDisable(undoActionData.old);
        this.cdStateService.updateGroupLabels.next(true);
        break;

      case 'delete-dropzone-from-header':
        this.cdStateService.setDataOfFields(undoActionData.old);
        break;

      default:
        console.log('Wrong Action Name.');
        break;
    }
    this.cdStateService.stateUpdated.next(true);
    this.cdStateService.imageDataUpdated.next(true);
    this.cdStateService.bgImageDataUpdated.next(true);
    this.cdStateService.leaderLineNodeUpdated.next(true);
    this.cdStateService.updateDockHeightOnAddingMedia.next(true);
    this.undoArray.splice(undoArrLength - 1, 1);
  }

  redo() {
    const redoArrLength = this.redoArray.length;
    const redoAction = this.redoArray[redoArrLength - 1];
    // push action to undoArray
    this.undoArray.push(redoAction);
    const redoActionName = redoAction.actionName;
    const undoActionData = redoAction.actionData;
    switch (redoActionName) {
      case 'kebab-options':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'bg-image-add-labeling':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'resize-image-labeling':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'drag-image-labeling':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'dropzone-move-labeling':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'add-new-group-grouping':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'group-add-image':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'canvas-change':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'add-label-modal':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'drag-and-drop-label-grouping':
        this.cdStateService.setFrameData(undoActionData.new.stateFields.frameData);
        this.cdStateService.setLabelData(undoActionData.new.stateFields.labelData);
        this.cdStateService.setCanvasData(undoActionData.new.stateFields.canvas);
        this.cdStateService.setDockDataForDragAndDropCase(undoActionData.new);
        this.cdStateService.setLabelHeight(undoActionData.new.variableFields.labelHeight);
        this.cdStateService.setLeaderLineNodes();
        this.cdStateService.updateGroupLabels.next(true);
        break;

      case 'text-area-grouping':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'leaderline-dock-circle':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'leaderline-node-move':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'leaderline-new-node-added':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'delete-leaderline-node':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'updateGuidesAndGrid':
        this.updateGuidesAndGrid(undoActionData.new, undoActionData.new.event);
        break;

      case 'magnify-width-height':
        this.cdStateService.updateMagnifySize(undoActionData.new.width, undoActionData.new.height);
        break;

      case 'magnify-options':
        this.cdStateService.setMagnifyScale(undoActionData.new.scale);
        break;

      case 'grouping-image-delete':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'guides-move':
        this.cdStateService.guideLineDelete.next(true);
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;

      case 'update-description-image-labeling':
        this.cdStateService.setDataOfFields(undoActionData.new);
        this.cdStateService.expandToolsPanel.next(true);
        break;

      case 'delete-all-guides':
        this.cdStateService.guideLineDelete.next(true);
        break;

      case 'delete-Label-grouping':
        this.cdStateService.setFrameData(undoActionData.new.stateFields.frameData);
        this.cdStateService.setLabelData(undoActionData.new.stateFields.labelData);
        this.cdStateService.setCanvasData(undoActionData.new.stateFields.canvas);
        this.cdStateService.setDockDataForDragAndDropCase(undoActionData.new);
        this.cdStateService.setLabelHeight(undoActionData.new.variableFields.labelHeight);
        this.cdStateService.setLeaderLineNodes();
        // this.fetchLabelsToDisable(undoActionData.new);
        this.cdStateService.updateGroupLabels.next(true);
        break;

      case 'delete-dropzone-from-header':
        this.cdStateService.setDataOfFields(undoActionData.new);
        break;


      default:
        console.log('Wrong Action Name.');
        break;
    }

    this.cdStateService.stateUpdated.next(true);
    this.cdStateService.imageDataUpdated.next(true);
    this.cdStateService.bgImageDataUpdated.next(true);
    this.cdStateService.leaderLineNodeUpdated.next(true);
    this.cdStateService.updateDockHeightOnAddingMedia.next(true);
    this.redoArray.splice(redoArrLength - 1, 1);
  }

  updateUndoArray(undoObj) {
    let undoObj_new = JSON.parse(JSON.stringify(undoObj));
    if (this.undoArray.length >= APP_CONFIG.UNDO_LIMIT) {
      this.undoArray.shift();
    }
    this.undoArray.push(undoObj_new);
    this.redoArray = [];
    this.autoSave();
  }

  autoSave() {
    if (EZ.mode === EZ.MODE_TEST) {
      if (this.autoSaveTimer == null) {
        this.autoSaveTimer = window.setTimeout(() => {
          EZ.save();
          console.log("onDemandSave called after... 30 seconds");
          this.autoSaveTimer = null;
        }, 3000);
      }
    }
  }

  updateGuidesAndGrid(_state, event) {
    let type = _state.type;
    let state = this.cdStateService.getState();
    let canvas = state.canvas;

    switch (type) {
      case 'showGrid':
        canvas.showGrid = !canvas.showGrid;
        break;

      case 'hideGuide':
        canvas.hideGuide = !canvas.hideGuide;
        this.stageRulerService.hideGuides(event);
        break;

      case 'lockGuide':
        canvas.lockGuide = !canvas.lockGuide;
        break;

      default:
        console.log('Wrong type.');
    }
  }
  undoForTakeMode() {
    const undoArrLength = this.undoArray.length;
    const undoAction = this.undoArray[undoArrLength - 1];
    // push action to redoArray
    // this.redoArray.push(undoAction);
    const undoActionName = undoAction.actionName;
    const undoActionData = undoAction.actionData;
    switch (undoActionName) {
      case 'drag-drop-test-mode':
        this.cdStateService.setResponseData(undoActionData.old.stateFields.response);
        this.cdStateService.updateGroupLabels.next(true);
        this.cdStateService.undoTestMode.next(true);
        break;
      case 'pick-drop-test-mode':
        this.cdStateService.setResponseData(undoActionData.old.stateFields.response);
        this.cdStateService.updateGroupLabels.next(true);
        this.cdStateService.undoTestMode.next(true);
        break;
      default:
        console.log('wrong action.');
    }
    this.undoArray.splice(undoArrLength - 1, 1);
    this.autoSave();
    this.announcer.announce(this.a11yHelper.getAnnounceMsg('undoLabel'), 'assertive');

  }

  resetState() {
    const response = this.cdStateService.getState().response;
    for (let docs of response.docks) {
      docs.linkedLabel.length = 0;
    }
    for (let docs of response.labels) {
      docs.dockedTo.length = 0;
    }
    this.initialState = JSON.parse(JSON.stringify(response));
    this.cdStateService.setResponseData(this.initialState);
    this.cdStateService.updateGroupLabels.next(true);
    this.undoArray.length = 0;
    this.autoSave();
    this.cdStateService.disablResetAll.next(true);
  }

}
