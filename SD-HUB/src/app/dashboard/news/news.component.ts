import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsItem, NewsService } from '../../services/news.service';
import { NewsDialogComponent } from './news-dialog/news-dialog.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  newsList: NewsItem[] = [];
  displayedColumns: string[] = ['title', 'date', 'description', 'actions'];

  constructor(
    private newsService: NewsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.newsService.getNews().subscribe({
      next: (data) => {
        this.newsList = data;
      },
      error: (error) => {
        console.error('Error fetching news:', error);
        this.snackBar.open('Failed to load news', 'Close', { duration: 3000 });
      }
    });
  }

  openAddNewsDialog(): void {
    const dialogRef = this.dialog.open(NewsDialogComponent, {
      width: '600px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.newsService.addNews(result).subscribe({
          next: () => {
            this.snackBar.open('News added successfully!', 'Close', { duration: 3000 });
            this.loadNews();
          },
          error: (error) => {
            console.error('Error adding news:', error);
            this.snackBar.open('Failed to add news', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditNewsDialog(news: NewsItem): void {
    const dialogRef = this.dialog.open(NewsDialogComponent, {
      width: '600px',
      data: { mode: 'edit', news: news }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.newsService.updateNews(result).subscribe({
          next: () => {
            this.snackBar.open('News updated successfully!', 'Close', { duration: 3000 });
            this.loadNews();
          },
          error: (error) => {
            console.error('Error updating news:', error);
            this.snackBar.open('Failed to update news', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteNews(id: number): void {
    if (confirm('Are you sure you want to delete this news item?')) {
      this.newsService.deleteNews(id).subscribe({
        next: () => {
          this.snackBar.open('News deleted successfully!', 'Close', { duration: 3000 });
          this.loadNews();
        },
        error: (error) => {
          console.error('Error deleting news:', error);
          this.snackBar.open('Failed to delete news', 'Close', { duration: 3000 });
        }
      });
    }
  }
}