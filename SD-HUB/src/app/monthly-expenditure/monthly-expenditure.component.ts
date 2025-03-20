import { Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';
import { PayrollDialogComponent } from './payroll-dialog/payroll-dialog.component';
import { ExpenditureService } from '../services/expenditure.service';
import { PayrollService } from '../services/payroll.service';
import { UploadInvoiceDialogComponent } from '../upload-invoice-dialog/upload-invoice-dialog.component';


interface Expenditure {
  id: number;
  date: Date;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  status: string;
}

interface StaffPayroll {
  id: number;
  employeeName: string;
  designation: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: string;
  paymentDate: Date;
}

@Component({
  selector: 'app-monthly-expenditure',
  templateUrl: './monthly-expenditure.component.html',
  styleUrls: ['./monthly-expenditure.component.css']
})
export class MonthlyExpenditureComponent implements OnInit {
  expenditureColumns: string[] = ['date', 'category', 'description', 'amount', 'paymentMode', 'status', 'actions'];
  payrollColumns: string[] = ['employeeName', 'designation', 'basicSalary', 'allowances', 'deductions', 'netSalary', 'paymentStatus', 'paymentDate', 'actions'];
  
  expenditureDataSource: MatTableDataSource<Expenditure>;
  payrollDataSource: MatTableDataSource<StaffPayroll>;

  totalExpenditure: number = 0;
  totalPayroll: number = 0;

  @ViewChild('expenditurePaginator') expenditurePaginator!: MatPaginator;
  @ViewChild('payrollPaginator') payrollPaginator!: MatPaginator;
  @ViewChild('expenditureSort') expenditureSort!: MatSort;
  @ViewChild('payrollSort') payrollSort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private expenditureService: ExpenditureService,
    private payrollService: PayrollService,
    
  ) {
    this.expenditureDataSource = new MatTableDataSource<Expenditure>();
    this.payrollDataSource = new MatTableDataSource<StaffPayroll>();
  }

  ngOnInit() {
    this.loadExpenditureData();
    this.loadPayrollData();
    // this.getExpenditures();
    this.getTotalExpenditure();
    this.getTotalPayroll(); 
  }

  ngAfterViewInit() {
    this.expenditureDataSource.paginator = this.expenditurePaginator;
    this.expenditureDataSource.sort = this.expenditureSort;
    this.payrollDataSource.paginator = this.payrollPaginator;
    this.payrollDataSource.sort = this.payrollSort;
  }

  loadExpenditureData() {
    // TODO: Replace with actual API call
    this.expenditureService.getExpenditures().subscribe({
      next: (data) => {
        this.expenditureDataSource.data = data;
        this.calculateTotalExpenditure();
      },
      error: (error) => {
        console.error('Error fetching expenditures:', error);
        this.snackBar.open('Failed to load expenditures', 'Close', { duration: 3000 });
      },
    });
  }

  loadPayrollData() {
    this.payrollService.getPayroll().subscribe({
      next: (data) => {
        this.payrollDataSource.data = data;
        this.calculateTotalPayroll();
      },
      error: (error) => {
        console.error('Error fetching payroll data:', error);
        this.snackBar.open('Failed to load payroll data', 'Close', { duration: 3000 });
      },
    });
  }

  calculateTotalExpenditure() {
    this.totalExpenditure = this.expenditureDataSource.data.reduce((total, item) => total + item.amount, 0);
  }

  calculateTotalPayroll() {
    this.totalPayroll = this.payrollDataSource.data.reduce((total, item) => total + item.netSalary, 0);
  }

  exportToExcel(type: 'expenditure' | 'payroll') {
    const dataSource = type === 'expenditure' ? this.expenditureDataSource : this.payrollDataSource;
    const fileName = type === 'expenditure' ? 'Expenditure_Report.xlsx' : 'Payroll_Report.xlsx';

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataSource.data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }

  addExpenditure() {
    const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
      width: '500px',
      data: { mode: 'add' },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.expenditureService.addExpenditure(result).subscribe({
          next: (newExpenditure) => {
            const updatedData = [...this.expenditureDataSource.data, newExpenditure];
            this.expenditureDataSource.data = updatedData;
            this.totalExpenditure += newExpenditure.amount; // Update total expenditure
            this.snackBar.open('Expenditure added successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error adding expenditure:', error);
            this.snackBar.open('Failed to add expenditure', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

editExpenditure(expenditure: Expenditure) {
  const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
    width: '500px',
    data: { mode: 'edit', expenditure },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.expenditureService.updateExpenditure(expenditure.id, result).subscribe({
        next: (updatedExpenditure) => {
          const updatedData = this.expenditureDataSource.data.map((item) =>
            item.id === expenditure.id ? updatedExpenditure : item
          );
          this.expenditureDataSource.data = updatedData;
          this.calculateTotalExpenditure();
          this.snackBar.open('Expenditure updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating expenditure:', error);
          this.snackBar.open('Failed to update expenditure', 'Close', { duration: 3000 });
        },
      });
    }
  });
}

deleteExpenditure(expenditure: Expenditure) {
  if (confirm('Are you sure you want to delete this expenditure?')) {
    this.expenditureService.deleteExpenditure(expenditure.id).subscribe({
      next: () => {
        const updatedData = this.expenditureDataSource.data.filter((item) => item.id !== expenditure.id);
        this.expenditureDataSource.data = updatedData;
        this.calculateTotalExpenditure();
        this.snackBar.open('Expenditure deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting expenditure:', error);
        this.snackBar.open('Failed to delete expenditure', 'Close', { duration: 3000 });
      },
    });
  }
}


addPayroll() {
  const dialogRef = this.dialog.open(PayrollDialogComponent, {
    width: '500px',
    data: { mode: 'add' },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      // Calculate netSalary before sending to the service
      result.netSalary = result.basicSalary + result.allowances - result.deductions;
      this.payrollService.addPayroll(result).subscribe({
        next: (newPayroll) => {
          const updatedData = [...this.payrollDataSource.data, newPayroll];
          this.payrollDataSource.data = updatedData;
          this.calculateTotalPayroll();
          this.snackBar.open('Payroll entry added successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error adding payroll entry:', error);
          this.snackBar.open('Failed to add payroll entry', 'Close', { duration: 3000 });
        },
      });
    }
  });
}

editPayroll(payroll: StaffPayroll) {
  const dialogRef = this.dialog.open(PayrollDialogComponent, {
    width: '500px',
    data: { mode: 'edit', payroll },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      // Calculate netSalary before sending to the service
      result.netSalary = result.basicSalary + result.allowances - result.deductions;
      this.payrollService.updatePayroll(payroll.id, result).subscribe({
        next: (updatedPayroll) => {
          const updatedData = this.payrollDataSource.data.map((item) =>
            item.id === payroll.id ? updatedPayroll : item
          );
          this.payrollDataSource.data = updatedData;
          this.calculateTotalPayroll();
          this.snackBar.open('Payroll entry updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating payroll entry:', error);
          this.snackBar.open('Failed to update payroll entry', 'Close', { duration: 3000 });
        },
      });
    }
  });
}

  deletePayroll(payroll: StaffPayroll) {
    if (confirm('Are you sure you want to delete this payroll entry?')) {
      this.payrollService.deletePayroll(payroll.id).subscribe({
        next: () => {
          const updatedData = this.payrollDataSource.data.filter((item) => item.id !== payroll.id);
          this.payrollDataSource.data = updatedData;
          this.calculateTotalPayroll();
          this.snackBar.open('Payroll entry deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting payroll entry:', error);
          this.snackBar.open('Failed to delete payroll entry', 'Close', { duration: 3000 });
        },
      });
    }
  }


  applyExpenditureFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.expenditureDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyPayrollFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.payrollDataSource.filter = filterValue.trim().toLowerCase();
  }

  getTotalExpenditure() {
    this.expenditureService.getTotalExpenditure().subscribe({
      next: (total) => {
        this.totalExpenditure = total;
      },
      error: (error) => {
        console.error('Error fetching total expenditure', error);
      }
    });
  }

  getTotalPayroll() {
    this.payrollService.getTotalPayroll().subscribe({
      next: (total) => {
        this.totalPayroll = total; // Update the total payroll
      },
      error: (error) => {
        console.error('Error fetching total payroll:', error);
      },
    });
  }
}