import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-evaluated-result',
  template: `
    <div *ngIf="pdfPath">
      <pdf-viewer [src]="pdfPath" [render-text]="true"></pdf-viewer>
    </div>
  `,
  styles: [`
    pdf-viewer {
      width: 100%;
      height: 100vh;
    }
  `]
})
export class EvaluatedResultComponent implements OnInit {
  pdfPath: string | null = null;
  isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      const id = this.route.snapshot.paramMap.get('id');
      this.http.get<{ pdfPath: string }>(`http://localhost:3000/test-results/${id}`).subscribe({
        next: (data) => {
          this.pdfPath = data.pdfPath;
        },
        error: (error) => {
          console.error('Error fetching PDF path:', error);
        }
      });
    }
  }
}