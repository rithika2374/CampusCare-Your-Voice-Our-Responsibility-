export type Role = 'student' | 'admin';

export type ComplaintCategory =
  | 'Classroom'
  | 'Laboratory'
  | 'Transport'
  | 'Canteen'
  | 'Hostel'
  | 'Drinking Water'
  | 'Restroom'
  | 'Fees'
  | 'Academics'
  | 'Internet/Wi-Fi'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High';

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string; // Roll number or student registration ID
  department?: string; // e.g. "Computer Science & Engineering"
  year?: string; // e.g. "3rd Year"
  phone?: string;
  avatarUrl?: string;
}

export interface ComplaintTimelineEvent {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  title: string;
  description: string;
  updatedBy: string; // e.g. "System", "Admin: Facilities Desk"
}

export interface ComplaintFeedback {
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface Complaint {
  id: string; // Unique ID, e.g. "CC-2025-1042"
  title: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment?: string;
  studentRollNo?: string;
  adminResponse?: string;
  assignedDepartment?: string;
  resolvedAt?: string;
  timeline: ComplaintTimelineEvent[];
  feedback?: ComplaintFeedback;
}

export interface StatsSummary {
  total: number;
  submitted: number;
  underReview: number;
  inProgress: number;
  resolved: number;
  highPriorityPending: number;
  categoryCounts: Record<ComplaintCategory, number>;
  statusCounts: Record<ComplaintStatus, number>;
  priorityCounts: Record<ComplaintPriority, number>;
  recentHotspots: { location: string; count: number; category: string }[];
  resolutionRate: number; // Percentage
  avgResolutionDays: number;
}
