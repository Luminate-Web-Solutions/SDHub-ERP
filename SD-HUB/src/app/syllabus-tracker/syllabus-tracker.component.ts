import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SyllabusService, SyllabusTopic } from '../syllabus.service';

@Component({
  selector: 'app-syllabus-tracker',
  templateUrl: './syllabus-tracker.component.html',
  styleUrl: './syllabus-tracker.component.css'
})
export class SyllabusTrackerComponent  {
  weeksPerBlock = 4;
  currentBlock = 0;
  isAddingTopic: number | null = null;
  newTopicText = '';
  darkMode = false;

  constructor(public syllabusService: SyllabusService) {}

  get displayedWeeks() {
    const start = this.currentBlock * this.weeksPerBlock;
    return this.syllabusService.allWeeks.slice(start, start + this.weeksPerBlock);
  }

  addTopic(week: number) {
    if (this.newTopicText.trim()) {
      this.syllabusService.addTopic(week, this.newTopicText);
      this.isAddingTopic = null;
      this.newTopicText = '';
    }
  }

  drop(event: CdkDragDrop<SyllabusTopic[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  nextBlock() {
    if ((this.currentBlock + 1) * this.weeksPerBlock >= this.syllabusService.allWeeks.length) {
      this.syllabusService.addNewWeeks(this.weeksPerBlock);
    }
    this.currentBlock++;
  }

  previousBlock() {
    this.currentBlock = Math.max(this.currentBlock - 1, 0);
  }
}