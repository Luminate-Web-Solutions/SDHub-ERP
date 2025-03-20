import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SessionService } from '../services/session.service';
import { Topic, Member, AttendanceRecord } from '../models/models';

@Component({
  selector: 'app-take-session',
  templateUrl: './take-session.component.html',
  styleUrls: ['./take-session.component.css']
})
export class TakeSessionComponent implements OnInit {
  topics: Topic[] = [];
  members: Member[] = [];
  sessionForm: FormGroup;

  constructor(private fb: FormBuilder, private sessionService: SessionService) {
    this.sessionForm = this.fb.group({
      topicId: ['', Validators.required],
      attendance: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.sessionService.getTopics().subscribe(topics => this.topics = topics);
  }

  onTopicChange(topicId: number): void {
    this.sessionService.getMembersByTopic(topicId).subscribe(members => {
      this.members = members;
      const attendanceArray = this.sessionForm.get('attendance') as FormArray;
      attendanceArray.clear();
      members.forEach(member => {
        attendanceArray.push(this.fb.group({
          memberId: [member.id],
          status: ['present', Validators.required]
        }));
      });
    });
  }

  onSubmit(): void {
    if (this.sessionForm.valid) {
      const { topicId, attendance } = this.sessionForm.value;
      this.sessionService.createSessionWithAttendance(topicId, attendance).subscribe(() => {
        // Handle success (e.g., show snackbar, reset form)
      });
    }
  }
}