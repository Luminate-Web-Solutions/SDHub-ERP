import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topic, Member } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:3000'; // Adjust based on your backend URL

  constructor(private http: HttpClient) {}

  // Topics
  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.apiUrl}/session-topics`);
  }

  createTopic(topic: Omit<Topic, 'id'>): Observable<Topic> {
    return this.http.post<Topic>(`${this.apiUrl}/session-topics`, topic);
  }

  updateTopic(id: number, topic: Partial<Topic>): Observable<Topic> {
    return this.http.put<Topic>(`${this.apiUrl}/session-topics/${id}`, topic);
  }

  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/session-topics/${id}`);
  }

  // Members
  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/session-members`);
  }

  createMember(member: Omit<Member, 'id'>): Observable<Member> {
    return this.http.post<Member>(`${this.apiUrl}/session-members`, member);
  }

  updateMember(id: number, member: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/session-members/${id}`, member);
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/session-members/${id}`);
  }
}