import { TestBed } from '@angular/core/testing';

import { CellFormattingService } from './cell-formatting.service';

describe('CellFormattingService', () => {
  let service: CellFormattingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CellFormattingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
