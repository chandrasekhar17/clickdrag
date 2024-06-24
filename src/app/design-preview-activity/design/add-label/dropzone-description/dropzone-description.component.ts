import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdStateService } from '../../../../services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../../../shared/constants/appconfig';

@Component({
  selector: 'app-dropzone-description',
  templateUrl: './dropzone-description.component.html',
  styleUrls: ['./dropzone-description.component.scss'],
})
export class DropzoneDescriptionComponent implements OnInit {
  @Output() getDropzoneDesc = new EventEmitter();
  @Input() dropzoneDescription;
  @Input() dropzoneDescErrors;
  state: any;
  @ViewChild('editor') editor;

  constructor(private cdStateService: CdStateService) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
  }

  ngAfterViewInit(): void {
    this.editor.richTextEditorComponent.loadComplete.subscribe((value) => {
      if (value && this.dropzoneDescription === '') {
        this.cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.DROPZONE_EDITOR_PLACEHOLDER);
      }
    });
  }

  onEditorContentChange(text) {
    this.dropzoneDescription = text;
    this.getDropzoneDesc.emit(text);
    if (text === '') {
      this.cdStateService.updateTinyMcePlaceHolder(this.editor, APP_CONFIG.DROPZONE_EDITOR_PLACEHOLDER);
    } else {
      this.cdStateService.updateTinyMcePlaceHolder(this.editor);
    }
  }
}
