import { TestBed } from '@angular/core/testing';

import { MagnifyPreviewService } from './magnify-preview.service';

describe('MagnifyPreviewService', () => {
  let service: MagnifyPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MagnifyPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
