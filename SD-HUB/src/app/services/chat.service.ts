import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000'; // Base URL

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat`, { message });
  }
}