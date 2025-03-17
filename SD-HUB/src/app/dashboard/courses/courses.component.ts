import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { MatDialog } from '@angular/material/dialog';
import { CourseDialogComponent } from './course-dialog/course-dialog.component';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  isDialogOpen = false;
  isEditing = false;
  newCourse: any = {};
  featuresInput: string = '';
  isAdminView = false;
  private routerSub!: Subscription; // Add subscription variable

  constructor(private courseService: CourseService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Added to set admin view on initial load
    this.isAdminView = this.router.url.includes('/admin');  // <<-- new line
    this.loadCourses();
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAdminView = event.url.includes('/admin');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data.map((course: any) => ({
          ...course,
          features: course.features ? JSON.parse(course.features) : []
        }));
      },
      error: (err) => console.error('Error loading courses:', err)
    });
  }

  openAddCourseDialog() {
    const dialogRef = this.dialog.open(CourseDialogComponent, {
      width: '400px',
      data: { isEditing: false, course: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCourse(result);
      }
    });
  }

  editCourse(index: number) {
    const dialogRef = this.dialog.open(CourseDialogComponent, {
      width: '400px',
      data: { isEditing: true, course: this.courses[index] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCourse(result);
      }
    });
  }

  saveCourse(course: any) {
    course.features = this.featuresInput.split(',').map((f: string) => f.trim());
    
    const operation = this.isEditing 
      ? this.courseService.updateCourse(course.id, course)
      : this.courseService.addCourse(course);

    operation.subscribe({
      next: (savedCourse) => {
        this.loadCourses();
        this.closeDialog();
      },
      error: (err) => console.error('Error saving course:', err)
    });
  }

  deleteCourse(index: number) {
    const courseId = this.courses[index].id;
    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        this.courses.splice(index, 1);
      },
      error: (err) => console.error('Error deleting course:', err)
    });
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  updateFeatures() {
    this.newCourse.features = this.featuresInput.split(',').map((f: string) => f.trim());
  }
}