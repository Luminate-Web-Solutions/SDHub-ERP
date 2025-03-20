import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session, Attendance, StudentSession } from '../models/session.js';


@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Session management
  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`);
  }

  

  createSession(session: Partial<Session>): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/sessions`, session);
  }

  deleteSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  // Attendance management
  getSessionAttendance(sessionId: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/sessions/${sessionId}/attendance`);
  }

  saveAttendance(sessionId: string, attendance: Partial<Attendance>[]): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(`${this.apiUrl}/sessions/${sessionId}/attendance`, attendance);
  }

  // Student sessions
  getStudentSessions(studentId: number): Observable<StudentSession> {
    return this.http.get<StudentSession>(`${this.apiUrl}/students/${studentId}/sessions`);
  }

  getAllStudentSessions(): Observable<StudentSession[]> {
    return this.http.get<StudentSession[]>(`${this.apiUrl}/students/sessions`);
  }
}