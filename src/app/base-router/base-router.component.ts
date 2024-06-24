import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

declare var window: any;
declare var EZ: any;

@Component({
  selector: 'app-base-router',
  templateUrl: './base-router.component.html',
  styleUrls: ['./base-router.component.scss']
})
export class BaseRouterComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.routeToSpecificMode();
  }
  routeToSpecificMode() {
    switch (EZ.mode) {
      case 'design':
        this.router.navigate(['../design'], { relativeTo: this.route });
        break;
      case 'test':
        this.router.navigate(['../test'], { relativeTo: this.route });
        break;
      case 'review':
        this.router.navigate(['../review'], { relativeTo: this.route });
        break;
      case 'sample':
        this.router.navigate(['../sample'], { relativeTo: this.route });
        break;
      default:
        this.router.navigate(['../preview'], { relativeTo: this.route });
        break;
    }
  }

}
