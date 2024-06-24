import { Component, OnInit } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { UndoRedoService } from '../../../services/undo-redo/undo-redo.service';
import { CdStateService } from '../../../services/cd-state/cd-state.service';
import { DeleteSelectedObjectService } from '../../../services/delete-selected-object/delete-selected-object.service';
import { ReorderLabelsService } from '../services/reorder-labels.service';

@Component({
  selector: '.app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  _buttonPurpose = ButtonPurpose;
  version: string;
  state: any;
  activityName: string;
  activityType: string;
  reorderLabels: any;
  labels: any;

  constructor(
    public undoRedo: UndoRedoService,
    public cdStateService: CdStateService,
    private deleteSelectedObjectService: DeleteSelectedObjectService,
    private reorderService: ReorderLabelsService
  ) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    this.version = this.cdStateService.appVersion;
    this.activityName = this.state.activity.name === "labeling" ? 'Image Labeling' : 'Grouping';
    this.activityType = this.state.activity.options.labelInteraction === 'one-label-one-dock' ? 'One label to one dock' : 'Same label to multiple docks';
    this.labels = this.cdStateService.getDataOfFields(['labelData']);
    this.reorderService.reorderLabels.subscribe((value) => {
      this.labels = this.cdStateService.getDataOfFields(['labelData']);
      this.reorderLabels = value;
    });
  }

  handleUndo() {
    this.undoRedo.undo();
  }
  handleRedo() {
    this.undoRedo.redo();
  }
  handleDelete() {
    this.deleteSelectedObjectService.deleteSelectedObject();
  }

  cancelReorder() {
    this.cdStateService.setLabelData(this.labels.stateFields.labelData);
    this.reorderService.reorderLabels.next(false);
  }

  saveReorder() {
    this.reorderService.reorderLabels.next(false);
  }
}
