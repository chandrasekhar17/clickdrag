import { TestBed } from '@angular/core/testing';

import { ReorderLabelsService } from './reorder-labels.service';

describe('ReorderLabelsService', () => {
  let service: ReorderLabelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReorderLabelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
