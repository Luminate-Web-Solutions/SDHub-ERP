import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import the map operator

export interface Expenditure {
  id: number;
  date: Date;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenditureService {
  private apiUrl = 'http://localhost:3000/expenditures'; // Point to your backend API

  constructor(private http: HttpClient) {}

  // Get all expenditures
  getExpenditures(): Observable<Expenditure[]> {
    return this.http.get<Expenditure[]>(this.apiUrl);
  }

  // Add a new expenditure
  addExpenditure(expenditure: Omit<Expenditure, 'id'>): Observable<Expenditure> {
    return this.http.post<Expenditure>(this.apiUrl, expenditure);
  }

  // Update an expenditure
  updateExpenditure(id: number, expenditure: Partial<Expenditure>): Observable<Expenditure> {
    return this.http.put<Expenditure>(`${this.apiUrl}/${id}`, expenditure);
  }

  // Delete an expenditure
  deleteExpenditure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Upload invoice
  uploadInvoice(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-invoice`, formData);
  }

  // Get total expenditure
  getTotalExpenditure(): Observable<number> {
    return this.http.get<{ total: number }>('http://localhost:3000/total-expenditure').pipe(
      map(response => response.total) // Use the map operator and explicitly type the response
    );
  }
}