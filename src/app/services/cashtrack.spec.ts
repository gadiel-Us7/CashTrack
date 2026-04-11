import { TestBed } from '@angular/core/testing';

import { Cashtrack } from './cashtrack';

describe('Cashtrack', () => {
  let service: Cashtrack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cashtrack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
