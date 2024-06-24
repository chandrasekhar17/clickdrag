import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { CdStateService } from '../../../services/cd-state/cd-state.service';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';
import { MediaService } from '../../../services/media/media.service'


@Component({
  selector: '.app-shared-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
})
export class LabelsComponent implements OnInit {
  labelList = [];
  state: any;
  _buttonPurpose = ButtonPurpose;
  labelListArray = [];
  labelNote = [];
  labelFeedback = [];
  mode: any;
  feedbackPolicy = true;
  isFirefox: boolean;
  showFeedbackInPreview = false;
  popoverHeadingId: string = '';
  popoverContentId: string = '';

  constructor(public cdStateService: CdStateService, private a11yHelper: A11yHelperService, private mediaService: MediaService) { }

  ngOnInit(): void {
    this.mode = EZ.mode;
    this.isFirefox = this.cdStateService.isFirefox;
    this.feedbackPolicy = EZ.policy('p_posttest') === 'feedback' ? true : false;
    this.state = this.cdStateService.getState();
    const isDisplayEachLabel = this.state.activity.options.typeOfOccurrence === 'display-each-instance' ? true : false;
    if (EZ.mode === 'preview') {
      if (this.state.response !== undefined) {
        this.showFeedbackInPreview = true;
        let labels = this.state.response.labels;
        for (let label of labels) {
          let orgId = label.orgId;
          let filteredLabel = this.state.labelData.labels.filter((ele) => ele.id === orgId)[0];
          this.labelList.push(filteredLabel);
        }
        this.labelList = this.labelList.map((label, index) => {
          return { ...label, id: index + 1 };
        });
      } else {
        if (isDisplayEachLabel) {
          this.state.labelData.labels.forEach((element) => {
            if (element.distractor) {
              this.labelList.push(element);
            } else {
              element.dockedTo.forEach((ele) => {
                this.labelList.push(element);
              });
            }
          });
          this.labelList = this.labelList.map((label, index) => {
            return { ...label, id: index + 1 };
          });
        } else {
          this.labelList = this.state.labelData.labels;
        }
      }
    }
    if (EZ.mode === 'test' || EZ.mode === 'sample' || EZ.mode === 'review') {
      this.labelList = this.state.response.labels;
    }
  }

  getNote(note, index: string | number) {
    this.labelNote[index] = note;
  }


  getFeedback(feedback, index: string | number) {
    this.labelFeedback[index] = feedback;
  }

  getAriaLabel(label: any, type): string {
    const LabelObj = {
      text: '',
    };
    if (EZ.mode === 'test' || EZ.mode === 'sample' || EZ.mode === 'review') {
      const QLabel = this.state.labelData.labels.find((l) => l.id === label.orgId);
      if (QLabel.text !== "") {
        LabelObj.text = this.cdStateService.stripHtmlTags(QLabel.text);
      } else {
        const altText = QLabel.image.altText === "" ? this.mediaService.getMediaShortDescription(QLabel.image.mediaId) : QLabel.image.altText;
        LabelObj.text = this.cdStateService.stripHtmlTags(altText);
      }
    } else {
      if (label.text !== "") {
        LabelObj.text = this.cdStateService.stripHtmlTags(label.text);
      } else {
        const altText = label.image.altText === "" ? this.mediaService.getMediaShortDescription(label.image.mediaId) : label.image.altText;
        LabelObj.text = this.cdStateService.stripHtmlTags(altText);
      }
    }
    return this.a11yHelper.getAnnounceMsg(type, LabelObj);
  }


  onShowLabelToolTip(event, item, el, type: 'notes' | 'feedback') {
    if (event === 'TooltipDirective') {
      const text = this.getAriaLabel(item, type);
      el.elementRef.nativeElement.setAttribute('aria-label', text);
    } else {
      this.onShow(event, el)
    }
  }

  onShow(event, ref) {
    if (event !== 'TooltipDirective') {
      this.setPopoverIds(ref);
      if (ref.panelClass === 'label-popover') {
        this.adjustPopoverPosition(ref);
      }
    }
  }

  setPopoverIds(ref) {
    setTimeout(() => {
      this.popoverHeadingId = ref.popoverRef.instance.templateUUIDs.uuids["popover-heading"];
      this.popoverContentId = ref.popoverRef.instance.templateUUIDs.uuids["popover-content"];
    });
  }

  adjustPopoverPosition(ref) {
    setTimeout(() => {
      const popoverContent = ref.popoverRef.instance.popoverContent.nativeElement.getBoundingClientRect();
      const bodyHeight = ref.overlayRef._document.body.clientHeight;
      if (popoverContent.y < 0) {
        this.setHostTopPosition(ref, popoverContent.y);
        this.setArrowPosition(ref);
      }

      if (bodyHeight < (popoverContent.height + popoverContent.top)) {
        ref.overlayRef._pane.style.transform = "translate(0px)";
        const popover = document.querySelector('.popover').getBoundingClientRect();
        const top = bodyHeight - popover.height;
        ref.overlayRef._host.style.top = `${top}px`;

        const btn = ref.elementRef.nativeElement.getBoundingClientRect();
        const popoverAfter = document.querySelector('.popover').getBoundingClientRect();
        ref.popoverRef.instance.arrowRef.nativeElement.style.top = `${btn.top - popoverAfter.top + 15}px`;
      }
    }, 10);
  }

  setHostTopPosition(ref, y) {
    const top = ref.overlayRef._host.getBoundingClientRect().top - y;
    ref.overlayRef._host.style.top = `${top + 1}px`;
  }

  setArrowPosition(ref) {
    const btn = ref.elementRef.nativeElement.getBoundingClientRect();
    const btnTop = btn.top + (btn.height / 2);
    ref.popoverRef.instance.arrowRef.nativeElement.style.top = `${btnTop}px`;
  }


}
