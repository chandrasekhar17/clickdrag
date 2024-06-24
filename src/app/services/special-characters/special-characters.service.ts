import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpecialCharactersService {
  editor;
  showSpecialChars = false;
  status = new ReplaySubject();

  constructor() {
    document.addEventListener('showCustomCharMap', (event: CustomEvent) => {
      this.showSpecialChars = true;
      this.editor = event.detail.editor;
      this.show(this.editor);
    });
    window['listeningShowCustomCharMapEvent'] = true;
  }

  addCustomCharMapToEditor(editor) {
    editor.showSpecialCharsMap = () => {
      this.showSpecialChars = true;
      this.editor = editor;
    };
  }

  show(option: any) {
    this.status.next(option);
  }

  hide() {
    this.showSpecialChars = false;
    this.status.next(false);
  }

  getStatus(): Observable<any> {
    return this.status.asObservable();
  }
}
