import { Component, Input, OnInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ButtonPurpose } from '@mhe/ngx-shared';

@Component({
  selector: 'app-media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: ['./media-preview.component.scss'],
})
export class MediaPreviewComponent implements OnInit, OnChanges {
  @Input() mediaDetails;
  @Input() isLabel;
  @ViewChild('audioElement') audioPlayer: ElementRef<HTMLAudioElement>;
  _buttonPurpose = ButtonPurpose;
  play = false;
  track;
  transcript: any;
  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  get $player(): HTMLAudioElement {
    return this.audioPlayer.nativeElement;
  }

  ngOnChanges() {
    if (this.mediaDetails?.type === 'audio') {
      this.play = false;
      this.getTranscript();
      if (this.audioPlayer) {
        this.audioPlayer.nativeElement.load();
      }
    }
  }

  getTranscript() {
    if (this.mediaDetails?.caption) {
      this.http.get(this.mediaDetails?.caption, { responseType: 'text' }).subscribe(
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

  handleAudio() {
    this.play = !this.play;
    this.play ? this.audioPlayer.nativeElement.play() : this.audioPlayer.nativeElement.pause();
    this.$player.addEventListener('ended', (e) => {
      this.play = false;
    });
  }
}
