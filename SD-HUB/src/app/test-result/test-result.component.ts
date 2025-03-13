import { Component, OnInit } from '@angular/core';
import { AptitudeService } from '../services/aptitude.service';
import { Router } from '@angular/router';

interface TestResult {
  email: string;
  fullName: string;
  gender: string;
  courseApplied: string;
  marksScored: string;
}

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrl: './test-result.component.css'
})
export class TestResultComponent implements OnInit {
  results: TestResult[] = [];
  displayedColumns: string[] = ['email', 'fullName', 'gender', 'courseApplied', 'marksScored', 'pdfName'];

  constructor(private aptitudeService: AptitudeService, private router: Router) {}

  ngOnInit() {
    this.loadResults();
  }

  loadResults() {
    this.aptitudeService.getTestResults().subscribe({
      next: (data) => {
        this.results = data;
      },
      error: (error) => {
        console.error('Error loading results:', error);
      }
    });
  }

  viewPdf(pdfName: string) {
    this.router.navigate(['/evaluated-result', pdfName]);
  }
}
