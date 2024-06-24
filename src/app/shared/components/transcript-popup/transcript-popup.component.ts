import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ButtonPurpose, ButtonType } from '@mhe/ngx-shared';

export interface positionConfig {
  x: number;
  y: number;
}

@Component({
  selector: 'app-transcript-popup',
  templateUrl: './transcript-popup.component.html',
  styleUrls: ['./transcript-popup.component.scss'],
})
export class TranscriptPopupComponent implements OnInit {
  _buttonPurpose = ButtonPurpose;
  buttonType = ButtonType;
  @Input() audioData: any;
  @Input() boundary: string;
  @Input() position: positionConfig;
  @Output()
  close = new EventEmitter();

  transcript: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.audioData?.caption) {
      this.http.get(this.audioData?.caption, { responseType: 'text' }).subscribe(
        (data) => {
          this.transcript = data;
        },
        (error) => {
          this.transcript = '';
        }
      );
    } else {
      this.transcript = '';
    }
  }

  onClose() {
    this.close.emit(this);
  }
}
