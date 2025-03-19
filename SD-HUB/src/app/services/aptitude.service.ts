import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { TestResult } from '../models/test-result';

interface Question {
  id: number;
  section: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  correct_option: string;
}

// interface TestResult {
//   email: string;
//   fullName: string;
//   gender: string;
//   courseApplied: string;
//   marksScored: string;
// }

@Injectable({
  providedIn: 'root'
})
export class AptitudeService {
  private apiUrl = 'http://localhost:3000';
  private readonly QUESTIONS_PER_SECTION = 40;

  constructor(private http: HttpClient) { }

  getQuestions(): Observable<any> {
    return this.http.get<Question[]>(`${this.apiUrl}/aptitude`).pipe(
      map(questions => {
        const grouped = {
          aptitudeQuestions: [{
            section: 'Aptitude Test',
            questions: questions.filter(q => q.section === 'Aptitude Test').map(q => ({
              question: q.question,
              options: [
                { text: q.option_a, value: q.option_a }, // Updated value to actual string
                { text: q.option_b, value: q.option_b }, // Updated value to actual string
                ...(q.option_c ? [{ text: q.option_c, value: q.option_c }] : []) // Updated value to actual string
              ],
              correctAnswer: q.correct_option // Updated to match actual string value
            }))
          }],
          generalKnowledgeQuestions: [{
            section: 'General Knowledge Test',
            questions: questions.filter(q => q.section === 'General Knowledge Test').map(q => ({
              question: q.question,
              options: [
                { text: q.option_a, value: q.option_a }, // Updated value to actual string
                { text: q.option_b, value: q.option_b }, // Updated value to actual string
                ...(q.option_c ? [{ text: q.option_c, value: q.option_c }] : []) // Updated value to actual string
              ],
              correctAnswer: q.correct_option // Updated to match actual string value
            }))
          }],
          criticalThinkingQuestions: [{
            section: 'Critical Thinking Test',
            questions: questions.filter(q => q.section === 'Critical Thinking Test').map(q => ({
              question: q.question,
              options: [
                { text: q.option_a, value: q.option_a }, // Updated value to actual string
                { text: q.option_b, value: q.option_b }, // Updated value to actual string
                ...(q.option_c ? [{ text: q.option_c, value: q.option_c }] : []) // Updated value to actual string
              ],
              correctAnswer: q.correct_option // Updated to match actual string value
            }))
          }]
        };
        return [grouped];
      })
    );
  }

  private randomizeQuestions(questions: any[]): any[] {
    if (!questions || !questions.length) return questions;

    const shuffled = [...questions];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take only QUESTIONS_PER_SECTION questions
    return shuffled.slice(0, this.QUESTIONS_PER_SECTION);
  }

  calculateScore(answers: { [key: string]: string }, questions: any[]): number {
    let score = 0;
    let totalQuestions = 0;

    // Calculate score for each section
    ['aptitudeQuestions', 'generalKnowledgeQuestions', 'criticalThinkingQuestions'].forEach(section => {
      questions[0][section][0].questions.forEach((q: any, index: number) => {
        const questionId = section.split('Questions')[0] + '_' + index;
        console.log(`Question ID: ${questionId}, User Answer: ${answers[questionId]}, Correct Answer: ${q.correctAnswer}`);
        if (answers[questionId] === q.correctAnswer) {
          score++;
        }
        totalQuestions++;
      });
    });

    console.log(`Total Questions: ${totalQuestions}, Score: ${score}`);
    return score;
  }

  submitTest(testData: any): Observable<any> {
    return this.getQuestions().pipe(
      switchMap(questions => {
        let score = 0;
        let totalQuestions = 0; // Add counter
        const selected_answers: string[] = [];
        const states: string[] = [];
  
        ['aptitudeQuestions', 'generalKnowledgeQuestions', 'criticalThinkingQuestions'].forEach(section => {
          questions[0][section][0].questions.forEach((q: any, index: number) => {
            totalQuestions++; // Increment for each question
            const questionId = section.split('Questions')[0] + '_' + index;
            const selectedAnswer = testData.answers[questionId];
            selected_answers.push(selectedAnswer || '');
            if (selectedAnswer === undefined) {
              states.push('unanswered');
            } else {
              const isCorrect = selectedAnswer === q.correctAnswer;
              states.push(isCorrect ? 'correct' : 'incorrect');
              if (isCorrect) score++;
            }
          });
        });
  
        const selected_answers_json = JSON.stringify(selected_answers);
        const states_json = JSON.stringify(states);
  
        const submission = {
          personalInfo: testData.personalInfo,
          selected_answers: selected_answers_json,
          states: states_json,
          marksScored: `${score}/${totalQuestions}` // Use dynamic total
        };
  
        return this.http.post(`${this.apiUrl}/submit-test`, submission);
      })
    );
  }
  
  calculateStates(answers: { [key: string]: string }, questions: any[]): string[] {
    const states: string[] = [];
    ['aptitudeQuestions', 'generalKnowledgeQuestions', 'criticalThinkingQuestions'].forEach(section => {
      questions[0][section][0].questions.forEach((q: any, index: number) => {
        const questionId = section.split('Questions')[0] + '_' + index;
        states.push(answers[questionId] === q.correctAnswer ? 'yes' : 'no');
      });
    });
    return states;
  }

  getTestResults(): Observable<TestResult[]> {
    return this.http.get<TestResult[]>(`${this.apiUrl}/test-results`);
  }

  getEvaluatedResult(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/evaluated-result/${id}`);
  }
}