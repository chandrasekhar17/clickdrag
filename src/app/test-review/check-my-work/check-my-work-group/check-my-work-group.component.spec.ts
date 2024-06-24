import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckMyWorkGroupComponent } from './check-my-work-group.component';

describe('CheckMyWorkGroupComponent', () => {
  let component: CheckMyWorkGroupComponent;
  let fixture: ComponentFixture<CheckMyWorkGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckMyWorkGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckMyWorkGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
