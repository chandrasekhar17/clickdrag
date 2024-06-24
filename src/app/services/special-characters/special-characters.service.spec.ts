import { TestBed } from '@angular/core/testing';

import { SpecialCharactersService } from './special-characters.service';

describe('SpecialCharactersService', () => {
  let service: SpecialCharactersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecialCharactersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
