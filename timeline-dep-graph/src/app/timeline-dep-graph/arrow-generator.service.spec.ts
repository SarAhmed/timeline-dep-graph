import { TestBed } from '@angular/core/testing';

import { ArrowGeneratorService } from './arrow-generator.service';

describe('ArrowGeneratorService', () => {
  let service: ArrowGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArrowGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
