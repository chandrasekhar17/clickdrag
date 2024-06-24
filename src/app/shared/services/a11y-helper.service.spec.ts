import { TestBed } from '@angular/core/testing';

import { A11yHelperService } from './a11y-helper.service';

describe('A11yHelperService', () => {
  let service: A11yHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(A11yHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
