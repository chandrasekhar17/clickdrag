import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackwardCompatibilityWarningsComponent } from './backward-compatibility-warnings.component';

describe('BackwardCompatibilityWarningsComponent', () => {
  let component: BackwardCompatibilityWarningsComponent;
  let fixture: ComponentFixture<BackwardCompatibilityWarningsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackwardCompatibilityWarningsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackwardCompatibilityWarningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
