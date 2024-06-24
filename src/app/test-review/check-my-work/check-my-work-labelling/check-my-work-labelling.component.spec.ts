import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckMyWorkLabellingComponent } from './check-my-work-labelling.component';

describe('CheckMyWorkLabellingComponent', () => {
  let component: CheckMyWorkLabellingComponent;
  let fixture: ComponentFixture<CheckMyWorkLabellingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckMyWorkLabellingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckMyWorkLabellingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
