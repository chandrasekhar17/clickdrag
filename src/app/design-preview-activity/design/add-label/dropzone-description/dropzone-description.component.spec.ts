import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropzoneDescriptionComponent } from './dropzone-description.component';

describe('DropzoneDescriptionComponent', () => {
  let component: DropzoneDescriptionComponent;
  let fixture: ComponentFixture<DropzoneDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropzoneDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropzoneDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
