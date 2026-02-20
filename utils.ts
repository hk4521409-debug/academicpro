import { Student, Faculty, AuditRecord, Role } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
};

export const MOCK_DEPARTMENTS = ['Computer Science', 'Electrical Eng.', 'Business', 'Arts', 'Medicine'];

// Mock Data Generators
export const generateStudents = (count: number): Student[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `STU-${1000 + i}`,
    name: `Student ${i + 1}`,
    email: `student${i + 1}@university.edu`,
    department: MOCK_DEPARTMENTS[i % MOCK_DEPARTMENTS.length],
    enrollmentYear: 2020 + (i % 4),
    status: Math.random() > 0.85 ? 'At-Risk' : 'Active',
    attendance: 60 + Math.floor(Math.random() * 40),
    gpa: 4.0 + Math.random() * 6.0, // Scale 4.0 - 10.0
    feesDue: Math.random() > 0.7 ? 1500 : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  }));
};

export const generateFaculty = (count: number): Faculty[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `FAC-${1000 + i}`,
    name: `Professor ${i + 1}`,
    email: `prof${i + 1}@university.edu`,
    department: MOCK_DEPARTMENTS[i % MOCK_DEPARTMENTS.length],
    title: i % 3 === 0 ? 'Professor' : 'Lecturer',
    workloadHours: 10 + Math.floor(Math.random() * 30),
    maxWorkload: 40,
    feedbackScore: 6.0 + Math.random() * 4.0, // Scale 6.0 - 10.0
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  }));
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};