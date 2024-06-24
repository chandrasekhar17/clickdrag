import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  Input,
  OnInit,
  Type,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[appDynamicHost]',
})
export class DynamicHostDirective implements OnInit {
  @Input('appDynamicHost') component: Type<any>;

  constructor(private cfr: ComponentFactoryResolver, private vcr: ViewContainerRef, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const componentFactory = this.cfr.resolveComponentFactory(this.component);
    this.vcr.clear();
    this.vcr.createComponent(componentFactory);
    this.cdr.detectChanges();
  }
}
