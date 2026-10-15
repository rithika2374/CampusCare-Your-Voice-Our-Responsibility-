import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  StatsSummary,
} from '../src/types';

interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  complaints: Complaint[];
  system: {
    initializedAt: string;
    version: string;
    storageType: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'campuscare_store.json');

// Helper for hashing password with salt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.scryptSync(password, salt, 64).toString('hex');
  return calculated === hash;
}

// Generate unique Complaint ID like "CC-2025-7832"
export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CC-${year}-${randomSuffix}`;
}

// Initialize seed data
function getInitialSeedData(): DatabaseSchema {
  const adminPass = hashPassword('Admin@123');
  const student1Pass = hashPassword('Student@123');
  const student2Pass = hashPassword('Student@123');
  const student3Pass = hashPassword('Student@123');

  const now = new Date();
  const daysAgo = (days: number, hours = 0) => {
    const d = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000));
    return d.toISOString();
  };

  const users: (User & { passwordHash: string; salt: string })[] = [
    {
      id: 'usr-admin-1',
      name: 'Dr. Arvind Rao',
      email: 'admin@campuscare.edu',
      role: 'admin',
      department: 'Dean of Student Affairs',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
    },
    {
      id: 'usr-student-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@campus.edu',
      role: 'student',
      studentId: '2023CS104',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      phone: '+91 98111 22334',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      passwordHash: student1Pass.hash,
      salt: student1Pass.salt,
    },
    {
      id: 'usr-student-2',
      name: 'Ananya Patel',
      email: 'ananya.patel@campus.edu',
      role: 'student',
      studentId: '2024EC210',
      department: 'Electronics & Communication',
      year: '2nd Year',
      phone: '+91 98222 33445',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      passwordHash: student2Pass.hash,
      salt: student2Pass.salt,
    },
    {
      id: 'usr-student-3',
      name: 'Vikram Singh',
      email: 'vikram.singh@campus.edu',
      role: 'student',
      studentId: '2022ME085',
      department: 'Mechanical Engineering',
      year: '4th Year',
      phone: '+91 98333 44556',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      passwordHash: student3Pass.hash,
      salt: student3Pass.salt,
    },
  ];

  const complaints: Complaint[] = [
    {
      id: 'CC-2025-1001',
      title: 'High-speed Wi-Fi dropping frequently in Central Library 2nd floor reading hall',
      category: 'Internet/Wi-Fi',
      description: 'The Wi-Fi network (Campus_Student_5G) keeps disconnecting every 5-10 minutes. More than 40 students studying for upcoming midterm exams in the 2nd floor quiet hall are unable to access IEEE papers and online lecture videos.',
      location: 'Central Library, 2nd Floor Reading Hall',
      priority: 'High',
      status: 'In Progress',
      createdAt: daysAgo(3, 4),
      updatedAt: daysAgo(1, 2),
      studentId: 'usr-student-1',
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul.sharma@campus.edu',
      studentDepartment: 'Computer Science & Engineering',
      studentRollNo: '2023CS104',
      adminResponse: 'Campus Network & IT cell dispatched senior technician. The primary access point (AP-204) had an overheating switch port. Replacement Gigabit AP is being wired today.',
      assignedDepartment: 'IT & Network Infrastructure',
      timeline: [
        {
          id: 'tl-1001-1',
          status: 'Submitted',
          timestamp: daysAgo(3, 4),
          title: 'Complaint Registered',
          description: 'Complaint submitted by Rahul Sharma via Student Portal.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1001-2',
          status: 'Under Review',
          timestamp: daysAgo(2, 6),
          title: 'Assigned to IT Infrastructure',
          description: 'Grievance cell reviewed urgency and assigned ticket to Campus Network Admin.',
          updatedBy: 'Admin: Grievance Desk',
        },
        {
          id: 'tl-1001-3',
          status: 'In Progress',
          timestamp: daysAgo(1, 2),
          title: 'Field Inspection in Progress',
          description: 'Technician on-site at Library 2nd floor. Replacement unit approved.',
          updatedBy: 'Admin: IT Cell',
        },
      ],
    },
    {
      id: 'CC-2025-1002',
      title: 'Digital projector lamp flickering and audio crackling in Seminar Hall 1',
      category: 'Classroom',
      description: 'The overhead HDMI projector lamp cuts to black periodically for 5 seconds during lectures. Also the left ceiling speaker produces loud static humming during faculty presentations.',
      location: 'Main Academic Block, Seminar Hall 1 (Ground Floor)',
      priority: 'Medium',
      status: 'Resolved',
      createdAt: daysAgo(6, 8),
      updatedAt: daysAgo(2, 1),
      resolvedAt: daysAgo(2, 1),
      studentId: 'usr-student-1',
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul.sharma@campus.edu',
      studentDepartment: 'Computer Science & Engineering',
      studentRollNo: '2023CS104',
      adminResponse: 'AV Maintenance team replaced the 4K projector lamp module with an OEM spare and re-grounded the PA audio amplifier cable. Successfully tested.',
      assignedDepartment: 'Audio-Visual & Facilities',
      timeline: [
        {
          id: 'tl-1002-1',
          status: 'Submitted',
          timestamp: daysAgo(6, 8),
          title: 'Complaint Logged',
          description: 'Complaint filed regarding Seminar Hall 1 equipment.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1002-2',
          status: 'Under Review',
          timestamp: daysAgo(5, 3),
          title: 'Reviewed by Estate Officer',
          description: 'AV team contacted for spare replacement.',
          updatedBy: 'Admin: Estate Office',
        },
        {
          id: 'tl-1002-3',
          status: 'In Progress',
          timestamp: daysAgo(3, 5),
          title: 'Work Order Dispatched',
          description: 'Technician assigned for evening maintenance window.',
          updatedBy: 'Admin: Facilities Desk',
        },
        {
          id: 'tl-1002-4',
          status: 'Resolved',
          timestamp: daysAgo(2, 1),
          title: 'Issue Resolved & Tested',
          description: 'Lamp replaced and acoustic interference resolved.',
          updatedBy: 'Admin: AV Engineer',
        },
      ],
      feedback: {
        rating: 5,
        comment: 'Fixed right in time for our guest lecture! Excellent response and clear audio now.',
        submittedAt: daysAgo(1, 20),
      },
    },
    {
      id: 'CC-2025-1003',
      title: 'Water cooler purification filter replacement needed on 3rd floor',
      category: 'Drinking Water',
      description: 'The RO UV filter on the water dispensing station shows a red warning indicator light, and water tastes metallic. Students on the entire 3rd floor are relying on this cooler.',
      location: 'Aryabhatta Block, 3rd Floor East Wing',
      priority: 'High',
      status: 'Under Review',
      createdAt: daysAgo(1, 5),
      updatedAt: daysAgo(1, 1),
      studentId: 'usr-student-2',
      studentName: 'Ananya Patel',
      studentEmail: 'ananya.patel@campus.edu',
      studentDepartment: 'Electronics & Communication',
      studentRollNo: '2024EC210',
      adminResponse: 'Sanitation officer has tagged the machine and notified the authorized annual maintenance vendor for immediate filter cartridge swap.',
      assignedDepartment: 'Public Health & Sanitation',
      timeline: [
        {
          id: 'tl-1003-1',
          status: 'Submitted',
          timestamp: daysAgo(1, 5),
          title: 'Issue Submitted',
          description: 'Drinking water filter warning reported.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1003-2',
          status: 'Under Review',
          timestamp: daysAgo(1, 1),
          title: 'Vendor Notification Issued',
          description: 'Water quality team dispatched warning label and contacted service vendor.',
          updatedBy: 'Admin: Sanitation Dept',
        },
      ],
    },
    {
      id: 'CC-2025-1004',
      title: 'Broken glassware and uncalibrated digital scale in Chemistry Lab 2',
      category: 'Laboratory',
      description: 'Precision balance table 4 is drifting by +/- 0.4g which causes errors in titration experiments. Additionally, broken beaker shards near sink 2 pose a minor safety hazard.',
      location: 'Science Complex, Lab 204 (Chemistry Lab 2)',
      priority: 'Medium',
      status: 'Submitted',
      createdAt: daysAgo(0, 7),
      updatedAt: daysAgo(0, 7),
      studentId: 'usr-student-2',
      studentName: 'Ananya Patel',
      studentEmail: 'ananya.patel@campus.edu',
      studentDepartment: 'Electronics & Communication',
      studentRollNo: '2024EC210',
      timeline: [
        {
          id: 'tl-1004-1',
          status: 'Submitted',
          timestamp: daysAgo(0, 7),
          title: 'Complaint Registered',
          description: 'Safety and calibration complaint logged for Chemistry Lab 2.',
          updatedBy: 'Student',
        },
      ],
    },
    {
      id: 'CC-2025-1005',
      title: 'Route 12 college bus arriving 25-30 minutes late during morning pickup',
      category: 'Transport',
      description: 'Bus #12 from Green Valley / North Ring Road has been delayed continuously for four days this week, causing over 35 students to miss the 8:30 AM first hour attendance.',
      location: 'Route 12 - North Ring Road Stop #4',
      priority: 'High',
      status: 'In Progress',
      createdAt: daysAgo(4, 9),
      updatedAt: daysAgo(1, 8),
      studentId: 'usr-student-3',
      studentName: 'Vikram Singh',
      studentEmail: 'vikram.singh@campus.edu',
      studentDepartment: 'Mechanical Engineering',
      studentRollNo: '2022ME085',
      adminResponse: 'Transport coordinator investigated. Road widening construction on Ring Road caused the bottleneck. Revised departure timetable will be rolled out starting Monday with a standby feeder bus.',
      assignedDepartment: 'Transport & Logistics',
      timeline: [
        {
          id: 'tl-1005-1',
          status: 'Submitted',
          timestamp: daysAgo(4, 9),
          title: 'Transport Delay Reported',
          description: 'Multiple students impacted by morning route delay.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1005-2',
          status: 'Under Review',
          timestamp: daysAgo(3, 11),
          title: 'Route Audit Initiated',
          description: 'GPS telemetry logs verified with bus fleet operator.',
          updatedBy: 'Admin: Transport Head',
        },
        {
          id: 'tl-1005-3',
          status: 'In Progress',
          timestamp: daysAgo(1, 8),
          title: 'Alternate Route Deployed',
          description: 'Feeder bus scheduled and driver instructed on shortcut diversion.',
          updatedBy: 'Admin: Fleet Manager',
        },
      ],
    },
    {
      id: 'CC-2025-1006',
      title: 'Hostel Block C - Hot water solar geyser tripping main breaker',
      category: 'Hostel',
      description: 'The 1st floor bathroom circuit breaker trips every time the auxiliary water heater is switched on before 7:00 AM, leaving residents without hot water during cold mornings.',
      location: 'Boys Hostel Block C, 1st Floor Common Washroom',
      priority: 'High',
      status: 'Resolved',
      createdAt: daysAgo(8, 12),
      updatedAt: daysAgo(4, 3),
      resolvedAt: daysAgo(4, 3),
      studentId: 'usr-student-3',
      studentName: 'Vikram Singh',
      studentEmail: 'vikram.singh@campus.edu',
      studentDepartment: 'Mechanical Engineering',
      studentRollNo: '2022ME085',
      adminResponse: 'Hostel warden and campus electrician replaced the overloaded 16A breaker with an industrial grade 32A RCCB unit and insulated heating coil terminals.',
      assignedDepartment: 'Hostel Maintenance & Electrical',
      timeline: [
        {
          id: 'tl-1006-1',
          status: 'Submitted',
          timestamp: daysAgo(8, 12),
          title: 'Complaint Logged',
          description: 'Electrical tripping reported in Block C.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1006-2',
          status: 'In Progress',
          timestamp: daysAgo(6, 4),
          title: 'Electrician Assigned',
          description: 'Diagnostics revealed heater coil leakage current.',
          updatedBy: 'Admin: Electrical Section',
        },
        {
          id: 'tl-1006-3',
          status: 'Resolved',
          timestamp: daysAgo(4, 3),
          title: 'Breaker & Coil Replaced',
          description: 'Full load test successful. System operating normally.',
          updatedBy: 'Admin: Chief Electrician',
        },
      ],
      feedback: {
        rating: 4,
        comment: 'Hot water is consistent now. Thanks for addressing this so fast.',
        submittedAt: daysAgo(3, 10),
      },
    },
    {
      id: 'CC-2025-1007',
      title: 'Student Canteen Counter 2 digital payment QR terminal offline',
      category: 'Canteen',
      description: 'The UPI payment display at lunch counter 2 has been showing "Connection Timed Out" which causes huge queues during the 1:00 PM rush hour.',
      location: 'Campus Hub, Central Food Court Counter 2',
      priority: 'Low',
      status: 'Resolved',
      createdAt: daysAgo(5, 6),
      updatedAt: daysAgo(3, 8),
      resolvedAt: daysAgo(3, 8),
      studentId: 'usr-student-1',
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul.sharma@campus.edu',
      studentDepartment: 'Computer Science & Engineering',
      studentRollNo: '2023CS104',
      adminResponse: 'IT department provided a dedicated dual-band 4G backup router to the food court and upgraded payment terminal firmware.',
      assignedDepartment: 'Campus Services & IT',
      timeline: [
        {
          id: 'tl-1007-1',
          status: 'Submitted',
          timestamp: daysAgo(5, 6),
          title: 'Payment Issue Reported',
          description: 'POS terminal failure noted.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1007-2',
          status: 'Resolved',
          timestamp: daysAgo(3, 8),
          title: 'Connectivity Restored',
          description: 'New POS soundbox and stable router placed.',
          updatedBy: 'Admin: Campus Services',
        },
      ],
      feedback: {
        rating: 5,
        comment: 'Lunch line moves much faster now! Great job.',
        submittedAt: daysAgo(2, 14),
      },
    },
    {
      id: 'CC-2025-1008',
      title: 'Discrepancy in semester exam fee receipt on online student portal',
      category: 'Fees',
      description: 'Payment of Rs. 4,500 was deducted via Net Banking for End-Semester Examination, but the student ERP portal still shows "Pending Verification" with fine warning.',
      location: 'Student ERP Portal & Accounts Counter',
      priority: 'Medium',
      status: 'Under Review',
      createdAt: daysAgo(2, 3),
      updatedAt: daysAgo(1, 10),
      studentId: 'usr-student-2',
      studentName: 'Ananya Patel',
      studentEmail: 'ananya.patel@campus.edu',
      studentDepartment: 'Electronics & Communication',
      studentRollNo: '2024EC210',
      adminResponse: 'Accounts desk requested payment gateway reconciliation logs. Bank UTR number is being validated.',
      assignedDepartment: 'Finance & Accounts',
      timeline: [
        {
          id: 'tl-1008-1',
          status: 'Submitted',
          timestamp: daysAgo(2, 3),
          title: 'Fee Status Query Submitted',
          description: 'Transaction reference shared for manual audit.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1008-2',
          status: 'Under Review',
          timestamp: daysAgo(1, 10),
          title: 'Bank Reconciliation in Progress',
          description: 'Accounts team escalated to payment aggregator support.',
          updatedBy: 'Admin: Accounts Officer',
        },
      ],
    },
    {
      id: 'CC-2025-1009',
      title: 'Timetable clash between Machine Learning and Cloud Computing electives',
      category: 'Academics',
      description: 'Both CS-602 (Machine Learning) and CS-604 (Cloud Computing) are scheduled on Tuesday and Thursday 11:30 AM slot, preventing dual specialization.',
      location: 'Academic Section, Dean of Academics Office',
      priority: 'Medium',
      status: 'Submitted',
      createdAt: daysAgo(0, 14),
      updatedAt: daysAgo(0, 14),
      studentId: 'usr-student-1',
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul.sharma@campus.edu',
      studentDepartment: 'Computer Science & Engineering',
      studentRollNo: '2023CS104',
      timeline: [
        {
          id: 'tl-1009-1',
          status: 'Submitted',
          timestamp: daysAgo(0, 14),
          title: 'Timetable Query Filed',
          description: 'Course scheduling conflict submitted.',
          updatedBy: 'Student',
        },
      ],
    },
    {
      id: 'CC-2025-1010',
      title: 'Restroom tap leakage causing water wastage near Faculty Lounge',
      category: 'Restroom',
      description: 'Tap #3 has a continuous high-volume drip causing water overflow into the hallway tiles. Creates slipping hazard.',
      location: 'Mechanical Block, Ground Floor Washroom',
      priority: 'Low',
      status: 'Resolved',
      createdAt: daysAgo(7, 2),
      updatedAt: daysAgo(5, 5),
      resolvedAt: daysAgo(5, 5),
      studentId: 'usr-student-3',
      studentName: 'Vikram Singh',
      studentEmail: 'vikram.singh@campus.edu',
      studentDepartment: 'Mechanical Engineering',
      studentRollNo: '2022ME085',
      adminResponse: 'Plumber replaced the worn internal ceramic cartridge and adjusted line pressure.',
      assignedDepartment: 'Sanitation & Plumbing',
      timeline: [
        {
          id: 'tl-1010-1',
          status: 'Submitted',
          timestamp: daysAgo(7, 2),
          title: 'Leakage Reported',
          description: 'Tap defect logged.',
          updatedBy: 'Student',
        },
        {
          id: 'tl-1010-2',
          status: 'Resolved',
          timestamp: daysAgo(5, 5),
          title: 'Valve Repaired',
          description: 'Plumbing maintenance completed.',
          updatedBy: 'Admin: Maintenance Section',
        },
      ],
      feedback: {
        rating: 5,
        comment: 'Cleaned up nicely and no more water leakage.',
        submittedAt: daysAgo(4, 12),
      },
    },
  ];

  return {
    users,
    complaints,
    system: {
      initializedAt: new Date().toISOString(),
      version: '1.0.0',
      storageType: 'Persistent File-Backed JSON Store (MongoDB-Ready Architecture)',
    },
  };
}

class StorageManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.complaints) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading store file, reinitializing seed data:', err);
    }

    const seed = getInitialSeedData();
    this.saveDataDirect(seed);
    return seed;
  }

  private saveDataDirect(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing store file:', err);
    }
  }

  public save(): void {
    this.saveDataDirect(this.data);
  }

  // --- User Operations ---

  public getUsers(): User[] {
    return this.data.users.map(({ passwordHash, salt, ...rest }) => rest);
  }

  public findUserByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public findUserById(id: string): User | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  public createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'admin';
    studentId?: string;
    department?: string;
    year?: string;
    phone?: string;
  }): User {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const { hash, salt } = hashPassword(userData.password);
    const newUser = {
      id: `usr-${userData.role}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      studentId: userData.studentId?.trim(),
      department: userData.department?.trim(),
      year: userData.year?.trim(),
      phone: userData.phone?.trim(),
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80`,
      passwordHash: hash,
      salt,
    };

    this.data.users.push(newUser);
    this.save();

    const { passwordHash, salt: _, ...safeUser } = newUser;
    return safeUser;
  }

  // --- Complaint Operations ---

  public getComplaints(filter?: {
    studentId?: string;
    category?: string;
    priority?: string;
    status?: string;
    search?: string;
  }): Complaint[] {
    let list = [...this.data.complaints];

    if (filter?.studentId) {
      list = list.filter((c) => c.studentId === filter.studentId);
    }

    if (filter?.category && filter.category !== 'All') {
      list = list.filter((c) => c.category === filter.category);
    }

    if (filter?.priority && filter.priority !== 'All') {
      list = list.filter((c) => c.priority === filter.priority);
    }

    if (filter?.status && filter.status !== 'All') {
      list = list.filter((c) => c.status === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          (c.studentRollNo && c.studentRollNo.toLowerCase().includes(q))
      );
    }

    // Sort by latest createdAt descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getComplaintById(id: string): Complaint | undefined {
    const normalized = id.trim().toUpperCase();
    return this.data.complaints.find((c) => c.id.toUpperCase() === normalized);
  }

  public createComplaint(data: {
    title: string;
    category: ComplaintCategory;
    description: string;
    location: string;
    priority: ComplaintPriority;
    user: User;
  }): Complaint {
    const now = new Date().toISOString();
    const id = generateComplaintId();

    const newComplaint: Complaint = {
      id,
      title: data.title.trim(),
      category: data.category,
      description: data.description.trim(),
      location: data.location.trim(),
      priority: data.priority,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
      studentId: data.user.id,
      studentName: data.user.name,
      studentEmail: data.user.email,
      studentDepartment: data.user.department || 'Not specified',
      studentRollNo: data.user.studentId || 'N/A',
      timeline: [
        {
          id: `tl-${id}-1`,
          status: 'Submitted',
          timestamp: now,
          title: 'Complaint Registered',
          description: `Logged in category: ${data.category} (Priority: ${data.priority})`,
          updatedBy: data.user.name,
        },
      ],
    };

    this.data.complaints.unshift(newComplaint);
    this.save();
    return newComplaint;
  }

  public updateComplaintStatus(
    id: string,
    update: {
      status: ComplaintStatus;
      adminResponse?: string;
      assignedDepartment?: string;
      adminName: string;
    }
  ): Complaint {
    const complaint = this.getComplaintById(id);
    if (!complaint) {
      throw new Error(`Complaint with ID ${id} was not found.`);
    }

    const prevStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = update.status;
    complaint.updatedAt = now;

    if (update.adminResponse !== undefined) {
      complaint.adminResponse = update.adminResponse.trim();
    }
    if (update.assignedDepartment !== undefined) {
      complaint.assignedDepartment = update.assignedDepartment.trim();
    }
    if (update.status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = now;
    }

    // Add timeline entry
    complaint.timeline.push({
      id: `tl-${id}-${complaint.timeline.length + 1}`,
      status: update.status,
      timestamp: now,
      title: `Status changed to: ${update.status}`,
      description: update.adminResponse
        ? `Official response added: "${update.adminResponse.slice(0, 100)}${update.adminResponse.length > 100 ? '...' : ''}"`
        : `Ticket status progressed from ${prevStatus} to ${update.status}.`,
      updatedBy: update.adminName || 'Admin Desk',
    });

    this.save();
    return complaint;
  }

  public addComplaintFeedback(
    id: string,
    studentId: string,
    feedback: { rating: number; comment: string }
  ): Complaint {
    const complaint = this.getComplaintById(id);
    if (!complaint) {
      throw new Error(`Complaint with ID ${id} not found.`);
    }

    if (complaint.studentId !== studentId) {
      throw new Error('Only the student who filed this complaint can submit feedback.');
    }

    if (complaint.status !== 'Resolved') {
      throw new Error('Feedback can only be submitted after the complaint is resolved.');
    }

    complaint.feedback = {
      rating: Math.min(5, Math.max(1, feedback.rating)),
      comment: feedback.comment.trim(),
      submittedAt: new Date().toISOString(),
    };
    complaint.updatedAt = new Date().toISOString();

    this.save();
    return complaint;
  }

  // --- Statistics & Aggregations ---

  public getStats(): StatsSummary {
    const complaints = this.data.complaints;
    const total = complaints.length;

    let submitted = 0;
    let underReview = 0;
    let inProgress = 0;
    let resolved = 0;
    let highPriorityPending = 0;

    const categoryCounts: Record<ComplaintCategory, number> = {
      Classroom: 0,
      Laboratory: 0,
      Transport: 0,
      Canteen: 0,
      Hostel: 0,
      'Drinking Water': 0,
      Restroom: 0,
      Fees: 0,
      Academics: 0,
      'Internet/Wi-Fi': 0,
      Other: 0,
    };

    const statusCounts: Record<ComplaintStatus, number> = {
      Submitted: 0,
      'Under Review': 0,
      'In Progress': 0,
      Resolved: 0,
    };

    const priorityCounts: Record<ComplaintPriority, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
    };

    const locationFreq: Record<string, { count: number; category: string }> = {};

    let totalResolutionDays = 0;
    let resolvedCount = 0;

    for (const c of complaints) {
      // Status
      if (c.status === 'Submitted') submitted++;
      else if (c.status === 'Under Review') underReview++;
      else if (c.status === 'In Progress') inProgress++;
      else if (c.status === 'Resolved') resolved++;

      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;

      if (c.status !== 'Resolved' && c.priority === 'High') {
        highPriorityPending++;
      }

      if (c.status === 'Resolved' && c.resolvedAt) {
        const diffMs = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
        const diffDays = Math.max(0.1, diffMs / (1000 * 60 * 60 * 24));
        totalResolutionDays += diffDays;
        resolvedCount++;
      }

      // Hotspots
      const locKey = c.location.trim();
      if (!locationFreq[locKey]) {
        locationFreq[locKey] = { count: 1, category: c.category };
      } else {
        locationFreq[locKey].count++;
      }
    }

    const recentHotspots = Object.entries(locationFreq)
      .map(([location, meta]) => ({ location, count: meta.count, category: meta.category }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgResolutionDays = resolvedCount > 0 ? Number((totalResolutionDays / resolvedCount).toFixed(1)) : 1.8;

    return {
      total,
      submitted,
      underReview,
      inProgress,
      resolved,
      highPriorityPending,
      categoryCounts,
      statusCounts,
      priorityCounts,
      recentHotspots,
      resolutionRate,
      avgResolutionDays,
    };
  }

  public getSystemInfo() {
    return {
      version: this.data.system.version,
      initializedAt: this.data.system.initializedAt,
      storageType: this.data.system.storageType,
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      counts: {
        users: this.data.users.length,
        complaints: this.data.complaints.length,
      },
    };
  }

  // Reset database to initial seed data (useful for demonstration testing)
  public resetToSeed(): void {
    this.data = getInitialSeedData();
    this.save();
  }
}

export const storage = new StorageManager();
