import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrainerStats {
  total: number;
  present: number;
  absent: number;
  onLeave: number;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  course: string;
  contactNumber: string;
  currentBatch: string;
  role: string;
  status: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getTrainerStats(): Observable<TrainerStats> {
    return this.http.get<TrainerStats>(`${this.apiUrl}/trainers/stats`);
  }

  getAllTrainers(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.apiUrl}/user/trainers`);
  }

  addTrainer(trainer: Partial<Trainer>): Observable<Trainer> {
    return this.http.post<Trainer>(`${this.apiUrl}/trainers`, trainer);
  }

  updateTrainer(id: number, trainer: Partial<Trainer>): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/trainers/${id}`, trainer);
  }

  deleteTrainer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/trainers/${id}`);
  }

  getTrainerAttendance(email: string, startDate: Date, endDate: Date): Observable<any[]> {
    let params = new HttpParams()
      .set('email', email)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<any[]>(`${this.apiUrl}/attendance/history`, { params });
  }

  exportAttendanceReport(email: string, startDate: Date, endDate: Date): Observable<Blob> {
    let params = new HttpParams()
      .set('email', email)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get(`${this.apiUrl}/attendance/export`, {
      params,
      responseType: 'blob'
    });
  }
}