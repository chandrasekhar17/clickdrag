import { Component, OnInit } from '@angular/core';
import { ButtonPurpose, AlertType } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  alertType = AlertType;
  state: any;
  leaderLineNodes: any[];
  _buttonPurpose = ButtonPurpose;
  labels: any;
  isLabelWithAudio: boolean = false;

  constructor(private cdStateService: CdStateService, private undoRedoService: UndoRedoService) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    this.labels = this.state.labelData.labels;
    this.isLabelWithAudio = this.labelsWithAudio(this.labels);
    this.cdStateService.setLeaderLineNodes();
    this.leaderLineNodes = this.cdStateService.leaderLineNodes;
    this.cdStateService.disablResetAll.next(true);
    //this.undoRedoService.initialState = JSON.parse(JSON.stringify(this.state.response));
  }
  labelsWithAudio(labels) {
    for (let i = 0; i < labels.length; i++) {
      if (labels[i].mediaType === 'audio') {
        return true;
        break;
      }
    }
    return false;
  }
}
