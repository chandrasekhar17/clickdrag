import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdStateService } from '../../../../services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../../../shared/constants/appconfig';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  @Output() getFeedback = new EventEmitter();
  @Input() feedback;
  feedbackData: string;

  @ViewChild('editor') editor;

  constructor(private _cdStateService: CdStateService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.editor.richTextEditorComponent.loadComplete.subscribe((value) => {
      if (value && this.feedback === '') {
        this._cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.FEEDBACK_EDITOR_PLACEHOLDER);
      }
    });
  }

  // This funcion will keep the tinymce content uptodate for feedback
  onEditorContentChange(text) {
    this.feedback = text;
    this.getFeedback.emit(text);
    if (text === '') {
      this._cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.FEEDBACK_EDITOR_PLACEHOLDER);
    } else {
      this._cdStateService.updateTinyMcePlaceHolder(this.editor);
    }
  }
}
