import { Component, OnInit } from '@angular/core';
import { AptitudeService } from '../services/aptitude.service';

interface TestResult {
  email: string;
  fullName: string;
  gender: string;
  courseApplied: string;
  marksScored: string;
  selectedAnswers: string[];
  states: string[];
}

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.css']
})
export class ViewReportComponent implements OnInit {
  results: TestResult[] = [];
  displayedColumns: string[] = ['email', 'fullName', 'gender', 'courseApplied', 'marksScored', 'selectedAnswers', 'states'];

  constructor(private aptitudeService: AptitudeService) {}

  ngOnInit() {
    this.loadResults();
  }

  loadResults() {
    this.aptitudeService.getTestResultsWithAnswers().subscribe({
      next: (data) => {
        this.results = data.map((result: any) => ({
          ...result,
          selectedAnswers: result.selected_answer.split(','),
          states: result.states.split(',')
        }));
      },
      error: (error) => {
        console.error('Error loading results:', error);
      }
    });
  }
}