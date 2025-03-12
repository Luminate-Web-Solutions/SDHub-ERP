import { Component } from '@angular/core';

@Component({
  selector: 'app-stakeholder-profile',
  templateUrl: './stakeholder-profile.component.html',
  styleUrl: './stakeholder-profile.component.css'
})
export class StakeholderProfileComponent {
  adminProfile = {
    name: 'ssgh',
    role: 'StakeHolder',
    email: 'Stakeholder@sdhub.com',
    loginId: 'ADM202305001',
    registered: '2023',
    dateOfBirth: '1990-01-01',
    phoneNumber: '123456789'
  };

}
