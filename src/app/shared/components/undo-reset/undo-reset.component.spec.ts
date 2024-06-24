import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoResetComponent } from './undo-reset.component';

describe('UndoResetComponent', () => {
  let component: UndoResetComponent;
  let fixture: ComponentFixture<UndoResetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoResetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
