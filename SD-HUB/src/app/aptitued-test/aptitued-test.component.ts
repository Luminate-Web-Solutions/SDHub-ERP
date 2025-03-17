import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AptitudeService } from '../services/aptitude.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TimerService } from '../services/timer.service';
import { Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-aptitued-test',
  templateUrl: './aptitued-test.component.html',
  styleUrls: ['./aptitued-test.component.css']
})
export class AptituedTestComponent implements OnInit, OnDestroy {
  personalInfoForm: FormGroup;
  isLinear = true;
  currentStep = 0;
  totalSteps = 4;
  aptitudeQuestions: any = [];
  generalKnowledgeQuestions: any = [];
  criticalThinkingQuestions: any = [];
  answers: { [key: string]: string } = {};
  isLoading = true;
  timeLeft: number = 0;
  private tabSwitchCount: number = 0;
  private maxTabSwitches: number = 2;
  private visibilityChangeHandler!: () => void;
  private timerSubscription: Subscription = new Subscription();
  isTestActive = false;
  testStarted = false;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private aptitudeService: AptitudeService,
    private timerService: TimerService,
    @Inject(PLATFORM_ID) private platformId: any
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
      if (time === 0 && this.isTestActive) {
        this.handleAutoSubmit();
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.visibilityChangeHandler = () => this.handleTabSwitch();
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
    this.timerService.resetTimer();
    this.isTestActive = false;

    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  loadQuestions() {
    this.isLoading = true;
    this.aptitudeService.getQuestions().subscribe({
      next: (response) => {
        if (response?.length > 0) {
          const data = response[0];
          this.aptitudeQuestions = data.aptitudeQuestions || [];
          this.generalKnowledgeQuestions = data.generalKnowledgeQuestions || [];
          this.criticalThinkingQuestions = data.criticalThinkingQuestions || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.snackBar.open('Error loading questions. Please try again.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onAnswerSelect(questionId: string, answer: string) {
    this.answers[questionId] = answer;
  }

  onSubmit() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitTestData().subscribe(() => {
          this.router.navigate(['/test-complete']);
        });
      }
    });
  }

  private submitTestData() {
    if (this.personalInfoForm.valid) {
      const testData = {
        personalInfo: this.personalInfoForm.value,
        answers: this.answers
      };

      return this.aptitudeService.submitTest(testData).pipe(
        tap(() => {
          this.snackBar.open('Test submitted successfully!', 'Close', { duration: 3000 });
        }),
        catchError(error => {
          console.error('Error submitting test:', error);
          this.snackBar.open('Error submitting test. Please try again.', 'Close', { duration: 3000 });
          return of(null);
        })
      );
    }
    return of(null);
  }

  private handleAutoSubmit() {
    this.isTestActive = false;
    this.submitTestData().subscribe(() => {
      this.router.navigate(['/exam-submitted']);
    });
  }

  handleTabSwitch(): void {
    if (this.isTestActive && document.visibilityState === 'hidden') {
      this.tabSwitchCount++;
      
      this.snackBar.open(
        `Warning: Tab switch detected (${this.tabSwitchCount}/${this.maxTabSwitches}).`,
        'Close',
        { duration: 5000, panelClass: ['warning-snackbar'] }
      );

      if (this.tabSwitchCount > this.maxTabSwitches) {
        this.autoSubmitTest();
      }
    }
  }

  autoSubmitTest(): void {
    this.snackBar.open('Test auto-submitted due to rule violations!', 'Close', { duration: 3000 });
    this.submitTestData().subscribe(() => {
      this.router.navigate(['/exam-submitted']);
    });
  }

  onNext() {
    if (this.currentStep === 0 && this.personalInfoForm.invalid) {
      this.personalInfoForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
    }

    if (this.currentStep === 1 && !this.isTestActive) {
      this.startTest();
    }
  }

  startTest() {
    if (this.personalInfoForm.invalid) return;
    
    this.isTestActive = true;
    this.testStarted = true;
    this.tabSwitchCount = 0;
    this.timerService.startTimer(40 * 60);
    this.snackBar.open('Test started! Browser monitoring activated.', 'Close', { duration: 5000 });
  }
}