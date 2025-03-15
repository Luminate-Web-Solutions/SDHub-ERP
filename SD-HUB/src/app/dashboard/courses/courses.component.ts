import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';

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

  constructor(private courseService: CourseService) { }

  ngOnInit(): void {
    this.loadCourses();
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
    this.newCourse = {};
    this.featuresInput = '';
    this.isEditing = false;
    this.isDialogOpen = true;
  }

  editCourse(index: number) {
    this.newCourse = { ...this.courses[index] };
    this.featuresInput = this.newCourse.features.join(', ');
    this.isEditing = true;
    this.isDialogOpen = true;
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

  saveCourse() {
    this.newCourse.features = this.featuresInput.split(',').map((f: string) => f.trim());
    
    const operation = this.isEditing 
      ? this.courseService.updateCourse(this.newCourse.id, this.newCourse)
      : this.courseService.addCourse(this.newCourse);

    operation.subscribe({
      next: (savedCourse) => {
        this.loadCourses();
        this.closeDialog();
      },
      error: (err) => console.error('Error saving course:', err)
    });
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  updateFeatures() {
    this.newCourse.features = this.featuresInput.split(',').map((f: string) => f.trim());
  }
}