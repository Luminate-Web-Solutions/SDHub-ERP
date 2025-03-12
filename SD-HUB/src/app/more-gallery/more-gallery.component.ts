import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-more-gallery',
  templateUrl: './more-gallery.component.html',
  styleUrl: './more-gallery.component.css'
})
export class MoreGalleryComponent implements OnInit {
  imagesByCategory: { [key: string]: string[] } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/images').subscribe(images => {
      this.imagesByCategory = {};
      images.forEach(img => {
        if (!this.imagesByCategory[img.category]) {
          this.imagesByCategory[img.category] = [];
        }
        this.imagesByCategory[img.category].push(img.image_url);
      });
    });
  }
}