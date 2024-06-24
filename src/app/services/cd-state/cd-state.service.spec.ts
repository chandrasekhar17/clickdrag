import { TestBed } from '@angular/core/testing';

import { CdStateService } from './cd-state.service';

describe('CdStateService', () => {
  let service: CdStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
