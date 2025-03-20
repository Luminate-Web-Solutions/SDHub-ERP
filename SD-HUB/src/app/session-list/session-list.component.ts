import { Component, OnInit } from '@angular/core';
import { SessionService } from '../services/session.service';
import { SessionInstance } from '../models/models';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'topic_name', 'session_date'];
  sessions: SessionInstance[] = [];

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.sessionService.getSessionInstances().subscribe(sessions => this.sessions = sessions);
  }
}