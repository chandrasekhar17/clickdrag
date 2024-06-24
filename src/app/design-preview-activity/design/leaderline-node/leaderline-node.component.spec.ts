import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderlineNodeComponent } from './leaderline-node.component';

describe('LeaderlineNodeComponent', () => {
  let component: LeaderlineNodeComponent;
  let fixture: ComponentFixture<LeaderlineNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaderlineNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderlineNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
