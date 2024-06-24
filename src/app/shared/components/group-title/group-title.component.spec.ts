import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTitleComponent } from './group-title.component';

describe('GroupTitleComponent', () => {
  let component: GroupTitleComponent;
  let fixture: ComponentFixture<GroupTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
