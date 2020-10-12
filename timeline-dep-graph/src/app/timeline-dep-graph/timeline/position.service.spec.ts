import { TestBed } from '@angular/core/testing';

import { PositionService } from './position.service';

describe('PositionService', () => {
  let service: PositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PositionService,
      ]
    });
    service = TestBed.inject(PositionService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });
});
