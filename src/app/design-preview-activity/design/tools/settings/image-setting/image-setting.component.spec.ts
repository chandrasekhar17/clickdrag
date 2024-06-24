import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSettingComponent } from './image-setting.component';

describe('ImageSettingComponent', () => {
  let component: ImageSettingComponent;
  let fixture: ComponentFixture<ImageSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
