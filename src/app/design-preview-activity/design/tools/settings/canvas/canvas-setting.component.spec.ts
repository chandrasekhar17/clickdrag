import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasSettingComponent } from './canvas-setting.component';

describe('CanvasSettingComponent', () => {
  let component: CanvasSettingComponent;
  let fixture: ComponentFixture<CanvasSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvasSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
