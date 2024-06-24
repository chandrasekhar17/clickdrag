import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialCharacterComponent } from './special-character.component';

describe('SpecialCharacterComponent', () => {
  let component: SpecialCharacterComponent;
  let fixture: ComponentFixture<SpecialCharacterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialCharacterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
