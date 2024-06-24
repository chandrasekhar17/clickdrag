import { Component, OnInit } from '@angular/core';
import { V2StateService, V2Errors } from 'src/app/services/v2-state/v2-state.service';
import { AlertType } from '@mhe/ngx-shared';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';

@Component({
  selector: 'app-backward-compatibility-warnings',
  templateUrl: './backward-compatibility-warnings.component.html',
  styleUrls: ['./backward-compatibility-warnings.component.scss'],
})
export class BackwardCompatibilityWarningsComponent implements OnInit {
  titleText = 'Warning';
  modalIsVisible = true;
  showFooter = true;
  cancelButtonText = false;
  content = '';
  errorType = AlertType.Warning;
  startFromScratch = false;

  constructor(public cdStateSerice: CdStateService, public v2StateService: V2StateService) { }

  ngOnInit(): void {
    if (this.v2StateService.v2StatePassed) {
      // this.v2StateService.errorList.sort();
      if (this.v2StateService.errorList.includes(V2Errors.INVALID_TYPE)) {
        this.content =
          '<p>This activity type is not supported in Complaint Click Drag. Click "OK" to start building new activity from scratch.</p>';
        this.startFromScratch = true;
        this.titleText = 'Error';
        this.errorType = AlertType.Error;
      } else {
        if (this.v2StateService.errorList.includes(V2Errors.LABEL_THRESHOLD)) {
          this.content =
            this.content +
            '<p>Complaint Click Drag supports a maximum of 20 labels. Only the first 20 labels will be retained.</p>';
        }
        if (this.v2StateService.errorList.includes(V2Errors.MORE_BGIMG)) {
          this.content =
            this.content +
            '<p>Complaint Click Drag supports only one background image. Only one image will be retained.</p>';
        }
        if (this.v2StateService.errorList.includes(V2Errors.TEXT_IN_FRAME)) {
          this.content =
            this.content +
            '<p>Complaint Click Drag does not support Type tool, any text created using Type tool will be ignored.</p>';
        }
        if (this.v2StateService.errorList.includes(V2Errors.GROUP_MORE_IMG)) {
          this.content =
            this.content +
            '<p>Complaint Click Drag does not support a single image used across multiple groups. The group image will be ignored. Click "OK" to continue.</p>';
        }
        if (this.v2StateService.errorList.includes(V2Errors.GROUP_THRESHOLD)) {
          this.content =
            this.content +
            '<p>Complaint Click Drag supports maximum of 6 groups. Only first 6 groups will be retained.</p>';
        }
        if (this.v2StateService.errorList.includes(V2Errors.FIB_VALUE)) {
          this.content =
            this.content +
            '<p>Complaint Click Drag does not support fill in the blank answer inside a label. Fill in the blank labels will be converted to text labels.</p>';
        }
        if (this.v2StateService.errorList.includes(V2Errors.AUDIO_CONVERSION)) {
          this.content =
            this.content +
            '<p>Complaint Click Drag does not support audio labels. Audio labels with text will be replaced by text only labels. Audio labels without text will be removed.</p>';
        }
        this.content = this.content + '<p>Do you wish to proceed?</p>';
      }
    }
    if (this.content === "" && this.cdStateSerice.removedDuplicates !== undefined) {
      for (let removedLabel of this.cdStateSerice.removedDuplicates.removedLabels) {
        if (removedLabel.dockedTo.length > 0) {
          this.content = this.content +
            `<p>Label "${removedLabel.text.replace(/<[^>]+>/g, '')}"
          with ${removedLabel.dockedTo.length} drop zones
          is removed as duplicate ids are found. Please add this label again. </p>`
        } else {
          this.content = this.content +
            `<p>Label "${removedLabel.text.replace(/<[^>]+>/g, '')}"
        is removed as duplicate ids are found. Please add this label again. </p>`
        }
      }
    }
  }

  okayClicked(evt) {
    this.modalIsVisible = false;
    this.v2StateService.conversionErrorsOkay = true;
    if (this.startFromScratch) {
      this.cdStateSerice.initState();
      this.v2StateService.errorsOkayed.next('select-activity');
      if (window.innerHeight < 650) {
        EZ.resize(window.innerWidth, 650);
      }
    } else {
      this.v2StateService.errorsOkayed.next('show-canvas');
    }
  }

  cancelClicked(evt) {
    this.modalIsVisible = false;
  }
}
