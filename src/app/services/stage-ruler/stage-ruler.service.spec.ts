import { TestBed } from '@angular/core/testing';

import { StageRulerService } from './stage-ruler.service';

describe('StageRulerService', () => {
  let service: StageRulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StageRulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
