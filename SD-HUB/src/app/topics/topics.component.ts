import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '../services/session.service';
import { Topic } from '../models/models';
import { TopicDialogComponent } from './topic-dialog/topic-dialog.component';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.css']
})
export class TopicsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
  dataSource = new MatTableDataSource<Topic>();

  constructor(private sessionService: SessionService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.sessionService.getTopics().subscribe(topics => {
      this.dataSource.data = topics;
    });
  }

  addTopic(): void {
    const dialogRef = this.dialog.open(TopicDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sessionService.createTopic(result).subscribe(() => {
          this.loadTopics();
        });
      }
    });
  }

  editTopic(topic: Topic): void {
    const dialogRef = this.dialog.open(TopicDialogComponent, {
      width: '400px',
      data: { topic }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sessionService.updateTopic(topic.id, result).subscribe(() => {
          this.loadTopics();
        });
      }
    });
  }

  deleteTopic(id: number): void {
    if (confirm('Are you sure you want to delete this topic?')) {
      this.sessionService.deleteTopic(id).subscribe(() => {
        this.loadTopics();
      });
    }
  }
}