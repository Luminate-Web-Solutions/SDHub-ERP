// aptitued-test.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AptitudeService } from '../services/aptitude.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TimerService } from '../services/timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-aptitued-test',
  templateUrl: './aptitued-test.component.html',
  styleUrls: ['./aptitued-test.component.css']
})
export class AptituedTestComponent implements OnInit, OnDestroy {
  personalInfoForm: FormGroup;
  isLinear = true;
  currentStep = 0;
  totalSteps = 3;
  aptitudeQuestions: any = [];
  generalKnowledgeQuestions: any = [];
  criticalThinkingQuestions: any = [];
  answers: { [key: string]: string } = {};
  isLoading = true;
  timeLeft: number = 0;
  private timerSubscription: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private aptitudeService: AptitudeService,
    private timerService: TimerService
  ) {
    this.personalInfoForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      gender: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      courseApplied: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadQuestions();
    this.timerSubscription = this.timerService.timer$.subscribe(time => {
      this.timeLeft = time;
      if (time === 0) {
        this.onSubmit();
      }
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerService.resetTimer();
  }

  loadQuestions() {
    this.isLoading = true;
    this.aptitudeService.getQuestions().subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          const data = response[0];
          this.aptitudeQuestions = data.aptitudeQuestions || [];
          this.generalKnowledgeQuestions = data.generalKnowledgeQuestions || [];
          this.criticalThinkingQuestions = data.criticalThinkingQuestions || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.snackBar.open('Error loading questions. Please try again.', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  onAnswerSelect(questionId: string, answer: string) {
    this.answers[questionId] = answer;
  }

  onSubmit() {
    if (this.currentStep === this.totalSteps - 1) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (this.personalInfoForm.valid) {
            const testData = {
              personalInfo: this.personalInfoForm.value,
              answers: this.answers
            };
            
            this.aptitudeService.submitTest(testData).subscribe({
              next: () => {
                this.snackBar.open('Test submitted successfully!', 'Close', {
                  duration: 3000
                });
                this.router.navigate(['/test-complete']);
              },
              error: (error) => {
                console.error('Error submitting test:', error);
                this.snackBar.open('Error submitting test. Please try again.', 'Close', {
                  duration: 3000
                });
              }
            });
          }
        }
      });
    }
  }

  onNext() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
    } else {
      this.onSubmit();
    }

    this.timerService.startTimer(40 * 60); // 40 minutes in seconds
  }
}
