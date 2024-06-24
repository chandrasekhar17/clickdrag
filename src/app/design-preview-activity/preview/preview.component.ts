import { Component, OnInit } from '@angular/core';
import { CdStateService } from '../../services/cd-state/cd-state.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
  state: any;

  constructor(private cdStateService: CdStateService) { }

  ngOnInit(): void {
    this.state = this.cdStateService.getState();
  }

}
