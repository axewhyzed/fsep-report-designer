import { TestBed } from '@angular/core/testing';

import { DatabaseInfoService } from './database-info.service';

describe('DatabaseInfoService', () => {
  let service: DatabaseInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
