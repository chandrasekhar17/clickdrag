import { TestBed } from '@angular/core/testing';

import { DeleteSelectedObjectService } from './delete-selected-object.service';

describe('DeleteSelectedObjectService', () => {
  let service: DeleteSelectedObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteSelectedObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
