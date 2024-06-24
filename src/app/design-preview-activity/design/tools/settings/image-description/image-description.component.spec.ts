import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDescriptionComponent } from './image-description.component';

describe('ImageDescriptionComponent', () => {
  let component: ImageDescriptionComponent;
  let fixture: ComponentFixture<ImageDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
