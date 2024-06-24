import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { ModalService } from 'src/app/services/modal-popup/modal.service';
import { UndoRedoService } from 'src/app/services/undo-redo/undo-redo.service';
import { APP_CONFIG } from '../../../../../shared/constants/appconfig';

@Component({
  selector: 'app-group-text-area',
  templateUrl: './group-text-area.component.html',
  styleUrls: ['./group-text-area.component.scss'],
})
export class GroupTextAreaComponent implements OnInit {
  stateData: any;
  bucket: any;
  bucketArrayLength: any;
  groupLabelText: string;
  labelErrors = [];
  undoObj: any;
  focusText = '';
  previousGroupLabel: string;

  constructor(
    public cdStateService: CdStateService,
    private undoRedoService: UndoRedoService,
    private modalService: ModalService
  ) { }
  @Input() group;
  @Input() index;
  @ViewChild('editor') editor;
  ngOnInit(): void {
    this.stateData = this.cdStateService.getState();
    this.bucket = this.stateData.dockData.docks;
    // this.groupNameValidation()
    // this.bucketArrayLength = this.bucket.length;
  }

  ngAfterViewInit() {
    this.editor.richTextEditorComponent.editor.on('focus', (event) => {
      this.focusText = event.target.getContent();
      this.cdStateService.editorInFocus = true;
      this.undoObj = {
        actionName: 'text-area-grouping',
        actionData: {
          old: this.cdStateService.getDataOfFields(),
          new: {},
        },
        id: this.index
      };
    });

    this.editor.richTextEditorComponent.loadComplete.subscribe((value) => {
      if (value && this.group.headerText === '') {
        this.cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.GROUP_EDITOR_PLACEHOLDER);
      }
    });
    this.cdStateService.editorBlur.subscribe(() => {
      if (this.undoObj && this.index === this.undoObj.id) {
        this.undoObj.actionData.new = this.cdStateService.getDataOfFields();
        this.undoRedoService.updateUndoArray(this.undoObj);
        this.cdStateService.editorInFocus = false;
      }
    });
  }

  onEditorContentChange(text) {
    this.groupLabelText = text;
    this.bucket[this.index].headerText = text;
    this.labelErrors = this.groupLabelText ? [] : ['Group title must not be left empty'];
    if (text === '') {
      this.cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.GROUP_EDITOR_PLACEHOLDER);
    } else {
      this.cdStateService.updateTinyMcePlaceHolder(this.editor);
    }
  }

  validateLabelReqError(text) {
    this.groupLabelText = text;
    this.labelErrors = this.groupLabelText ? [] : ['Group title must not be left empty'];
    if (this.focusText !== text) {
      if (this.cdStateService.editorInFocus) {
        this.undoObj.actionData.new = this.cdStateService.getDataOfFields();
        this.undoRedoService.updateUndoArray(this.undoObj);
      }
      this.focusText = text;
    }
  }

  onEditorBlur() {
    this.cdStateService.editorInFocus = false;
    let count = 0;
    const groupText = this.cdStateService.stripHtmlTags(this.groupLabelText).toLowerCase().replace(/ /g, '').trim();
    for (let i = 0; i < this.bucket.length; i++) {
      const headerText = this.cdStateService
        .stripHtmlTags(this.bucket[i].headerText)
        .toLowerCase()
        .replace(/ /g, '')
        .trim();
      if (headerText === groupText && headerText && groupText !== '') {
        count += 1;
      }
    }
    if (count > 1 && groupText !== '') {
      this.modalService.duplicateGroupName(this.index, this.previousGroupLabel, this.editor);
      // this.setGroupError(true);
    } else {
      this.previousGroupLabel = this.groupLabelText;
      // this.setGroupError(false);
    }
  }

  setGroupError(value: boolean) {
    for (let i = 0; i < this.bucket.length; i++) {
      this.bucket[i].hasError = value;
    }
    this.cdStateService.stateUpdated.next(true);
  }
}
