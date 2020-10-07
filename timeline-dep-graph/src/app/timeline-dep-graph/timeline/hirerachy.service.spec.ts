import { TestBed } from '@angular/core/testing';

import { HirerachyService } from './hirerachy.service';

describe('HirerachyService', () => {
  let service: HirerachyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HirerachyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
