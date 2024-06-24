import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';

@Component({
  selector: 'app-activity-view',
  templateUrl: './activity-view.component.html',
  styleUrls: ['./activity-view.component.scss'],
})
export class ActivityViewComponent implements OnInit {
  @Output() updateIsActivity = new EventEmitter<boolean>();
  modalIsVisible = false;
  typeOfActivity = 'labeling';
  typeOfInteraction = 'one-label-one-dock';
  typeOfOccurrence = '';

  constructor(public cdStateService: CdStateService) {}

  ngOnInit(): void {
    this.showModal();
  }

  groupChangeActivity(event) {
    this.typeOfActivity = event.value;
  }

  groupChangeInteraction(event) {
    const value = event.value;
    this.typeOfInteraction = value;
    if (value === 'one-label-multiple-dock' && this.typeOfOccurrence === '') {
      this.typeOfOccurrence = 'display-once';
    }
    if (value === 'one-label-one-dock') {
      this.typeOfOccurrence = '';
    }
  }

  groupChangeOccurrence(event) {
    this.typeOfOccurrence = event.value;
  }

  onStart(event) {
    this.updateIsActivity.emit(false);
    this.cdStateService.setActivity(this.typeOfActivity, this.typeOfInteraction, this.typeOfOccurrence);
  }

  showModal() {
    this.modalIsVisible = !this.modalIsVisible;
  }
}
