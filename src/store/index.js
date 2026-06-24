// ============================================================
// ProfileED - Central State Store
// Reactive localStorage-backed store for all app state
// ============================================================

const STORAGE_KEY = 'profileed_app_state';

// ---- SEED DATA ----
const SEED_STUDENTS = [
  {
    id: 'stu_001', role: 'student',
    name: 'Naman Goel', email: 'naman@example.com', password: 'demo',
    school: 'Government Model Senior Secondary School', grade: 11, city: 'Chandigarh',
    careerInterests: ['Finance', 'AI & Tech', 'PCM', 'JEE Aspirant', 'Entrepreneurship'],
    intendedDegree: 'Finance & Economics',
    dreamColleges: ['Hive School', 'Masters\' Union'],
    skills: ['Python', 'UI Design', 'Public Speaking', 'Financial Modeling'],
    socialLinks: { linkedin: 'linkedin.com/in/naman-goel-b163b9311', github: 'github.com/Naman30Goel' },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    achievements: [
      { id: 'ach_003', title: 'Founder - The Fintrition Club', category: 'Leadership Roles', date: '2025-01', description: 'A teen-led club decoding finance for teens globally.', document: null },
      { id: 'ach_001', title: 'National Science Olympiad - Gold', category: 'Olympiads', date: '2024-11', description: 'Placed 1st nationally in Physics Olympiad', document: null },
      { id: 'ach_002', title: 'Google Cloud Certification', category: 'Certifications', date: '2024-09', description: 'Earned Associate Cloud Engineer cert', document: null },
      { id: 'ach_004', title: 'Hackathon Winner - HackDTU', category: 'Competitions', date: '2024-07', description: 'Built an AI tutoring platform, won first place', document: null },
      { id: 'ach_005', title: 'NGO Volunteering - 120 hrs', category: 'Volunteering', date: '2024-06', description: 'Taught digital literacy in rural communities', document: null },
    ],
    grades: { gpa: 9.4, board: 'CBSE' },
    streakDays: 23, lastActivity: Date.now() - 86400000,
    followers: ['stu_002'], following: ['stu_002', 'stu_003'],
    savedProfiles: ['stu_003'],
    contactRequests: [],
    isPublic: true,
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'stu_002', role: 'student',
    name: 'Rohan Mehta', email: 'rohan@example.com', password: 'demo',
    school: 'Ryan International School', grade: 12, city: 'Mumbai',
    careerInterests: ['Finance', 'Business'],
    intendedDegree: 'Business Administration',
    dreamColleges: ['Harvard', 'London School of Economics', 'IIM Ahmedabad'],
    skills: ['Financial Modeling', 'Leadership', 'Excel'],
    socialLinks: { linkedin: 'linkedin.com/in/rohan' },
    avatar: null,
    achievements: [
      { id: 'ach_006', title: 'Model United Nations - Best Delegate', category: 'Competitions', date: '2024-10', description: 'UNSC committee at Harvard MUN', document: null },
      { id: 'ach_007', title: 'School Business Club Founder', category: 'Leadership Roles', date: '2024-04', description: 'Founded and grew school entrepreneurship club to 80 members', document: null },
      { id: 'ach_008', title: 'CFA Level 1 Prep Course', category: 'Certifications', date: '2024-08', description: 'Completed 120-hour CFA prep curriculum', document: null },
    ],
    grades: { gpa: 8.9, board: 'CBSE' },
    streakDays: 7, lastActivity: Date.now() - 86400000,
    followers: ['stu_001'], following: ['stu_001'],
    savedProfiles: [],
    contactRequests: [],
    isPublic: true,
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'stu_003', role: 'student',
    name: 'Priya Nair', email: 'priya@example.com', password: 'demo',
    school: 'Kendriya Vidyalaya', grade: 10, city: 'Bangalore',
    careerInterests: ['Design', 'Arts'],
    intendedDegree: 'Design',
    dreamColleges: ['NID', 'Parsons School of Design', 'MIT Media Lab'],
    skills: ['Figma', 'Illustration', 'Typography'],
    socialLinks: { linkedin: 'linkedin.com/in/priya', behance: 'behance.net/priya' },
    avatar: null,
    achievements: [
      { id: 'ach_009', title: 'National Art Competition - 2nd Place', category: 'Competitions', date: '2024-09', description: 'Digital illustration category', document: null },
      { id: 'ach_010', title: 'UI/UX Bootcamp Certificate', category: 'Certifications', date: '2024-07', description: 'Completed 8-week intensive at DesignBoat', document: null },
    ],
    grades: { gpa: 8.2, board: 'CBSE' },
    streakDays: 3, lastActivity: Date.now() - 2 * 86400000,
    followers: ['stu_001'], following: [],
    savedProfiles: [],
    contactRequests: [],
    isPublic: true,
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'stu_004', role: 'student',
    name: 'Karan Singh', email: 'karan@example.com', password: 'demo',
    school: 'St. Xavier\'s College Prep', grade: 12, city: 'Kolkata',
    careerInterests: ['Engineering', 'Robotics'],
    intendedDegree: 'Mechanical Engineering',
    dreamColleges: ['IIT Bombay', 'Carnegie Mellon', 'ETH Zurich'],
    skills: ['CAD', 'Arduino', 'C++'],
    socialLinks: {},
    avatar: null,
    achievements: [
      { id: 'ach_011', title: 'FIRST Robotics Competition - Regional Winner', category: 'Competitions', date: '2024-03', description: 'Led 15-member robotics team', document: null },
      { id: 'ach_012', title: 'Physics Internship - ISRO', category: 'Internships', date: '2024-06', description: '6-week research internship at ISRO Bangalore', document: null },
    ],
    grades: { gpa: 9.1, board: 'ICSE' },
    streakDays: 0, lastActivity: Date.now() - 5 * 86400000,
    followers: [], following: [],
    savedProfiles: [],
    contactRequests: [],
    isPublic: true,
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'stu_005', role: 'student',
    name: 'Zara Khan', email: 'zara@example.com', password: 'demo',
    school: 'The Aga Khan Academy', grade: 11, city: 'Hyderabad',
    careerInterests: ['Medicine', 'Biology'],
    intendedDegree: 'Medicine (MBBS)',
    dreamColleges: ['AIIMS', 'Johns Hopkins', 'UCL Medical School'],
    skills: ['Research', 'Statistics', 'Lab Work'],
    socialLinks: {},
    avatar: null,
    achievements: [
      { id: 'ach_013', title: 'Biology Olympiad - National Top 10', category: 'Olympiads', date: '2024-11', description: 'Ranked 7th nationally in NSEB', document: null },
      { id: 'ach_014', title: 'Hospital Volunteering - 200 hrs', category: 'Volunteering', date: '2024-05', description: 'Volunteered at Rainbow Children\'s Hospital', document: null },
      { id: 'ach_015', title: 'Research Paper - Published', category: 'Certifications', date: '2024-10', description: 'Co-authored paper on antibiotic resistance in youth journal', document: null },
    ],
    grades: { gpa: 9.6, board: 'IB' },
    streakDays: 15, lastActivity: Date.now() - 86400000,
    followers: [], following: [],
    savedProfiles: [],
    contactRequests: [],
    isPublic: true,
    createdAt: Date.now() - 25 * 86400000,
  },
];

