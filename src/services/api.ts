import {
  User,
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  StatsSummary,
} from '../types';

const TOKEN_KEY = 'campuscare_auth_token';
const USER_KEY = 'campuscare_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save auth to localStorage', err);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear auth from localStorage', err);
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await apiRequest<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async register(studentData: {
    name: string;
    email: string;
    password: string;
    studentId?: string;
    department?: string;
    year?: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await apiRequest<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    setStoredAuth(res.token, res.user);
    return res;
  },

  async getMe(): Promise<User> {
    const res = await apiRequest<{ user: User }>('/api/auth/me');
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network fail on logout
    }
    clearStoredAuth();
  },

  // Complaints
  async getComplaints(filter?: {
    category?: string;
    priority?: string;
    status?: string;
    search?: string;
    studentId?: string;
  }): Promise<Complaint[]> {
    const params = new URLSearchParams();
    if (filter?.category && filter.category !== 'All') params.set('category', filter.category);
    if (filter?.priority && filter.priority !== 'All') params.set('priority', filter.priority);
    if (filter?.status && filter.status !== 'All') params.set('status', filter.status);
    if (filter?.search) params.set('search', filter.search);
    if (filter?.studentId) params.set('studentId', filter.studentId);

    const queryString = params.toString();
    const url = `/api/complaints${queryString ? `?${queryString}` : ''}`;
    const res = await apiRequest<{ complaints: Complaint[] }>(url);
    return res.complaints;
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const res = await apiRequest<{ complaint: Complaint }>(`/api/complaints/${encodeURIComponent(id)}`);
    return res.complaint;
  },

  async createComplaint(payload: {
    title: string;
    category: ComplaintCategory;
    description: string;
    location: string;
    priority: ComplaintPriority;
    guestStudent?: {
      name: string;
      email: string;
      studentId?: string;
      department?: string;
      year?: string;
      phone?: string;
    };
  }): Promise<Complaint> {
    const res = await apiRequest<{ complaint: Complaint; message: string }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.complaint;
  },

  async updateComplaintStatus(
    id: string,
    payload: {
      status: ComplaintStatus;
      adminResponse?: string;
      assignedDepartment?: string;
    }
  ): Promise<Complaint> {
    const res = await apiRequest<{ complaint: Complaint; message: string }>(
      `/api/complaints/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return res.complaint;
  },

  async submitFeedback(
    id: string,
    rating: number,
    comment: string
  ): Promise<Complaint> {
    const res = await apiRequest<{ complaint: Complaint; message: string }>(
      `/api/complaints/${encodeURIComponent(id)}/feedback`,
      {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      }
    );
    return res.complaint;
  },

  // Stats & System
  async getStats(): Promise<StatsSummary> {
    return await apiRequest<StatsSummary>('/api/stats');
  },

  async getSystemInfo(): Promise<any> {
    return await apiRequest('/api/system/info');
  },

  async resetDatabase(): Promise<void> {
    await apiRequest('/api/system/reset', { method: 'POST' });
  },
};
