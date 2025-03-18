import { Component, OnInit } from '@angular/core';
import { AptitudeService } from '../services/aptitude.service';
import { Router } from '@angular/router';
import { TestResult } from '../models/test-result';

// interface TestResult {
//   id: number;
//   email: string;
//   fullName: string;
//   gender: string;
//   courseApplied: string;
//   marksScored: string;
// }

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent implements OnInit {
  results: TestResult[] = [];
  displayedColumns: string[] = ['email', 'fullName', 'gender', 'courseApplied', 'marksScored', 'actions'];

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

  viewDetails(id: number) {
    // Open in a new tab
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/evaluated-result', id])
    );
    window.open(url, '_blank');
  }
}