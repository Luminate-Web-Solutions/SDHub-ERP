// timer.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  public timer$ = this.timerSubject.asObservable();
  private interval: any;

  constructor() {}

  startTimer(duration: number) {
    this.timerSubject.next(duration);
    this.interval = setInterval(() => {
      const currentTime = this.timerSubject.getValue();
      if (currentTime > 0) {
        this.timerSubject.next(currentTime - 1);
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  resetTimer() {
    this.timerSubject.next(0);
    this.stopTimer();
  }
}