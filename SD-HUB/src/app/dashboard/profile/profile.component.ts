import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from '../../services/profile.service';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profiles: any[] = [];
  isLoading = true;

  constructor(private profileService: ProfileService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.profileService.getProfiles().subscribe({
      next: (data) => {
        console.log('Profiles loaded:', data);
        this.profiles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profiles:', err);
        this.isLoading = false;
      }
    });
  }

  hasProfiles(): boolean {
    return this.profiles && this.profiles.length > 0;
  }

  openEditDialog(profile: any): void {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      width: '400px',
      data: { profile: profile, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveProfile(profile.id, result);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      width: '400px',
      data: { profile: {}, isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createProfile(result);
      }
    });
  }

  saveProfile(id: number, profile: any): void {
    this.profileService.updateProfile(id, profile).subscribe({
      next: (updatedProfile) => {
        console.log('Profile updated:', updatedProfile);
        this.loadProfiles(); // Reload profiles after update
      },
      error: (err) => console.error('Error updating profile:', err)
    });
  }

  createProfile(profile: any): void {
    this.profileService.createProfile(profile).subscribe({
      next: (newProfile) => {
        console.log('Profile created:', newProfile);
        this.loadProfiles(); // Reload profiles after creation
      },
      error: (err) => console.error('Error creating profile:', err)
    });
  }

  deleteProfile(id: number): void {
    this.profileService.deleteProfile(id).subscribe({
      next: () => {
        console.log('Profile deleted');
        this.loadProfiles(); // Reload profiles after deletion
      },
      error: (err) => console.error('Error deleting profile:', err)
    });
  }
}