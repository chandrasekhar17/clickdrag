import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

import { TranscriptPopupComponent } from '../../components/transcript-popup/transcript-popup.component';

export interface positionConfig {
  x: number;
  y: number;
}

export interface TranscriptPopupOptions {
  audioData: any;
  boundary: string;
  position: positionConfig;
}

@Injectable({
  providedIn: 'root',
})
export class TranscriptPopupService {
  private transcriptPopup = this.resolver.resolveComponentFactory<TranscriptPopupComponent>(TranscriptPopupComponent);
  private componentRef: any;
  public isOpen: boolean = false;
  public stop$ = new Subject();
  private audioObj = new Audio();
  isPlaying: boolean = false;
  audioEvents = ['ended', 'error', 'play', 'playing', 'pause', 'timeupdate', 'canplay', 'loadedmetadata', 'loadstart'];
  currentAudio: any;
  currentTranscript: any;

  constructor(private resolver: ComponentFactoryResolver, private injector: Injector, private appRef: ApplicationRef) {}

  appendDialogComponentToBody(options) {
    this.componentRef = this.transcriptPopup.create(this.injector, [[]]);
    this.componentRef.instance.boundary = options.boundary;
    this.componentRef.instance.position = options.position;
    this.componentRef.instance.audioData = options.audioData;
    this.componentRef.instance.close.subscribe((data) => {
      this.close();
    });
    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.querySelector(`${options.boundary}`).appendChild(domElem);
  }
  public close() {
    if (this.isOpen) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.isOpen = false;
      this.currentTranscript = '';
    }
  }

  public open(options: TranscriptPopupOptions) {
    if (this.isOpen) {
      this.close();
    }
    this.currentTranscript = options.audioData;
    this.appendDialogComponentToBody(options);
    this.isOpen = true;
  }

  private audioObservable(url) {
    return new Observable((observer) => {
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();
      this.isPlaying = true;

      const handler = (event: Event) => {
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        this.isPlaying = false;
        this.removeEvents(this.audioObj, this.audioEvents, handler);
      };
    });
  }

  private addEvents(obj, events, handler) {
    events.forEach((event) => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach((event) => {
      obj.removeEventListener(event, handler);
    });
  }

  audioPlay(url) {
    this.currentAudio = url;
    return this.audioObservable(url).pipe(takeUntil(this.stop$));
  }

  audioStop() {
    this.isPlaying = false;
    this.stop$.next();
  }
}
