import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent implements OnInit {
  buttonPurpose = ButtonPurpose;
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'right';
  @Input() text: string;
  @Input() templateRef: TemplateRef<any>;

  constructor() {}

  ngOnInit(): void {}
}
