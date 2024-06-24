import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';

import { TooltipPlacement } from './placement';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent implements AfterViewInit {
  @HostBinding('attr.id')
  get tooltipId() {
    return this.id;
  }

  @HostBinding('attr.class') get classes() {
    return `${this.placement}`;
  }

  @Input() id: string;
  @Input() placement: TooltipPlacement = 'top';
  @Input() tooltipMessage: string;
  @Input() templateRef: TemplateRef<any>;
  @Input() toggleOnClick = true;
  @Input() close: any;
  @Output() afterViewInit = new EventEmitter();

  constructor(public el: ElementRef) { }

  ngAfterViewInit() {
    this.afterViewInit.emit();
  }

  // get classes() {
  //   return `popover dpg-ui-tooltip ${this.placement}`;
  // }
}