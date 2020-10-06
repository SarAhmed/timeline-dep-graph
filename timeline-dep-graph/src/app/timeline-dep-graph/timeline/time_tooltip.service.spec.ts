import { TestBed } from '@angular/core/testing';

import { TimeTooltipService } from './time_tooltip.service';

describe('TimeTooltipService', () => {
  let service: TimeTooltipService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TimeTooltipService,
      ]
    });
    service = TestBed.inject(TimeTooltipService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });
});
