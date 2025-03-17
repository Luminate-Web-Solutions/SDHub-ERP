import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AptitudeService } from '../services/aptitude.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-evaluated-result',
  templateUrl: './evaluated-result.component.html',
  styleUrls: ['./evaluated-result.component.css']
})
export class EvaluatedResultComponent implements OnInit {
  personalInfo: any;
  detailedResults: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private aptitudeService: AptitudeService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      forkJoin({
        result: this.aptitudeService.getEvaluatedResult(+id),
        questions: this.aptitudeService.getQuestions()
      }).subscribe({
        next: ({ result, questions }) => {
          this.processData(result, questions);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
    }
  }

  processData(result: any, questions: any) {
    this.personalInfo = {
      email: result.email,
      fullName: result.fullName,
      gender: result.gender,
      courseApplied: result.courseApplied,
      marksScored: result.marksScored
    };

    const selectedAnswers = result.selected_answers.split(',');
    const states = result.states.split(',');
    const allQuestions = [
      ...questions[0].aptitudeQuestions[0].questions,
      ...questions[0].generalKnowledgeQuestions[0].questions,
      ...questions[0].criticalThinkingQuestions[0].questions
    ];

    this.detailedResults = allQuestions.map((q, index) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: selectedAnswers[index],
      state: states[index]
    }));
  }

  print() {
    window.print();
  }
}