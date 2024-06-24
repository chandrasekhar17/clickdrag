import { TestBed } from '@angular/core/testing';

import { TranscriptPopupService } from './transcript-popup.service';

describe('TranscriptPopupService', () => {
  let service: TranscriptPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranscriptPopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
