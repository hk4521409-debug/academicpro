export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean; // Soft delete flag
  deletedAt?: string;
  deletedBy?: string;
}

export interface Student extends Entity {
  name: string;
  email: string;
  department: string;
  enrollmentYear: number;
  status: 'Active' | 'At-Risk' | 'Graduated' | 'Suspended';
  attendance: number; // Percentage 0-100
  gpa: number; // Scale 1-10
  feesDue: number;
}

export interface Faculty extends Entity {
  name: string;
  email: string;
  department: string;
  title: string;
  workloadHours: number; // Weekly hours
  maxWorkload: number;
  feedbackScore: number; // Scale 1-10
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT' | 'BULK_IMPORT';
  module: 'STUDENT' | 'FACULTY' | 'SYSTEM' | 'FEES';
  details: string;
  ipAddress?: string; // Simulated
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

export interface DashboardMetrics {
  totalStudents: number;
  avgAttendance: number;
  atRiskCount: number;
  revenueOutstanding: number;
  facultyUtilization: number;
}