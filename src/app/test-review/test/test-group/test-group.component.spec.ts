import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestGroupComponent } from './test-group.component';

describe('TestGroupComponent', () => {
  let component: TestGroupComponent;
  let fixture: ComponentFixture<TestGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
