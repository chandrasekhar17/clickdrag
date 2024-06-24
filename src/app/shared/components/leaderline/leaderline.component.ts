import { Component, Input, OnInit } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { APP_CONFIG } from '../../constants/appconfig';

@Component({
  selector: '[app-leaderline]',
  templateUrl: './leaderline.component.html',
  styleUrls: ['./leaderline.component.scss']
})
export class LeaderlineComponent implements OnInit {

  // offset = 2;
  @Input('nodeObj') nodeObj;
  @Input('offset') offset;
  @Input('color') color;
  @Input('strokeWidth') strokeWidth;
  startPos;
  endPos;
  constructor(public cdStateService: CdStateService) { }

  ngOnInit(): void {
    this.startPos = this.nodeObj.parent.position;
    this.endPos = this.nodeObj.nodeRef.position;
  }
}
