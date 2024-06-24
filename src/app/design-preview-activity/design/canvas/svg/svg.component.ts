import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { CdStateService } from 'src/app/services/cd-state/cd-state.service';
import { StageRulerService } from 'src/app/services/stage-ruler/stage-ruler.service';
import { ModalService } from '../../../../services/modal-popup/modal.service';
import { APP_CONFIG } from '../../../../shared/constants/appconfig';
import { ReorderLabelsService } from '../../services/reorder-labels.service';

@Component({
  selector: 'app-svg',
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.scss'],
})
export class SvgComponent implements OnInit {
  dropZones = [];
  framePosition: any;
  selectedElement;
  offset = 1;
  state: any;
  initialX = 0;
  initialY = 0;
  initialDockData: any;
  config: any;
  @ViewChild('canvasContainer') canvasContainer: ElementRef;
  leaderLineNodes = [];
  constructor(
    public cdStateService: CdStateService,
    public modalService: ModalService,
    private ruler: StageRulerService) {
    this.config = APP_CONFIG;
    this.state = cdStateService.getState();
    this.dropZones = this.state.dockData.docks;
    this.framePosition = this.state.frameData.frames[0].position;
    this.leaderLineNodes = this.cdStateService.leaderLineNodes;
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    const mousedown$ = fromEvent(this.canvasContainer.nativeElement, 'mousedown');
    mousedown$.subscribe((event) => {
      this.cdStateService.deselectObject();
    });
  }

  // mouseUpEvent(ev) {
  //   console.log(ev.type);
  //   if ((this.selectedElement.id === 'svg_rect')) {
  //     const coord = this.getMousePosition(ev);
  //     const newCord = { x: coord.x - this.offset.x, y: coord.y - this.offset.y };
  //     this.framePosition.x = newCord.x;
  //     this.framePosition.y = newCord.y;
  //     this.selectedElement.setAttribute('x', newCord.x);
  //     this.selectedElement.setAttribute('y', newCord.y);
  //   }
  //   this.selectedElement = null;
  // }

  // getMousePosition(evt) {
  //   const svg = document.getElementById('group');
  //   const dim = svg.getBoundingClientRect();
  //   return {
  //     x: evt.clientX - dim.left,
  //     y: evt.clientY - dim.top,
  //   };
  // }
  // openEditPopup() {
  //   this.modalService.editImageDescriptionModal();
  // }
}