const SEED_COUNSELOR = {
  id: 'cou_001', role: 'counselor',
  name: 'Ms. Deepa Iyer', email: 'counselor@example.com', password: 'demo',
  school: 'Delhi Public School',
  avatar: null,
};

const SEED_COLLEGES = [
  {
    id: 'col_001', role: 'college_admin',
    name: 'Ashoka University', email: 'admissions@ashoka.edu.in', password: 'demo',
    description: 'A leading liberal arts university in India with world-class faculty.',
    fees: '₹8,00,000/year', location: 'Sonipat, Haryana',
    programs: ['Liberal Arts', 'Computer Science', 'Economics', 'Psychology', 'Media Studies'],
    scholarships: ['Merit Scholarship up to 100%', 'Need-based aid', 'Sports scholarship'],
    placement: 'Average package ₹12 LPA, top recruiters include Google, McKinsey, BCG',
    applicationDeadline: '2025-03-15',
    targetPrefs: { minGPA: 8.0, grades: [11, 12], interests: ['Liberal Arts', 'Social Sciences', 'Technology'], minScore: 60 },
    employees: ['emp_001'],
    sentRequests: [],
    avatar: null,
  },
  {
    id: 'col_002', role: 'college_admin',
    name: 'BITS Pilani', email: 'admissions@bits-pilani.ac.in', password: 'demo',
    description: 'India\'s premier engineering institute with strong industry connections.',
    fees: '₹5,50,000/year', location: 'Pilani, Rajasthan',
    programs: ['Computer Science', 'Mechanical Engineering', 'Electronics', 'Chemical Engineering', 'Pharmacy'],
    scholarships: ['Merit scholarship for top 10%', 'Research grants'],
    placement: 'Average package ₹18 LPA, highest offer ₹2.5 Cr from top tech firms',
    applicationDeadline: '2025-05-01',
    targetPrefs: { minGPA: 8.5, grades: [12], interests: ['Engineering', 'Technology', 'Robotics'], minScore: 70 },
    employees: [],
    sentRequests: [],
    avatar: null,
  },
  {
    id: 'col_003', role: 'college_admin',
    name: 'Flame University', email: 'admissions@flame.edu.in', password: 'demo',
    description: 'A liberal education institution building well-rounded thinkers.',
    fees: '₹6,50,000/year', location: 'Pune, Maharashtra',
    programs: ['Business', 'Design', 'Psychology', 'Media Studies', 'Law'],
    scholarships: ['Academic excellence award', 'Leadership grant'],
    placement: 'Strong alumni network in media and consulting sectors',
    applicationDeadline: '2025-02-28',
    targetPrefs: { minGPA: 7.5, grades: [11, 12], interests: ['Business', 'Design', 'Arts', 'Media'], minScore: 50 },
    employees: ['emp_002'],
    sentRequests: [],
    avatar: null,
  },
  {
    id: 'col_004', role: 'college_admin',
    name: 'Hive School', email: 'admissions@hiveschool.co', password: 'demo',
    description: 'A revenue-first business school focusing on SaaS, go-to-market strategies, and tech sales.',
    fees: '₹4,50,000/year', location: 'Gurugram, Haryana',
    programs: ['Post Graduate Program in Revenue', 'Entrepreneurship', 'Sales Strategy'],
    scholarships: ['GTM Scholarships', 'Diversity Awards'],
    placement: 'Average package ₹9 LPA, top GTM roles in SaaS firms',
    applicationDeadline: '2025-06-30',
    targetPrefs: { minGPA: 7.2, grades: [11, 12], interests: ['Business', 'Entrepreneurship', 'Technology'], minScore: 50 },
    employees: ['emp_003'],
    sentRequests: ['stu_001'],
    avatar: null,
  },
  {
    id: 'col_005', role: 'college_admin',
    name: 'Masters\' Union', email: 'admissions@mastersunion.org', password: 'demo',
    description: 'An industry-led business school with experiential learn-by-doing programs in business leadership and technology.',
    fees: '₹8,50,000/year', location: 'Gurugram, Haryana',
    programs: ['PGP in Business Leadership', 'Tech Management', 'Undergraduate Program'],
    scholarships: ['MU Scholarships up to 100%', 'Founder Grants'],
    placement: 'Average package ₹21 LPA, consulting, SaaS startup leaders',
    applicationDeadline: '2025-04-30',
    targetPrefs: { minGPA: 7.8, grades: [11, 12], interests: ['Business', 'Entrepreneurship', 'Leadership', 'Technology'], minScore: 60 },
    employees: [],
    sentRequests: [],
    avatar: null,
  },
];

