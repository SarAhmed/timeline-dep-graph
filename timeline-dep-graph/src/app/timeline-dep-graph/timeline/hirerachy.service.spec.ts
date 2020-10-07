import { TestBed } from '@angular/core/testing';

import { HirerachyService } from './hirerachy.service';

describe('HirerachyService', () => {
  let service: HirerachyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HirerachyService,
      ]
    });
    service = TestBed.inject(HirerachyService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });
});
