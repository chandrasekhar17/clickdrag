import { TestBed } from '@angular/core/testing';

import { V2StateService } from './v2-state.service';

describe('V2StateService', () => {
  let service: V2StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(V2StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
