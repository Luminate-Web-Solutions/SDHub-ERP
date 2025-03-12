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

  // Completion Rates Chart
  completionRatesData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Web Development', 'Data Analytics', 'Digital Marketing', 'Accounting', 'Office Admin', 'System Engineering'],
    datasets: [{
      label: 'Completion Rate (%)',
      data: [85, 78, 92, 88, 95, 82],
      backgroundColor: '#2e53aa',
      borderColor: '#2e53aa',
      borderWidth: 1
    }]
  };

  // Dropout Analysis Chart
  dropoutData: ChartConfiguration<'line'>['data'] = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [{
      label: 'Dropouts',
      data: [2, 1, 4, 3, 6, 2],
      borderColor: '#ff4444',
      backgroundColor: 'rgba(255, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  // Placement Rate Chart
  placementRateData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Placed', 'Not Placed'],
    datasets: [{
      data: [75, 25], // 75% placed, 25% not placed
      backgroundColor: ['#4CAF50', '#ff9800'],
      borderWidth: 0
    }]
  };

  // Average Salary Chart
  averageSalaryData: ChartConfiguration<'bar'>['data'] = {
    labels: [
      'Software Developer',
      'Data Analyst',
      'Digital Marketing',
      'System Admin',
      'Business Analyst',
      'UI/UX Designer'
    ],
    datasets: [{
      label: 'Average Salary (LPA)',
      data: [8.5, 7.2, 6.8, 6.5, 7.8, 7.0],
      backgroundColor: '#2e53aa',
      borderColor: '#2e53aa',
      borderWidth: 1
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

  completionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const total = 100;
            const completed = Math.round((value / 100) * total);
            return `Completion Rate: ${value}% (${completed} students)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion Rate (%)'
        }
      }
    }
  };

  dropoutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Dropouts: ${value} students`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Dropouts'
        }
      }
    }
  };

  placementChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            const count = Math.round((value / 100) * total);
            return `${context.label}: ${percentage}% (${count} students)`;
          }
        }
      }
    }
  };

  salaryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const placedCount = [45, 38, 32, 28, 35, 30][context.dataIndex]; // Sample placed counts
            return [
              `Average Salary: ${value} LPA`,
              `Placed Students: ${placedCount}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Salary (LPA)'
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
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
