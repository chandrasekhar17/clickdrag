import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { StageRulerService } from '../../../services/stage-ruler/stage-ruler.service';
import { ReorderLabelsService } from '../services/reorder-labels.service';
declare let window;
@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {
  state: any;
  reorderLabels: any;

  @ViewChild('stageContainer') stage: ElementRef;

  constructor(private ruler: StageRulerService,
    public cdStateService: CdStateService,
    private reorderLabelsService: ReorderLabelsService
  ) {
    this.state = cdStateService.getState();
  }

  ngOnInit(): void {
    this.reorderLabelsService.reorderLabels.subscribe((value) => {
      this.reorderLabels = value;
    })
  }

  getUrl(pattern: string): string {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const pathname = window.location.pathname;
    return `url(${protocol}//${host}${pathname}#${pattern})`;
  }

  ngAfterViewInit(): void {
    this.ruler.initializeRuler(this.stage.nativeElement);
  }
}
