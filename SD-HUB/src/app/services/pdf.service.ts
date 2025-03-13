// pdf.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { AptitudeService } from './aptitude.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(private aptitudeService: AptitudeService) {}

  async generateTestReport(testData: any, questions: any[], pdfFileName: string): Promise<Blob> {
    const doc = new jsPDF();
    let yPosition = 20;

    ['aptitudeQuestions', 'generalKnowledgeQuestions', 'criticalThinkingQuestions'].forEach((section, sIdx) => {
      questions[0][section][0].questions.forEach((q: any, qIdx: number) => {
        const questionId = `${section.split('Questions')[0]}_${qIdx}`;
        const userAnswer = testData.answers[questionId];
        
        // Add question
        doc.setFontSize(12);
        doc.text(`${sIdx + 1}.${qIdx + 1} ${q.question}`, 20, yPosition);
        yPosition += 10;

        // Add options
        q.options.forEach((opt: any) => {
          const isCorrect = opt.value === q.correctAnswer;
          const isSelected = opt.value === userAnswer;
          
          doc.setFillColor(255, 255, 255);
          if (isSelected) {
            doc.setTextColor(isCorrect ? 0 : 255, isCorrect ? 153 : 0, 0);
          } else {
            doc.setTextColor(0, 0, 0);
          }
          
          doc.text(`○ ${opt.text}`, 25, yPosition);
          yPosition += 7;
        });
        
        yPosition += 10;
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });
    });

    return doc.output('blob');
  }
}