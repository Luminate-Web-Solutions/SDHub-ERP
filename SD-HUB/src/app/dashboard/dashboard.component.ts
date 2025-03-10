import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../students.service';
import { ChartConfiguration } from 'chart.js';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userlist = 0;
  user = [];
  studentSummary = {
    activestd: 8,
    completedStudents: 20
  };

  teachingStaffSummary = {
    totalStaff: 6,
    activeStaff: 7,
    guestStaff: 5
  };

  nonTeachingStaffSummary = {
    totalStaff: 4,
    activeStaff: 2,
    guestStaff: 1
  };

  instituteSummary = {
    totalCourses: 6,
    ongoingCourses: 6,
    completedCourses: 3
  };

   // Chart Configurations
   studentChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Active', 'Completed', 'Pending'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
    }]
  };

  enrollmentChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Enrollments',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#2e53aa',
      tension: 0.1
    }]
  };

  staffChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Teaching Staff', 'Non-Teaching Staff', 'Guest Faculty'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.getStatus();
    this.get_tStatus();
    this.gettech();
    this.loadUsers();
    this.updateCharts();
  }

  loadUsers(): void {
    this.studentsService.getUsers().subscribe(users => {
      this.user = users;
      this.userlist = users.length;
      this.updateCharts();
    });
  }

  getStatus(): void {
    this.studentsService.getStudentsStatus().subscribe(std_status => {
      const active = std_status.find((each: any) => each._id === 'active');
      const completed = std_status.find((each: any) => each._id === 'completed');
      
      this.studentSummary.activestd = active ? active.count : 0;
      this.studentSummary.completedStudents = completed ? completed.count : 0;
      
      this.updateCharts();
    });
  }

  get_tStatus(): void {
    this.studentsService.get_tStatus().subscribe(t_status => {
      const active = t_status.find((each: any) => each._id === 'active');
      const completed = t_status.find((each: any) => each._id === 'completed');
      
      this.teachingStaffSummary.activeStaff = active ? active.count : 0;
      this.teachingStaffSummary.guestStaff = completed ? completed.count : 0;
      
      this.updateCharts();
    });
  }

  gettech(): void {
    this.studentsService.gettech().subscribe(gettech => {
      this.teachingStaffSummary.totalStaff = gettech.length;
      this.updateCharts();
    });
  }

  private updateCharts(): void {
    // Update Student Distribution Chart
    this.studentChartData.datasets[0].data = [
      this.studentSummary.activestd,
      this.studentSummary.completedStudents,
      this.userlist - (this.studentSummary.activestd + this.studentSummary.completedStudents)
    ];

    // Update Staff Distribution Chart
    this.staffChartData.datasets[0].data = [
      this.teachingStaffSummary.totalStaff,
      this.nonTeachingStaffSummary.totalStaff,
      this.teachingStaffSummary.guestStaff
    ];
  }
}

