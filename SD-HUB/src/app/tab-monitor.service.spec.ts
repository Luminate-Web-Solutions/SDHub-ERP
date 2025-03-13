import { TestBed } from '@angular/core/testing';

import { TabMonitorService } from './tab-monitor.service';

describe('TabMonitorService', () => {
  let service: TabMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
