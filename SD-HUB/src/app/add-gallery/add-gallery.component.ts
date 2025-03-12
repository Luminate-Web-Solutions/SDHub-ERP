import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';


@Component({
  selector: 'app-add-gallery',
  templateUrl: './add-gallery.component.html',
  styleUrl: './add-gallery.component.css'
})
export class AddGalleryComponent implements OnInit {
  selectedFile: File | null = null;
  selectedCategory: string = '';
  newCategory: string = '';
  categories: string[] = [];
  images: any[] = [];
  editingImageId: number | null = null;
  updatedCategory: string = '';

  constructor(private imageUploadService: ImageUploadService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadImages();
  }

  // ✅ Load categories from database
  loadCategories(): void {
    this.imageUploadService.getCategories().subscribe(
      (categories: string[]) => { 
        this.categories = categories;
      },
      error => {
        console.error('❌ Error fetching categories:', error);
      }
    );
  }

  // ✅ Load images from database
  loadImages(): void {
    this.imageUploadService.getImages().subscribe(
      (images: any[]) => {
        this.images = images;
      },
      error => {
        console.error('❌ Error fetching images:', error);
      }
    );
  }

  // ✅ Handle file selection
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // ✅ Upload image
  uploadImage(): void {
    if (!this.selectedFile || !this.selectedCategory) {
      alert('⚠️ Please select a file and a category');
      return;
    }

    this.imageUploadService.uploadImage(this.selectedFile, this.selectedCategory).subscribe(() => {
      alert('✅ Image uploaded successfully!');
      this.loadImages(); // Refresh images after upload
    });
  }

  // ✅ Add a new category
  addCategory(): void {
    if (!this.newCategory.trim()) {
      alert('⚠️ Please enter a valid category name');
      return;
    }

    this.imageUploadService.addCategory(this.newCategory).subscribe(
      () => {
        this.categories.push(this.newCategory);
        this.newCategory = '';
        alert('✅ Category added successfully!');
      },
      error => {
        console.error('❌ Error adding category:', error);
      }
    );
  }

  // ✅ Edit image category
  editImage(image: any): void {
    this.editingImageId = image.id;
    this.updatedCategory = image.category;
  }

  // ✅ Update image category
  updateImage(): void {
    if (this.editingImageId && this.updatedCategory.trim()) {
      this.imageUploadService.updateImageCategory(this.editingImageId, this.updatedCategory).subscribe(() => {
        alert('✅ Image category updated successfully!');
        this.editingImageId = null;
        this.loadImages(); // Refresh table
      });
    }
  }

  // ✅ Delete an image
  deleteImage(imageId: number): void {
    if (!confirm('Are you sure you want to delete this image?')) return;

    this.imageUploadService.deleteImage(imageId).subscribe(() => {
      alert('🗑️ Image deleted successfully!');
      this.loadImages(); // Refresh table
    });
  }
}