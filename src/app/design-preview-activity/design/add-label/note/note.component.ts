import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdStateService } from '../../../../services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../../../shared/constants/appconfig';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit {
  @Output() getNote = new EventEmitter();
  @Input() note;
  noteData: string;

  @ViewChild('editor') editor;

  constructor(private _cdStateService: CdStateService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.editor.richTextEditorComponent.loadComplete.subscribe((value) => {
      if (value && this.note === '') {
        this._cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.NOTE_EDITOR_PLACEHOLDER);
      }
    });
  }

  // This funcion will keep the tinymce content uptodate for note
  onEditorContentChange(text) {
    this.note = text;
    this.getNote.emit(text);
    if (text === '') {
      this._cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.NOTE_EDITOR_PLACEHOLDER);
    } else {
      this._cdStateService.updateTinyMcePlaceHolder(this.editor);
    }
  }
}
