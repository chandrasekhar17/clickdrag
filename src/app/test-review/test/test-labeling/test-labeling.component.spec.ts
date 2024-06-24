import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestLabelingComponent } from './test-labeling.component';

describe('TestLabelingComponent', () => {
  let component: TestLabelingComponent;
  let fixture: ComponentFixture<TestLabelingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestLabelingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestLabelingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
