import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderlineComponent } from './leaderline.component';

describe('LeaderlineComponent', () => {
  let component: LeaderlineComponent;
  let fixture: ComponentFixture<LeaderlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaderlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
