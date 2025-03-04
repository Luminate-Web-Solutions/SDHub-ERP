import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NewsItem } from '../../../services/news.service';

@Component({
  selector: 'app-news-dialog',
  templateUrl: './news-dialog.component.html',
  styleUrl: './news-dialog.component.css'
})
export class NewsDialogComponent {
  newsForm: FormGroup;
  dialogTitle: string;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit', news?: NewsItem }
  ) {
    this.dialogTitle = data.mode === 'add' ? 'Add News' : 'Edit News';
    
    this.newsForm = this.fb.group({
      id: [data.news?.id],
      title: [data.news?.title || '', [Validators.required]],
      description: [data.news?.description || '', [Validators.required]],
      date: [data.news?.date || this.getCurrentDate(), [Validators.required]],
      image: [data.news?.image || '']
    });

    if (data.news?.image) {
      this.imagePreview = data.news.image;
    }
  }

  getCurrentDate(): string {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    return `${month} ${today.getDate()}, ${today.getFullYear()}`;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.newsForm.patchValue({ image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.newsForm.valid) {
      this.dialogRef.close(this.newsForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
