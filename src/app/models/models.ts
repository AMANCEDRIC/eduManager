export type UserRole = 'admin' | 'teacher' | 'parent';
export type PeriodType = 'trimester' | 'semester';

export interface User {
  id: string;
  accountId?: number; // Added for administrative operations
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  token?: string;
}

export interface Establishment {
  id: string;
  name: string;
  periodType: PeriodType;
}

export interface Period {
  id: string;
  establishmentId: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface Class {
  id: string;
  establishmentId: string;
  name: string;
  subject: string;
}

export interface Student {
  id: string;
  classId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
}

export interface Evaluation {
  id: string;
  classId: string;
  periodId: string;
  name: string;
  type: string; // homework, quiz, exam, etc.
  maxGrade: number;
  date: Date;
  coefficient: number;
}

export interface Grade {
  id: string;
  evaluationId: string;
  studentId: string;
  value: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // ISO Date YYYY-MM-DD
  status: AttendanceStatus;
  comment?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
}
