// time.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    const seconds: number = value % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
}