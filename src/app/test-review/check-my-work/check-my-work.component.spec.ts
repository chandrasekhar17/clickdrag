import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckMyWorkComponent } from './check-my-work.component';

describe('CheckMyWorkComponent', () => {
  let component: CheckMyWorkComponent;
  let fixture: ComponentFixture<CheckMyWorkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckMyWorkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckMyWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
