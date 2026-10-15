import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { storage, verifyPassword } from './server/storage.js';
import { User } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const AUTH_SECRET = process.env.AUTH_SECRET || 'campuscare_secret_2025';

// Memory session tokens mapping for simple and robust token verification
interface SessionToken {
  token: string;
  userId: string;
  role: 'student' | 'admin';
  createdAt: number;
}
const tokenStore = new Map<string, SessionToken>();

function createToken(user: User): string {
  const token = `cct_${crypto.randomBytes(24).toString('hex')}`;
  tokenStore.set(token, {
    token,
    userId: user.id,
    role: user.role,
    createdAt: Date.now(),
  });
  return token;
}

function getUserFromReq(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  const session = tokenStore.get(token);
  if (!session) {
    return null;
  }
  const user = storage.findUserById(session.userId);
  return user || null;
}

// Middleware to parse JSON
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register student
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, studentId, department, year, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = storage.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = storage.createUser({
      name,
      email,
      password,
      role: 'student',
      studentId: studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department || 'General Engineering',
      year: year || '1st Year',
      phone: phone || '',
    });

    const token = createToken(newUser);

    return res.status(201).json({
      message: 'Student account registered successfully.',
      user: newUser,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// Login for both students and administrators
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const rawUser = storage.findUserByEmail(email);
    if (!rawUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, rawUser.passwordHash, rawUser.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = storage.findUserById(rawUser.id);
    if (!safeUser) {
      return res.status(500).json({ error: 'User record error.' });
    }

    const token = createToken(safeUser);

    return res.json({
      message: 'Login successful.',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Current user profile verification
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated or token expired.' });
  }
  return res.json({ user });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    tokenStore.delete(token);
  }
  return res.json({ message: 'Logged out successfully.' });
});

// ==========================================
// COMPLAINT ROUTES
// ==========================================

// Get complaints list with role-based filtering
app.get('/api/complaints', (req: Request, res: Response) => {
  try {
    const user = getUserFromReq(req);
    const { category, priority, status, search, studentId } = req.query as Record<string, string>;

    // If user is logged in as student, enforce that they only see their own complaints
    // unless admin explicitly queries or this is public query
    let effectiveStudentId = studentId;

    if (user && user.role === 'student') {
      effectiveStudentId = user.id;
    }

    const complaints = storage.getComplaints({
      studentId: effectiveStudentId,
      category,
      priority,
      status,
      search,
    });

    return res.json({
      count: complaints.length,
      complaints,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch complaints.' });
  }
});

// Get single complaint by ID (for tracking / modal)
app.get('/api/complaints/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const complaint = storage.getComplaintById(id);

    if (!complaint) {
      return res.status(404).json({ error: `Complaint #${id} not found in system records.` });
    }

    return res.json({ complaint });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve complaint.' });
  }
});

// Create new complaint
app.post('/api/complaints', (req: Request, res: Response) => {
  try {
    const user = getUserFromReq(req);
    const { title, category, description, location, priority, guestStudent } = req.body;

    if (!title || !category || !description || !location || !priority) {
      return res.status(400).json({
        error: 'Title, category, description, location, and priority are required fields.',
      });
    }

    // Determine the student info
    let filingUser: User;

    if (user) {
      filingUser = user;
    } else if (guestStudent && guestStudent.name && guestStudent.email) {
      // Guest submission (creates or links temporary student profile)
      filingUser = {
        id: `guest-${Date.now().toString(36)}`,
        name: guestStudent.name.trim(),
        email: guestStudent.email.trim().toLowerCase(),
        role: 'student',
        studentId: guestStudent.studentId || 'GST-2025',
        department: guestStudent.department || 'Undergraduate',
        year: guestStudent.year || 'Student',
        phone: guestStudent.phone || '',
      };
    } else {
      return res.status(401).json({
        error: 'Please sign in as a student to file a complaint or provide student details.',
      });
    }

    const complaint = storage.createComplaint({
      title,
      category,
      description,
      location,
      priority,
      user: filingUser,
    });

    return res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create complaint.' });
  }
});

// Update complaint status & admin response (Admin only)
app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  try {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Only college administrators can update complaint status.',
      });
    }

    const { id } = req.params;
    const { status, adminResponse, assignedDepartment } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Target status is required.' });
    }

    const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = storage.updateComplaintStatus(id, {
      status,
      adminResponse,
      assignedDepartment,
      adminName: user.name,
    });

    return res.json({
      message: `Complaint #${id} updated to ${status}.`,
      complaint: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update complaint.' });
  }
});

// Submit feedback for a resolved complaint (Student only)
app.post('/api/complaints/:id/feedback', (req: Request, res: Response) => {
  try {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Please log in to submit feedback.' });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Please provide a valid star rating between 1 and 5.' });
    }

    const updated = storage.addComplaintFeedback(id, user.id, {
      rating: Number(rating),
      comment: comment || '',
    });

    return res.json({
      message: 'Feedback submitted successfully. Thank you for helping improve the campus!',
      complaint: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit feedback.' });
  }
});

// ==========================================
// STATISTICS & SYSTEM INFO
// ==========================================

app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = storage.getStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to calculate stats.' });
  }
});

app.get('/api/system/info', (req: Request, res: Response) => {
  try {
    const info = storage.getSystemInfo();
    return res.json(info);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get system info.' });
  }
});

// Reset data to seed (useful for live demonstrations)
app.post('/api/system/reset', (req: Request, res: Response) => {
  try {
    storage.resetToSeed();
    return res.json({ message: 'CampusCare database reset to fresh demo seed data successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reset data.' });
  }
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` CampusCare Backend & UI Server running on port ${PORT}`);
    console.log(` URL: http://0.0.0.0:${PORT}`);
    console.log(` Storage: JSON File Store (with optional MongoDB bridge)`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CampusCare server:', err);
  process.exit(1);
});
