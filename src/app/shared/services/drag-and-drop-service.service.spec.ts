import { TestBed } from '@angular/core/testing';

import { DragAndDropServiceService } from './drag-and-drop-service.service';

describe('DragAndDropServiceService', () => {
  let service: DragAndDropServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragAndDropServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
