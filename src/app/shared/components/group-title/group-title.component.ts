import { Component, Input, OnInit } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';

@Component({
  selector: 'app-group-title',
  templateUrl: './group-title.component.html',
  styleUrls: ['./group-title.component.scss']
})
export class GroupTitleComponent implements OnInit {
  @Input() group: any;
  groupLength: number = 0;
  groupIndex: number = 0;
  groupImageMaxHeight: number;
  constructor(public cdStateService: CdStateService) { }

  ngOnInit(): void {
    const state = this.cdStateService.getState();
    this.groupLength = state.dockData.docks.length;
    this.groupImageMaxHeight = Math.max.apply(
      Math,
      state.dockData.docks.map((dock) => dock.image.height)
    );
    console.log('maxHeight', this.groupImageMaxHeight);
    this.groupIndex = state.dockData.docks.findIndex(item => item.id === this.group.id);
  }
  getGroupTitle(text: string) {
    if (text !== '' && text !== undefined) return `${this.cdStateService.stripHtmlTags(text)}`;
    return 'Group';
  }

}
