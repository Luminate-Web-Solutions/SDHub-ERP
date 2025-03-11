import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface SyllabusTopic {
  id: string;
  title: string;
  week: number;
  completed: boolean;
  dueDate?: Date;
  labels?: string[];
}

interface WeekColumn {
  week: number;
  topics: SyllabusTopic[];
  completionPercentage: number;
}

@Injectable({ providedIn: 'root' })
export class SyllabusService {
  private weeks = new BehaviorSubject<WeekColumn[]>(this.generateWeeks(4));
  weeks$ = this.weeks.asObservable();
  searchQuery = '';

  get allWeeks() { return this.weeks.value; }
  get allTopics() { return this.weeks.value.flatMap(w => w.topics); }

  private generateWeeks(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      week: i + 1,
      topics: [],
      completionPercentage: 0
    }));
  }

  addTopic(week: number, title: string) {
    const newTopic: SyllabusTopic = {
      id: uuidv4(),
      title,
      week,
      completed: false
    };
    const updatedWeeks = this.weeks.value.map(w => 
      w.week === week ? { ...w, topics: [...w.topics, newTopic] } : w
    );
    this.updateWeeks(updatedWeeks);
  }

  deleteTopic(topicId: string) {
    const updatedWeeks = this.weeks.value.map(week => ({
      ...week,
      topics: week.topics.filter(t => t.id !== topicId)
    }));
    this.updateWeeks(updatedWeeks);
  }

  toggleComplete(topicId: string) {
    const updatedWeeks = this.weeks.value.map(week => ({
      ...week,
      topics: week.topics.map(t => 
        t.id === topicId ? { ...t, completed: !t.completed } : t
      )
    }));
    this.updateWeeks(updatedWeeks);
  }

  addNewWeeks(count: number) {
    const currentLength = this.weeks.value.length;
    const newWeeks = this.generateWeeks(count).map((week, index) => ({
      ...week,
      week: currentLength + index + 1
    }));
    this.updateWeeks([...this.weeks.value, ...newWeeks]);
  }

  private updateWeeks(weeks: WeekColumn[]) {
    const withCompletion = weeks.map(week => ({
      ...week,
      completionPercentage: this.calculateWeekCompletion(week.topics)
    }));
    this.weeks.next(withCompletion);
  }

  private calculateWeekCompletion(topics: SyllabusTopic[]): number {
    if (topics.length === 0) return 0;
    const completed = topics.filter(t => t.completed).length;
    return Math.round((completed / topics.length) * 100);
  }
}