const SEED_EMPLOYEES = [
  {
    id: 'emp_001', role: 'college_employee',
    name: 'Mr. Vikram Nair', email: 'vikram@ashoka.edu.in', password: 'demo',
    collegeId: 'col_001', jobRole: 'Admissions Officer',
    avatar: null,
  },
  {
    id: 'emp_002', role: 'college_employee',
    name: 'Ms. Sunita Rao', email: 'sunita@flame.edu.in', password: 'demo',
    collegeId: 'col_003', jobRole: 'Counselor',
    avatar: null,
  },
  {
    id: 'emp_003', role: 'college_employee',
    name: 'Aman Rudola', email: 'aman@hiveschool.co', password: 'demo',
    collegeId: 'col_004', jobRole: 'Admissions Lead',
    avatar: null,
  },
];

// ---- INITIAL STATE ----
function createInitialState() {
  return {
    activeUserId: null,
    students: SEED_STUDENTS,
    counselors: [SEED_COUNSELOR],
    colleges: SEED_COLLEGES,
    employees: SEED_EMPLOYEES,
    communications: [
      {
        id: 'comm_001',
        fromCollegeId: 'col_004',
        toStudentId: 'stu_001',
        type: 'interest',
        message: 'Aman Rudola here from Hive School. We saw your SaaS and entrepreneurship portfolio achievements and would love to chat.',
        status: 'approved',
        createdAt: Date.now() - 3600000,
      }
    ],
    messages: [
      {
        id: 'msg_001',
        communicationId: 'comm_001',
        fromId: 'col_004',
        text: 'Hey Naman! I am Aman Rudola, Admissions Lead at Hive School. We saw your achievements and would love to connect about our Post Graduate Program in Revenue & Tech. Let me know when you are available!',
        createdAt: Date.now() - 3600000,
      }
    ],
    notifications: [
      {
        id: 'notif_001',
        userId: 'stu_001',
        text: 'Aman Rudola from Hive School sent you a contact connection.',
        read: true,
        createdAt: Date.now() - 3600000,
      }
    ],
  };
}

