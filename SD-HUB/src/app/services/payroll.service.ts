import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import the map operator

export interface StaffPayroll {
  id: number;
  employeeName: string;
  designation: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: string;
  paymentDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private apiUrl = 'http://localhost:3000/payroll'; // Backend API URL

  constructor(private http: HttpClient) {}

  // Get all payroll entries
  getPayroll(): Observable<StaffPayroll[]> {
    return this.http.get<StaffPayroll[]>(this.apiUrl);
  }

  // Add a new payroll entry
  addPayroll(payroll: Omit<StaffPayroll, 'id'>): Observable<StaffPayroll> {
    return this.http.post<StaffPayroll>(this.apiUrl, payroll);
  }

  // Update a payroll entry
  updatePayroll(id: number, payroll: Partial<StaffPayroll>): Observable<StaffPayroll> {
    return this.http.put<StaffPayroll>(`${this.apiUrl}/${id}`, payroll);
  }

  // Delete a payroll entry
  deletePayroll(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Fetch total payroll from the backend
  getTotalPayroll(): Observable<number> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/total`).pipe(
      map(response => response.total) // Extract the total from the response
    );
  }
}