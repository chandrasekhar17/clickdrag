import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDropzoneComponent } from './group-dropzone.component';

describe('GroupDropzoneComponent', () => {
  let component: GroupDropzoneComponent;
  let fixture: ComponentFixture<GroupDropzoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDropzoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
