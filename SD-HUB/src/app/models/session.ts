export interface Session {
    id: string;
    courseName: string;
    date: Date;
    createdAt: Date;
}

export interface Attendance {
    id: string;
    sessionId: string;
    studentId: number;
    status: 'present' | 'absent';
    remark?: string;
    createdAt: Date;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    course: string;
    contactNumber: string;
}

export interface StudentSession {
    student: Student;
    attendance: Attendance[];
    totalAttendance: number;
}