import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestGroupDropzoneComponent } from './test-group-dropzone.component';

describe('TestGroupDropzoneComponent', () => {
  let component: TestGroupDropzoneComponent;
  let fixture: ComponentFixture<TestGroupDropzoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestGroupDropzoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGroupDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
