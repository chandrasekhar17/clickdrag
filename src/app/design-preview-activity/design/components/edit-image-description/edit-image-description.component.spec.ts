import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditImageDescriptionComponent } from './edit-image-description.component';

describe('EditImageDescriptionComponent', () => {
  let component: EditImageDescriptionComponent;
  let fixture: ComponentFixture<EditImageDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditImageDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditImageDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
