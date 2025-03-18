import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api/students';

  constructor(private http: HttpClient) {}

  // Get all students
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Filter students
  filterStudents(filters: any): Observable<any[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params = params.append(key, filters[key]);
    });
    return this.http.get<any[]>(`${this.apiUrl}/filter`, { params });
  }

  // Add a new student
  addStudent(student: any): Observable<any> {
    return this.http.post(this.apiUrl, student);
  }

  // Update a student
  updateStudent(student: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${student.id}`, student);
  }

  // Delete a student
  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}