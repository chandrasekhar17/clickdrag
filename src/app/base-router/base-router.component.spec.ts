import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseRouterComponent } from './base-router.component';

describe('BaseRouterComponent', () => {
  let component: BaseRouterComponent;
  let fixture: ComponentFixture<BaseRouterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
