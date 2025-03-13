// src/app/tab-monitor.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AptitudeService } from './services/aptitude.service';

@Injectable({
  providedIn: 'root'
})
export class TabMonitorService implements OnDestroy {
  private readonly TAB_COUNT_KEY = 'aptitudeTabCount';
  private readonly SESSION_KEY = 'isTabCounted';

  constructor(
    private aptitudeService: AptitudeService,
    private router: Router
  ) { }

  initializeTabMonitoring(): void {
    if (!sessionStorage.getItem(this.SESSION_KEY)) {
      this.incrementTabCount();
      sessionStorage.setItem(this.SESSION_KEY, 'true');
    }

    window.addEventListener('beforeunload', this.decrementTabCount);
    window.addEventListener('storage', this.handleStorageEvent);
    
    this.checkTabCount();
  }

  private incrementTabCount(): void {
    const currentCount = parseInt(localStorage.getItem(this.TAB_COUNT_KEY) || '0', 10);
    localStorage.setItem(this.TAB_COUNT_KEY, (currentCount + 1).toString());
  }

  private decrementTabCount = (): void => {
    const currentCount = parseInt(localStorage.getItem(this.TAB_COUNT_KEY) || '0', 10);
    if (currentCount > 0) {
      localStorage.setItem(this.TAB_COUNT_KEY, (currentCount - 1).toString());
    }
  }

  private handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === this.TAB_COUNT_KEY) {
      this.checkTabCount();
    }
  }

  private checkTabCount(): void {
    const currentCount = parseInt(localStorage.getItem(this.TAB_COUNT_KEY) || '0', 10);
    if (currentCount > 2) {
      this.forceSubmitTest();
    }
  }

  private forceSubmitTest(): void {
    const testData = {
      personalInfo: {}, // Add appropriate personal info here
      answers: [] // Add appropriate answers here
    };
    this.aptitudeService.submitTest(testData).subscribe(() => {
      localStorage.removeItem(this.TAB_COUNT_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);
      this.router.navigate(['/test-submitted']);
      window.close();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.decrementTabCount);
    window.removeEventListener('storage', this.handleStorageEvent);
    this.decrementTabCount();
    sessionStorage.removeItem(this.SESSION_KEY);
  }
}
