import { TestBed } from '@angular/core/testing';

import { ArrowService } from './arrow.service';

describe('ArrowService', () => {
  let service: ArrowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArrowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
