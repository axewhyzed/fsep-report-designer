import { TestBed } from '@angular/core/testing';

import { DbFetchService } from './db-fetch.service';

describe('DbFetchService', () => {
  let service: DbFetchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbFetchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
