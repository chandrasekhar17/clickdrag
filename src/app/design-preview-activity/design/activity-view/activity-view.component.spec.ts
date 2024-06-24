import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityViewComponent } from './activity-view.component';

describe('ActivityViewComponent', () => {
  let component: ActivityViewComponent;
  let fixture: ComponentFixture<ActivityViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityViewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('groupChangeActivity', () => {
    // spyOn(handleRadioButtonService, 'handleChangeActivityType');
    component.groupChangeActivity({ value: 'Labeling' });
    expect(component.typeOfActivity).toBe('Labeling');
    // expect(handleRadioButtonService.handleChangeActivityType).toHaveBeenCalled();
  });

  fit('groupChangeInteraction', () => {
    // spyOn(handleRadioButtonService, 'handleChangeInteractionType');
    component.groupChangeInteraction({ value: 'one-label-one-dock' });
    expect(component.typeOfInteraction).toBe('one-label-one-dock');
    // expect(handleRadioButtonService.handleChangeInteractionType).toHaveBeenCalled();
  });

  fit('groupChangeOccurance', () => {
    // spyOn(handleRadioButtonService, 'handleChangeOccuranceType');
    component.groupChangeOccurrence({ value: 'display-once' });
    expect(component.typeOfOccurrence).toBe('display-once');
    // expect(handleRadioButtonService.handleChangeOccuranceType).toHaveBeenCalled();
  });
});
