import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptPopupComponent } from './transcript-popup.component';

describe('TranscriptPopupComponent', () => {
  let component: TranscriptPopupComponent;
  let fixture: ComponentFixture<TranscriptPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranscriptPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranscriptPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
