import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types';

export const COMPLAINT_CATEGORIES: {
  name: ComplaintCategory;
  description: string;
  iconName: string;
  color: string;
}[] = [
  {
    name: 'Classroom',
    description: 'Benches, smart boards, projectors, lights, fans, ventilation',
    iconName: 'GraduationCap',
    color: 'blue',
  },
  {
    name: 'Laboratory',
    description: 'Equipment, computers, chemicals, safety gear, instrumentation',
    iconName: 'FlaskConical',
    color: 'indigo',
  },
  {
    name: 'Transport',
    description: 'Bus delays, route schedules, passes, vehicle maintenance',
    iconName: 'Bus',
    color: 'emerald',
  },
  {
    name: 'Canteen',
    description: 'Food hygiene, meal pricing, menu, digital payments, seating',
    iconName: 'Utensils',
    color: 'amber',
  },
  {
    name: 'Hostel',
    description: 'Rooms, electricity, geysers, warden support, security',
    iconName: 'Building2',
    color: 'purple',
  },
  {
    name: 'Drinking Water',
    description: 'RO coolers, filter replacement, water pressure, cleanliness',
    iconName: 'Droplet',
    color: 'sky',
  },
  {
    name: 'Restroom',
    description: 'Hygiene, flush valves, soap dispensers, plumbing leaks',
    iconName: 'Sparkles',
    color: 'teal',
  },
  {
    name: 'Fees',
    description: 'Tuition receipts, refund queries, scholarship credits, portal errors',
    iconName: 'CreditCard',
    color: 'cyan',
  },
  {
    name: 'Academics',
    description: 'Course clashes, faculty schedules, syllabus, internal marks',
    iconName: 'BookOpen',
    color: 'violet',
  },
  {
    name: 'Internet/Wi-Fi',
    description: 'Campus Wi-Fi connectivity, speed bottlenecks, LAN ports',
    iconName: 'Wifi',
    color: 'rose',
  },
  {
    name: 'Other',
    description: 'General campus maintenance, library, sports, security',
    iconName: 'HelpCircle',
    color: 'slate',
  },
];

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    stepIndex: number;
    description: string;
  }
> = {
  Submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    stepIndex: 0,
    description: 'Complaint received and queued for initial departmental review.',
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    stepIndex: 1,
    description: 'Grievance desk is evaluating the ticket and assigning responsible personnel.',
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    stepIndex: 2,
    description: 'Maintenance or technical team is actively working on resolving the issue.',
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    stepIndex: 3,
    description: 'Work completed and verified. Ready for student satisfaction feedback.',
  },
};

export const PRIORITY_CONFIG: Record<
  ComplaintPriority,
  { label: string; bg: string; text: string; border: string; badge: string }
> = {
  Low: {
    label: 'Low Priority',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  Medium: {
    label: 'Medium Priority',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  High: {
    label: 'High Priority (Urgent)',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  },
};

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return isoString;
  }
}
