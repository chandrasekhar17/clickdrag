import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import { CdStateService } from './services/cd-state/cd-state.service';
import { V2StateService } from './services/v2-state/v2-state.service';
import { MediaService } from './services/media/media.service';
import { AlertType } from '@mhe/ngx-shared';
import { ScramblerService } from './services/scrambler/scrambler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ClickAndDragV3';
  version = '17052024'; // format mmddyyyy
  mode = EZ.mode;
  isNewState: boolean = false;
  stateError = false;
  appInit = false;
  alertType = AlertType;

  constructor(
    private cdStateService: CdStateService,
    private v2StateService: V2StateService,
    private mediaService: MediaService,
    private scrambler: ScramblerService,
    private ngZone: NgZone,
    private announcer: LiveAnnouncer
  ) {
    window['CDInstance'] = this;
  }

  ngOnInit() {
    this.setEZTDims();
    if (this.mediaService.mediaLoaded === false) {
      this.mediaService.mediaLoaded$.subscribe(() => this.initApp());
    } else {
      this.initApp();
    }
  }

  async initApp() {
    this.cdStateService.appVersion = this.version;
    let ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') > -1) {
        this.cdStateService.isSafari = false;
      } else {
        this.cdStateService.isSafari = true;
      }
    }
    if (ua.indexOf('firefox') !== -1) {
      this.cdStateService.isFirefox = true;
    }
    await this.setState();
    this.updateIframeSize();
    document.getElementById('loader').style.display = 'none';
    this.ngZone.run(() => {
      this.appInit = true;
    });
  }

  getState() {
    const state = this.cdStateService.getState();
    if (EZ.mode === EZ.MODE_DESIGN || EZ.mode === EZ.MODE_TEST) {
      if (
        EZ.mode === EZ.MODE_TEST ||
        this.v2StateService.conversionErrors === false ||
        this.v2StateService.conversionErrorsOkay === true
      ) {
        if (EZ.mode === EZ.MODE_DESIGN) {
          const listOfMediaUsed = this.cdStateService.getListOfMediaUsed(state);
          this.mediaService.updateMediaConsumption(listOfMediaUsed);
          this.checkLabelsAndDescription(state.labelData.labels);
        }
        return this.scrambler.scramble(JSON.stringify(state));
      } else {
        return EZ.state;
      }
    } else {
      return EZ.state;
    }
  }

  checkLabelsAndDescription(labels) {
    let isEmptyLabel = false;
    let isEmptyDescription = false;
    for (let i = 0; i < labels.length; i++) {
      if (labels[i].text === '' && labels[i].mediaType !== 'image') {
        isEmptyLabel = true;
        this.cdStateService.highlightErrorLabel.next(labels[i]);
      }
    }
    if (this.cdStateService.getState().activity.name === "labeling") {
      for (let i = 0; i < labels.length; i++) {
        if (labels[i].dropzoneDescription === '' && !labels[i].distractor) {
          isEmptyDescription = true;
          this.cdStateService.highlightErrorLabel.next(labels[i]);
        }
      }
    }

    if (isEmptyLabel && isEmptyDescription) {
      alert('One or more labels are empty. Please provide label text/image.\nOne or more labels do not have drop zone descriptions. Please provide drop zone description.');
    } else if (isEmptyLabel) {
      alert('One or more labels are empty. Please provide label text/image before proceeding.');
    } else if (isEmptyDescription) {
      alert('Each label must have a drop zone description.');
    }
  }

  async setState() {
    const state = EZ.state;
    try {
      if (state) {
        const isV2State = this.v2StateService.isV2State(state);
        if (EZ.mode === EZ.MODE_DESIGN && isV2State) {
          const success = await this.v2StateService.convertStateV2toV3(state);
          console.log('Conversion complete');
          if (success) {
            const v3State = this.v2StateService.getV3State();
            this.cdStateService.setState(v3State);
          } else if (this.v2StateService.errorParsingState) {
            this.stateError = true;
          }
        } else {
          this.cdStateService.setState(this.scrambler.unscramble(state));
        }
      } else {
        this.cdStateService.initState();
        this.isNewState = true;
      }
    } catch (e) {
      console.log('Error setting the state!');
      this.stateError = true;
    }
    // added empty announcer to test the check my work mode
    this.announcer.announce('');
  }

  getScore() {
    return this.cdStateService.getScore();
  }

  getCompletion(state) {
    const stateStr = this.scrambler.unscramble(state);
    return this.cdStateService.getCompletion(stateStr);
  }

  updateIframeSize() {
    if (this.stateError || this.v2StateService.invalidActivity) {
      return;
    }
    const state = this.cdStateService.getState();
    let canvasDim = { width: 0, height: 0 };
    // if (this.isNewState) {
    //   canvasDim = {
    //     width: window.innerWidth < 800 ? state.canvas.width : window.innerWidth,
    //     height: window.innerHeight < 600 ? state.canvas.height : window.innerHeight,
    //   };
    // } else {
    //   canvasDim = {
    //     width: state.canvas.width,
    //     height: state.canvas.height,
    //   };
    // }
    // this.cdStateService.updateIframeSize(canvasDim.width, canvasDim.height);
    if (!this.isNewState) {
      this.cdStateService.updateIframeSize(
        state.canvas.width === null ? 800 : state.canvas.width,
        state.canvas.height === null ? 600 : state.canvas.height
      );
    } else if (EZ.mode === EZ.MODE_DESIGN) {
      EZ.resize(800, 650);
    }
  }

  setEZTDims() {
    this.cdStateService.eztoDim.width = window.innerWidth;
    this.cdStateService.eztoDim.height = window.innerHeight;
  }
}
