import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SyllabusEntry {
  id?: number;
  trainer_email: string;
  date: string;
  content: string;
  completion_status: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SyllabusProgress {
  trainer_name: string;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyllabusService {
  private apiUrl = 'http://localhost:3000/syllabus';

  constructor(private http: HttpClient) { }

  addSyllabusEntry(entry: SyllabusEntry): Observable<SyllabusEntry> {
    return this.http.post<SyllabusEntry>(this.apiUrl, entry);
  }

  getSyllabusEntries(email: string, startDate?: Date, endDate?: Date): Observable<SyllabusEntry[]> {
    let params = new HttpParams().set('email', email);
    
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<SyllabusEntry[]>(this.apiUrl, { params });
  }

  updateSyllabusEntry(id: number, entry: Partial<SyllabusEntry>): Observable<SyllabusEntry> {
    return this.http.put<SyllabusEntry>(`${this.apiUrl}/${id}`, entry);
  }

  deleteSyllabusEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getWeeklyCompletion(email: string, weekStart: Date): Observable<number> {
    const params = new HttpParams()
      .set('email', email)
      .set('weekStart', weekStart.toISOString());
    
    return this.http.get<number>(`${this.apiUrl}/completion`, { params });
  }

  getTrainerSyllabusProgress(trainerId: number, selectedDateRange: string): Observable<SyllabusProgress[]> {
    const params = new HttpParams()
      .set('trainerId', trainerId.toString())
      .set('dateRange', selectedDateRange);

    return this.http.get<SyllabusProgress[]>(`${this.apiUrl}/progress`, { params });
  }
}