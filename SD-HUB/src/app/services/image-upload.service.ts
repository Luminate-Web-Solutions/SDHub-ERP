import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  uploadImage(file: File, category: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  getImages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/images`);
  }

  addCategory(category: string): Observable<any> { // ✅ Fix: Return Observable
    return this.http.post<any>(`${this.apiUrl}/add-category`, { category });
  }

  getCategories(): Observable<string[]> { // ✅ Fix: Return Observable
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  deleteImage(imageId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-image/${imageId}`);
  }

  updateImageCategory(imageId: number, category: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-image/${imageId}`, { category });
  }
}
