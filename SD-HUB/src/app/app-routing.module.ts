import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { RegistrationComponent } from './registration/registration.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { StudentsComponent } from './dashboard/students/students.component';
import { TrainersComponent } from './dashboard/trainers/trainers.component';
import { DeansComponent } from './dashboard/deans/deans.component';
import { CoursesComponent } from './dashboard/courses/courses.component';
import { SyllabusComponent } from './dashboard/syllabus/syllabus.component';
import { StaffComponent } from './staff/staff.component';
import { AuthGuard } from './auth.guard';
import { NewsComponent } from './dashboard/news/news.component';
import { HomeComponent } from './home/home.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { AptituedTestComponent } from './aptitued-test/aptitued-test.component';
import { StdDashboardComponent } from './std-dashboard/std-dashboard.component';
import { MainCourseComponent } from './main-course/main-course.component';
import { ContactComponent } from './contact/contact.component';
import { TestResultComponent } from './test-result/test-result.component';
import { MoreGalleryComponent } from './more-gallery/more-gallery.component';
import { KanbanBoardComponent } from './staff/kanban-board/kanban-board.component';
import { LoginComponent } from './login/login.component';
import { TrainerDashComponent } from './trainer-dash/trainer-dash.component';
import { TrainerProfileComponent } from './trainer-dash/trainer-profile/trainer-profile.component';
import { AddGalleryComponent } from './add-gallery/add-gallery.component';
import { ExpenditureComponent } from './dashboard/expenditure/expenditure.component';
import { StakeholderDashComponent } from './stakeholder-dash/stakeholder-dash.component';
import { StakeholderProfileComponent } from './stakeholder-dash/stakeholder-profile/stakeholder-profile.component';
import { AttendanceComponent } from './trainer-dash/attendance/attendance.component';
import { WeeklySyllabusComponent } from './trainer-dash/weekly-syllabus/weekly-syllabus.component';
import { TrainerManagementComponent } from './dashboard/trainers/trainer-management/trainer-management.component';
import { MonthlyExpenditureComponent } from './monthly-expenditure/monthly-expenditure.component';
import { ExamSubmittedComponent } from './exam-submitted/exam-submitted.component';
import { JobSectionComponent } from './dashboard/job-section/job-section.component';
import { AdminStaffStdComponent } from './admin-staff-std/admin-staff-std.component';
import { EvaluatedResultComponent } from './evaluated-result/evaluated-result.component';

import { SessionAttendanceComponent } from './session-attendance/session-attendance.component';



const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'signin', component: SigninComponent },
  { path: 'home', component: HomeComponent },
  { path: 'aboutus', component: AboutusComponent },
  // { path: 'staff', component: StaffComponent},
  { path: 'main-course', component: MainCourseComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'more-gallery', component: MoreGalleryComponent },
  { path: 'KanbanBoard', component: KanbanBoardComponent },
  { path: 'addphoto', component: AddGalleryComponent },
  { path: 'job-section', component: JobSectionComponent },

  { path: 'expenditure', component: ExpenditureComponent },
  { path: 'test-result', component: TestResultComponent },
  // { path: 'man', component: TrainerManagementComponent },
  // {path: 'dashboard', component:DashboardComponent},
  // { path: 'profile', component: ProfileComponent },
  { path: 'evaluated-result/:id', component: EvaluatedResultComponent },

  { path: 'portal', component: LoginComponent },
  {
    path: 'admin',
    component: AdminComponent,
    // canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'trainers', component: TrainersComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'syllabus', component: SyllabusComponent },
      { path: 'news', component: NewsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'expenditure', component: MonthlyExpenditureComponent },
    ]
  },


  {
    path: '',
    component: StdDashboardComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: 'aptitude', component: AptituedTestComponent },
      { path: 'exam-submitted', component: ExamSubmittedComponent },
      { path: 'registration', component: RegistrationComponent },
    ]
  },


  {
    path: 'trainer',
    component: TrainerDashComponent,
    // canActivate: [adminGuard],
    // canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'attendance', pathMatch: 'full' },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'syllabus', component: WeeklySyllabusComponent },
      { path: 'profile', component: TrainerProfileComponent }
    ]
  },

  {
    path: 'stakeholder',
    component: StakeholderDashComponent,
    // canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: StakeholderProfileComponent }
    ]
  },

  {
    path: 'admin-staff',
    component: AdminStaffStdComponent,
    // canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'gallery', pathMatch: 'full' },
      { path: 'gallery', component: AddGalleryComponent },
      { path: 'profile', component: StakeholderProfileComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled', // Enables fragment scrolling
    scrollPositionRestoration: 'enabled', // Restores scroll position when navigating back
  }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
