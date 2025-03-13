import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  providedIn: 'root'
})
export class PayrollService{
  private apiUrl = 'http://localhost:3000/payroll'; // Point to your backend API

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
}