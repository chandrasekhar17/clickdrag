import { Component, OnInit } from '@angular/core';
import { CdStateService } from '../../../services/cd-state/cd-state.service';
import { MediaService } from 'src/app/services/media/media.service';

@Component({
  selector: '.app-preview-svg',
  templateUrl: './preview-svg.component.html',
  styleUrls: ['./preview-svg.component.scss']
})
export class PreviewSvgComponent implements OnInit {
  state: any;
  image: any;
  dropZones: any;
  leaderLineNodes: any[];
  constructor(public cdStateService: CdStateService, private mediaService: MediaService) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
    this.image = this.state.frameData.frames[0];
    this.dropZones = this.state.dockData.docks;
    this.cdStateService.setLeaderLineNodes();
    this.leaderLineNodes = this.cdStateService.leaderLineNodes;
  }

}
