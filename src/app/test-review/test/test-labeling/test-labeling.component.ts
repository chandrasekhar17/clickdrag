import { Component, OnInit } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';

@Component({
  selector: '.app-test-labeling',
  templateUrl: './test-labeling.component.html',
  styleUrls: ['./test-labeling.component.scss']
})
export class TestLabelingComponent implements OnInit {
  state: any;
  dropZones: any;
  image: any;
  leaderLineNodes: any[];
  constructor(public cdStateService: CdStateService, public mediaService: MediaService) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    console.log(this.state);
    this.image = this.state.frameData.frames[0];
    this.dropZones = this.state.response.docks;
    this.cdStateService.setLeaderLineNodes();
    this.leaderLineNodes = this.cdStateService.leaderLineNodes;
  }

}
