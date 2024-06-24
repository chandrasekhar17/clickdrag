import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleLabelComponent } from './single-label.component';

describe('SingleLabelComponent', () => {
  let component: SingleLabelComponent;
  let fixture: ComponentFixture<SingleLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
