import { Component, OnInit } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';

@Component({
  selector: '.app-undo-reset',
  templateUrl: './undo-reset.component.html',
  styleUrls: ['./undo-reset.component.scss'],
})
export class UndoResetComponent implements OnInit {
  _buttonPurpose = ButtonPurpose;
  state: any;
  disable: boolean = true;
  mode: string;
  constructor(public undoRedo: UndoRedoService, private modalService: ModalService, private cdStateService: CdStateService) {
    this.mode = EZ.mode;
  }

  ngOnInit(): void {
    this.cdStateService.disablResetAll.subscribe((val) => {
      if (val) {
        this.state = this.cdStateService.getState();
        for (let doc of this.state.response.docks) {
          if (!doc.linkedLabel.length) {
            this.disable = true;

          }
          else {
            this.disable = false;
            break;
          }
        }
      }
    })
  }

  OnUndo() {
    this.undoRedo.undoForTakeMode();
  }

  onReset() {
    this.modalService.onReset();
    this.cdStateService.disablResetAll.next(true);
    //this.undoRedo.resetState();
  }
}
