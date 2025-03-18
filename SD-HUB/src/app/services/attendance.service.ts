import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendanceRecord {
  id: number;
  trainer_id: number;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  hours_worked: number | null;
  leave_type?: string;
  leave_reason?: string;
}

export interface LeaveRequest {
  email: string;
  type: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  requestLeave(email: string, type: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/leave`, { email, type, reason });
  }

  checkIn(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/check-in`, { email });
  }

  checkOut(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/check-out`, { email });
  }

  getTodayAttendance(email: string): Observable<AttendanceRecord> {
    return this.http.get<AttendanceRecord>(`${this.apiUrl}/attendance/today/${email}`);
  }

  getAttendanceHistory(email: string, startDate?: Date | null, endDate?: Date | null): Observable<AttendanceRecord[]> {
    let params = new HttpParams().set('email', email);
    
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/attendance/history`, { params });
  }
}