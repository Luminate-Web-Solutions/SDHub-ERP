export interface Topic {
    id: number;
    name: string;
    description?: string;
  }
  
  export interface Member {
    id: number;
    name: string;
    email: string;
    topic_id: number;
  }
  
  export interface SessionInstance {
    id: number;
    topic_id: number;
    topic_name?: string;
    session_date: string;
  }
  
  export interface AttendanceRecord {
    member_id: number;
    status: 'present' | 'absent';
  }
  
  export interface ExtendedAttendanceRecord {
    session_id: number;
    topic_id: number;
    topic_name?: string;
    session_date: string;
    status: 'present' | 'absent';
  }