import { Component, OnInit } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';

@Component({
  selector: 'app-check-my-work',
  templateUrl: './check-my-work.component.html',
  styleUrls: ['./check-my-work.component.scss'],
})
export class CheckMyWorkComponent implements OnInit {
  state: any;
  leaderLineNodes: any;
  constructor(private cdStateService: CdStateService,
    private a11yHelper: A11yHelperService,
    private announcer: LiveAnnouncer) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    // this.cdStateService.getScore();
    this.cdStateService.setLeaderLineNodes();
    this.leaderLineNodes = this.cdStateService.leaderLineNodes;
  }

  ngAfterViewInit() {
    this.announceText();
  }

  announceText() {
    this.announcer.announce(this.a11yHelper.getAnnounceMsg('reviewModeText'));
  }
}
