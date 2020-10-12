import { PositionService } from './position.service';
import { TestBed } from '@angular/core/testing';

import { HierarchyService } from './hierarchy.service';

describe('HierarchyService', () => {
  let service: HierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HierarchyService,
        PositionService,
      ]
    });
    service = TestBed.inject(HierarchyService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });
});
