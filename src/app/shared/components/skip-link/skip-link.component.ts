import { Component, Input, OnInit } from '@angular/core';
import { A11yHelperService } from 'src/app/shared/services/a11y-helper.service';

@Component({
  selector: 'app-skip-link',
  templateUrl: './skip-link.component.html',
  styleUrls: ['./skip-link.component.scss']
})
export class SkipLinkComponent implements OnInit {
  @Input() type: string | 'label' | 'canvas';
  constructor(private a11yHelper: A11yHelperService) { }

  ngOnInit(): void {
  }

  skipLinkLabel() {
    this.a11yHelper.skipLink('droZoneContainer');
  }

  skipLinkCanvas() {
    this.a11yHelper.skipLink('labelContainer');
  }
}
