import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { V2StateService } from 'src/app/services/v2-state/v2-state.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/services/config-translator/appConfig.service';

declare var window;

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss'],
})
export class DesignComponent implements OnInit {
  @ViewChild('languageInput') languageInput: ElementRef;
  state: any;
  isActivityView = true;
  showCanvas = false;
  backwardCompatibilityErrors = false;
  duplicates = false;
  language: string;

  constructor(public cdStateService: CdStateService, public v2StateService: V2StateService,
    private translate: TranslateService,
    private appConfigService: AppConfigService
  ) {
    this.language = EZ.language;
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language)
  }

  ngOnInit(): void {
    this.appConfigService.loadTranslations();
    if (this.cdStateService.removedDuplicates.removedDocks.length > 0 || this.cdStateService.removedDuplicates.removedLabels.length > 0) {
      this.duplicates = true;
    } else {
      this.duplicates = false;
    }

    if (this.v2StateService.v2StatePassed) {
      this.isActivityView = false;
      this.showCanvas = false;
      if (this.v2StateService.isConversionSuccessful === false || this.v2StateService.conversionErrors) {
        this.backwardCompatibilityErrors = true;
      } else {
        this.showCanvas = true;
        this.cdStateService.updateMediaConsumption();
      }
      this.v2StateService.errorsOkayed.subscribe((val) => {
        if (val === 'select-activity') {
          this.isActivityView = true;
          this.backwardCompatibilityErrors = false;
          this.showCanvas = false;
        } else if (val === 'show-canvas') {
          this.isActivityView = false;
          this.backwardCompatibilityErrors = false;
          this.showCanvas = true;
        }
        this.cdStateService.updateMediaConsumption();
      });
    } else {
      this.state = this.cdStateService.getState();
      if (this.state.activity.name === null) {
        this.isActivityView = true;
        this.showCanvas = false;
      } else {
        this.isActivityView = false;
        this.showCanvas = true;
      }
    }
    this.cdStateService.eztoHeight = window.innerHeight;
  }

  updateActivity(event) {
    const state = this.cdStateService.getState();
    this.cdStateService.updateIframeSize(state.canvas.width, state.canvas.height);
    this.isActivityView = event;
    this.showCanvas = true;
  }
}
