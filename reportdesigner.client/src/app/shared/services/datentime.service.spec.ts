import { TestBed } from '@angular/core/testing';

import { DatentimeService } from './datentime.service';

describe('DatentimeService', () => {
  let service: DatentimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatentimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
