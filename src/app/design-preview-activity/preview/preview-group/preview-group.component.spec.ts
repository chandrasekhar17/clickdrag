import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewGroupComponent } from './preview-group.component';

describe('PreviewGroupComponent', () => {
  let component: PreviewGroupComponent;
  let fixture: ComponentFixture<PreviewGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
