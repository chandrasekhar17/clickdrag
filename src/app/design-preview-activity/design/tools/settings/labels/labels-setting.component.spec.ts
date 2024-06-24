import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsSettingComponent } from './labels-setting.component';

describe('LabelsSettingComponent', () => {
  let component: LabelsSettingComponent;
  let fixture: ComponentFixture<LabelsSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelsSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelsSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
