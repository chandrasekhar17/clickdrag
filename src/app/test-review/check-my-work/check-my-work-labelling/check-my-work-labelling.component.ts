import { Component, OnInit } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';

export interface Media {
  path: string;
  altText: string;
  description: string;
}

@Component({
  selector: '.app-check-my-work-labelling',
  templateUrl: './check-my-work-labelling.component.html',
  styleUrls: ['./check-my-work-labelling.component.scss'],
})
export class CheckMyWorkLabellingComponent implements OnInit {
  state: any;
  image: any;
  dropZones: any;
  leaderLineNodes: any[];
  constructor(public cdStateService: CdStateService, public mediaService: MediaService) {}

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    this.image = this.state.frameData.frames[0];
    this.dropZones = this.state.response.docks;
    this.cdStateService.setLeaderLineNodes();
    this.leaderLineNodes = this.cdStateService.leaderLineNodes;
  }
}
