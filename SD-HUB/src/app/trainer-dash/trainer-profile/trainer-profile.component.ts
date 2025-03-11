import { Component } from '@angular/core';

@Component({
  selector: 'app-trainer-profile',
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.css'
})
export class TrainerProfileComponent {
  adminProfile = {
    name: 'trainer',
    role: 'trainer',
    email: 'trainer@sdhub.com',
    loginId: 'ADM202305001',
    registered: '2023',
    dateOfBirth: '1990-01-01',
    phoneNumber: '123456789'
  };

}
