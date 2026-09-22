import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should toggle the loading flag', () => {
    expect(service.isLoading()).toBe(false);
    service.setLoading(true);
    expect(service.isLoading()).toBe(true);
  });
});