// ---- STORE CLASS ----
class Store {
  constructor() {
    this._state = this._load();
    this._listeners = new Set();
  }

  _load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem('connected_app_state'); // Migration fallback
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        const seedState = createInitialState();
        if (!parsed.colleges) parsed.colleges = [];
        seedState.colleges.forEach(col => {
          if (!parsed.colleges.some(c => c.id === col.id)) {
            parsed.colleges.push(col);
          }
        });
        if (!parsed.employees) parsed.employees = [];
        seedState.employees.forEach(emp => {
          if (!parsed.employees.some(e => e.id === emp.id)) {
            parsed.employees.push(emp);
          }
        });
        if (!parsed.communications || parsed.communications.length === 0) {
          parsed.communications = seedState.communications;
        }
        if (!parsed.messages || parsed.messages.length === 0) {
          parsed.messages = seedState.messages;
        }
        return { ...seedState, ...parsed };
      }
    } catch (e) { /* ignore */ }
    return createInitialState();
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (e) { /* ignore */ }
  }

  _notify() {
    this._listeners.forEach(fn => fn(this._state));
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  get state() { return this._state; }

  // ---- AUTH ----
  login(email, password) {
    const allUsers = [
      ...this._state.students,
      ...this._state.counselors,
      ...this._state.colleges,
      ...this._state.employees,
    ];
    const user = allUsers.find(u => u.email === email && u.password === password);
    if (!user) return null;
    this._state.activeUserId = user.id;
    this._save();
    this._notify();
    return user;
  }

  logout() {
    this._state.activeUserId = null;
    this._save();
    this._notify();
  }

  getActiveUser() {
    if (!this._state.activeUserId) return null;
    return this._findUserById(this._state.activeUserId);
  }

  switchRole(userId) {
    this._state.activeUserId = userId;
    this._save();
    this._notify();
  }

  _findUserById(id) {
    return (
      this._state.students.find(u => u.id === id) ||
      this._state.counselors.find(u => u.id === id) ||
      this._state.colleges.find(u => u.id === id) ||
      this._state.employees.find(u => u.id === id) ||
      null
    );
  }

  // ---- STUDENT OPS ----
  updateStudent(id, updates) {
    const idx = this._state.students.findIndex(s => s.id === id);
    if (idx === -1) return;
    this._state.students[idx] = { ...this._state.students[idx], ...updates };
    this._save();
    this._notify();
  }

  addAchievement(studentId, achievement) {
    const idx = this._state.students.findIndex(s => s.id === studentId);
    if (idx === -1) return;
    const ach = { id: `ach_${Date.now()}`, ...achievement };
    this._state.students[idx].achievements.push(ach);
    // Update streak
    const now = Date.now();
    const last = this._state.students[idx].lastActivity || 0;
    const daysDiff = Math.floor((now - last) / 86400000);
    if (daysDiff <= 1) {
      this._state.students[idx].streakDays = (this._state.students[idx].streakDays || 0) + 1;
    } else {
      this._state.students[idx].streakDays = 1;
    }
    this._state.students[idx].lastActivity = now;
    this._save();
    this._notify();
  }

  deleteAchievement(studentId, achId) {
    const idx = this._state.students.findIndex(s => s.id === studentId);
    if (idx === -1) return;
    this._state.students[idx].achievements = this._state.students[idx].achievements.filter(a => a.id !== achId);
    this._save();
    this._notify();
  }

  followStudent(fromId, toId) {
    const fromIdx = this._state.students.findIndex(s => s.id === fromId);
    const toIdx = this._state.students.findIndex(s => s.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    if (!this._state.students[fromIdx].following.includes(toId)) {
      this._state.students[fromIdx].following.push(toId);
      this._state.students[toIdx].followers.push(fromId);
    }
    this._save();
    this._notify();
  }

  unfollowStudent(fromId, toId) {
    const fromIdx = this._state.students.findIndex(s => s.id === fromId);
    const toIdx = this._state.students.findIndex(s => s.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    this._state.students[fromIdx].following = this._state.students[fromIdx].following.filter(id => id !== toId);
    this._state.students[toIdx].followers = this._state.students[toIdx].followers.filter(id => id !== fromId);
    this._save();
    this._notify();
  }

  // ---- COLLEGE OPS ----
  updateCollege(id, updates) {
    const idx = this._state.colleges.findIndex(c => c.id === id);
    if (idx === -1) return;
    this._state.colleges[idx] = { ...this._state.colleges[idx], ...updates };
    this._save();
    this._notify();
  }

  inviteEmployee(collegeId, employee) {
    const emp = { id: `emp_${Date.now()}`, role: 'college_employee', ...employee, collegeId };
    this._state.employees.push(emp);
    const cIdx = this._state.colleges.findIndex(c => c.id === collegeId);
    if (cIdx !== -1) this._state.colleges[cIdx].employees.push(emp.id);
    this._save();
    this._notify();
    return emp;
  }

  revokeEmployee(collegeId, employeeId) {
    this._state.employees = this._state.employees.filter(e => e.id !== employeeId);
    const cIdx = this._state.colleges.findIndex(c => c.id === collegeId);
    if (cIdx !== -1) this._state.colleges[cIdx].employees = this._state.colleges[cIdx].employees.filter(id => id !== employeeId);
    this._save();
    this._notify();
  }

  // ---- COMMUNICATIONS ----
  sendContactRequest(fromCollegeId, toStudentId, type, message) {
    const existing = this._state.communications.find(
      c => c.fromCollegeId === fromCollegeId && c.toStudentId === toStudentId
    );
    if (existing) return existing;

    const comm = {
      id: `comm_${Date.now()}`,
      fromCollegeId, toStudentId, type, message,
      status: 'pending', // pending | approved | rejected
      createdAt: Date.now(),
    };
    this._state.communications.push(comm);

    // Add notification for student
    this._state.notifications.push({
      id: `notif_${Date.now()}`,
      userId: toStudentId,
      text: `A college has sent you a contact request.`,
      read: false,
      createdAt: Date.now(),
    });

    // Update college sentRequests
    const cIdx = this._state.colleges.findIndex(c => c.id === fromCollegeId);
    if (cIdx !== -1 && !this._state.colleges[cIdx].sentRequests.includes(toStudentId)) {
      this._state.colleges[cIdx].sentRequests.push(toStudentId);
    }

    this._save();
    this._notify();
    return comm;
  }

  respondToRequest(commId, status) {
    const idx = this._state.communications.findIndex(c => c.id === commId);
    if (idx === -1) return;
    this._state.communications[idx].status = status;
    this._save();
    this._notify();
  }

  sendMessage(communicationId, fromId, text) {
    const msg = { id: `msg_${Date.now()}`, communicationId, fromId, text, createdAt: Date.now() };
    this._state.messages.push(msg);
    this._save();
    this._notify();
    return msg;
  }

  getMessagesForComm(commId) {
    return this._state.messages.filter(m => m.communicationId === commId);
  }

  markNotificationsRead(userId) {
    this._state.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this._save();
    this._notify();
  }

  getUnreadCount(userId) {
    return this._state.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this._state = createInitialState();
    this._save();
    this._notify();
  }
}

export const store = new Store();
export { SEED_STUDENTS, SEED_COLLEGES, SEED_EMPLOYEES };
