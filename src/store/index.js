// ============================================================
// ProfileED - Central State Store
// Reactive localStorage-backed store for all app state
// ============================================================

const STORAGE_KEY = 'profileed_app_state';

// ---- SEED DATA ----
const SEED_STUDENTS = [
  {
    id: 'stu_001', role: 'student',
    name: 'Alex Rivera', email: 'alex@example.com', password: 'demo',
    school: 'Oakridge High School', grade: 12, city: 'Bangalore, India',
    careerInterests: ['Environmental Engineering', 'Sustainability', 'Robotics', 'PCM'],
    intendedDegree: 'B.Tech in Computer Science',
    dreamColleges: ['Masters\' Union', 'Hive School', 'Scaler School of Tech'],
    skills: ['Public Speaking', 'Python', 'Event Organization', 'Data Analysis', 'Debate Team Captain', 'Climate Tech', 'Eco-Robotics President', 'Team Leadership'],
    socialLinks: { linkedin: 'linkedin.com/in/alex-rivera', github: 'github.com/alex-rivera' },
    avatar: null,
    achievements: [
      { id: 'ach_001', title: 'State Science Fair - 1st Place', category: 'Olympiads', date: '2024-04', description: 'Awarded for the project "Biodegradable Polymers from Algae."', document: 'certificate.pdf' },
      { id: 'ach_002', title: 'AP Scholar with Distinction', category: 'Certifications', date: '2023-07', description: 'Granted to students who receive an average score of at least 3.5 on all AP exams taken.', document: 'certificate.pdf' },
    ],
    grades: { gpa: 9.6, board: 'CBSE' },
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
  {
    id: 'stu_006', role: 'student',
    name: 'Sarah Jenkins', email: 'sarah@example.com', password: 'demo',
    school: 'Walter Payton College Prep', grade: 11, city: 'Chicago, IL',
    careerInterests: ['Environmental Science', 'Climate Tech', 'Sustainability'],
    intendedDegree: 'Environmental Studies',
    dreamColleges: ['Ashoka University'],
    skills: ['Leadership', 'Public Speaking', 'Environmental Science', 'Climate Advocacy'],
    socialLinks: {},
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    achievements: [],
    grades: { gpa: 3.9, board: 'IB' },
    streakDays: 5, lastActivity: Date.now() - 86400000,
    followers: [], following: [],
    savedProfiles: [],
    contactRequests: [],
    isPublic: true,
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'stu_007', role: 'student',
    name: 'Marcus Chen', email: 'marcus@example.com', password: 'demo',
    school: 'Garfield High School', grade: 12, city: 'Seattle, WA',
    careerInterests: ['Mathematics', 'Web3', 'Robotics'],
    intendedDegree: 'Computer Science & Math',
    dreamColleges: ['Ashoka University'],
    skills: ['Robotics', 'Web3', 'Mathematics', 'C++'],
    socialLinks: {},
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    achievements: [],
    grades: { gpa: 3.7, board: 'CBSE' },
    streakDays: 10, lastActivity: Date.now() - 86400000,
    followers: [], following: [],
    savedProfiles: [],
    contactRequests: [],
    isPublic: true,
    createdAt: Date.now() - 10 * 86400000,
  },
];

const SEED_COUNSELOR = {
  id: 'cou_001', role: 'counselor',
  name: 'Ms. Deepa Iyer', email: 'counselor@example.com', password: 'demo',
  school: 'Delhi Public School',
  avatar: null,
};

const SEED_ADMIN = {
  id: 'adm_001', role: 'admin',
  name: 'Platform Admin', email: 'admin@example.com', password: 'demo',
  avatar: null,
};

const SEED_SUPER_ADMIN = {
  id: 'sad_001', role: 'super_admin',
  name: 'Naman Goel', email: 'naman@hive.co', password: 'naman.co@hive',
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
    admins: [SEED_ADMIN],
    super_admins: [SEED_SUPER_ADMIN],
    communications: [
      {
        id: 'comm_001',
        fromCollegeId: 'col_004',
        toStudentId: 'stu_001',
        type: 'interest',
        message: 'Aman Rudola here from Hive School. We saw your SaaS and entrepreneurship portfolio achievements and would love to chat.',
        status: 'approved',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'comm_002',
        fromCollegeId: 'col_001',
        toStudentId: 'stu_001',
        type: 'interest',
        message: "Hi there! I reviewed your preliminary application. We're very impressed with your work in the robotics club.",
        status: 'approved',
        createdAt: Date.now() - 3600000 * 2,
      }
    ],
    messages: [
      {
        id: 'msg_001',
        communicationId: 'comm_001',
        fromId: 'col_004',
        text: 'Hey Aanya! I am Aman Rudola, Admissions Lead at Hive School. We saw your achievements and would love to connect about our Post Graduate Program in Revenue & Tech. Let me know when you are available!',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'msg_002',
        communicationId: 'comm_002',
        fromId: 'col_001',
        text: "Hi there! I reviewed your preliminary application. We're very impressed with your work in the robotics club.",
        createdAt: Date.now() - 3600000 * 2,
      },
      {
        id: 'msg_003',
        communicationId: 'comm_002',
        fromId: 'col_001',
        text: "We'd love to see your latest portfolio update if you have one available.",
        createdAt: Date.now() - 3600000 * 2 + 120000,
      },
      {
        id: 'msg_004',
        communicationId: 'comm_002',
        fromId: 'stu_001',
        text: "Thank you Dr. Jenkins! I really appreciate the feedback.",
        createdAt: Date.now() - 3600000 * 2 + 180000,
      },
      {
        id: 'msg_005',
        communicationId: 'comm_002',
        fromId: 'stu_001',
        text: "I've just finalized the documentation for our latest autonomous rover project. Here it is:",
        createdAt: Date.now() - 3600000 * 2 + 240000,
      },
      {
        id: 'msg_006',
        communicationId: 'comm_002',
        fromId: 'stu_001',
        text: "[ATTACHMENT: Rover_V3_Doc.pdf]",
        createdAt: Date.now() - 3600000 * 2 + 300000,
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
    preRegistrations: [],
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
        
        // Migration to update old student naman@example.com (stu_001) to Alex Rivera
        if (parsed.students) {
          parsed.students = parsed.students.map(s => {
            if (s.id === 'stu_001') {
              return {
                ...s,
                name: 'Alex Rivera',
                email: 'alex@example.com',
                school: 'Oakridge High School',
                grade: 12,
                city: 'Bangalore, India',
                intendedDegree: 'Environmental Engineering',
                dreamColleges: ['Masters\' Union', 'Hive School', 'Scaler School of Tech'],
                skills: ['Public Speaking', 'Python', 'Event Organization', 'Data Analysis', 'Debate Team Captain', 'Climate Tech', 'Eco-Robotics President', 'Team Leadership'],
                achievements: [
                  { id: 'ach_001', title: 'State Science Fair - 1st Place', category: 'Olympiads', date: '2024-04', description: 'Awarded for the project "Biodegradable Polymers from Algae."', document: 'certificate.pdf' },
                  { id: 'ach_002', title: 'AP Scholar with Distinction', category: 'Certifications', date: '2023-07', description: 'Granted to students who receive an average score of at least 3.5 on all AP exams taken.', document: 'certificate.pdf' },
                ]
              };
            }
            return s;
          });
        }
        if (parsed.messages) {
          parsed.messages = parsed.messages.map(m => {
            if (m.id === 'msg_001' && (m.text.includes('Hey Naman!') || m.text.includes('Hey Aanya!'))) {
              return {
                ...m,
                text: 'Hey Alex! I am Aman Rudola, Admissions Lead at Hive School. We saw your achievements and would love to connect about our Post Graduate Program in Revenue & Tech. Let me know when you are available!'
              };
            }
            return m;
          });
        }

        if (!parsed.students) parsed.students = [];
        seedState.students.forEach(s => {
          if (!parsed.students.some(item => item.id === s.id)) {
            parsed.students.push(s);
          }
        });

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
        if (!parsed.admins) parsed.admins = [];
        seedState.admins.forEach(adm => {
          if (!parsed.admins.some(a => a.id === adm.id)) {
            parsed.admins.push(adm);
          }
        });
        if (!parsed.super_admins) parsed.super_admins = [];
        seedState.super_admins.forEach(sa => {
          if (!parsed.super_admins.some(s => s.id === sa.id)) {
            parsed.super_admins.push(sa);
          }
        });
        if (!parsed.communications) parsed.communications = [];
        seedState.communications.forEach(comm => {
          if (!parsed.communications.some(c => c.id === comm.id)) {
            parsed.communications.push(comm);
          }
        });
        if (!parsed.messages) parsed.messages = [];
        seedState.messages.forEach(msg => {
          if (!parsed.messages.some(m => m.id === msg.id)) {
            parsed.messages.push(msg);
          }
        });
        if (!parsed.preRegistrations) parsed.preRegistrations = [];
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
      ...(this._state.admins || []),
      ...(this._state.super_admins || []),
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
      (this._state.admins || []).find(u => u.id === id) ||
      (this._state.super_admins || []).find(u => u.id === id) ||
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

  updateCollegeTargetPrefs(collegeId, targetPrefs) {
    const idx = this._state.colleges.findIndex(c => c.id === collegeId);
    if (idx === -1) return;
    this._state.colleges[idx].targetPrefs = {
      ...this._state.colleges[idx].targetPrefs,
      ...targetPrefs
    };
    this._save();
    this._notify();
  }

  sendCounselorRecommendation(studentId, counselorName, collegeName) {
    this._state.notifications.push({
      id: `notif_${Date.now()}`,
      userId: studentId,
      text: `${counselorName} recommended that you apply to ${collegeName}.`,
      read: false,
      createdAt: Date.now(),
    });
    this._save();
    this._notify();
  }

  createCampaign(collegeId, collegeName, title, targetMatchThreshold, text) {
    const college = this._state.colleges.find(c => c.id === collegeId);
    const prefs = college ? college.targetPrefs || {} : {};
    
    this._state.students.forEach(student => {
      let score = 0;
      const gpa = student.grades?.gpa || 0;
      const interests = student.careerInterests || [];

      if (!prefs.grades || prefs.grades.includes(student.grade)) score += 20;
      if (!prefs.minGPA || gpa >= prefs.minGPA) score += 30;
      const interestOverlap = (prefs.interests || []).filter(pi =>
        interests.some(si => si.toLowerCase().includes(pi.toLowerCase()))
      );
      score += Math.min(30, interestOverlap.length * 15);
      
      // Calculate a basic match threshold compatibility
      if (score >= targetMatchThreshold) {
        this._state.notifications.push({
          id: `notif_${Date.now()}_${student.id}`,
          userId: student.id,
          text: `Outreach Campaign from ${collegeName}: "${title}" - ${text}`,
          read: false,
          createdAt: Date.now(),
        });
      }
    });
    this._save();
    this._notify();
  }

  toggleAchievementVerification(studentId, achId, isVerified) {
    const idx = this._state.students.findIndex(s => s.id === studentId);
    if (idx === -1) return;
    const achIdx = this._state.students[idx].achievements.findIndex(a => a.id === achId);
    if (achIdx === -1) return;
    this._state.students[idx].achievements[achIdx].verified = isVerified;
    this._save();
    this._notify();
  }

  addPreRegistration(data) {
    if (!this._state.preRegistrations) {
      this._state.preRegistrations = [];
    }
    const newReg = {
      id: `reg_${Date.now()}`,
      name: data.name,
      studentClass: data.studentClass,
      school: data.school,
      city: data.city,
      email: data.email,
      phone: data.phone || '',
      createdAt: Date.now()
    };
    this._state.preRegistrations.push(newReg);
    this._save();
    this._notify();
    return newReg;
  }

  getPreRegistrations() {
    return this._state.preRegistrations || [];
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

export const checkDevMode = () => {
  if (typeof window === 'undefined') return false;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return true;
  if (window.location.search.includes('dev=true')) {
    localStorage.setItem('profileed_dev_mode', 'true');
    return true;
  }
  return localStorage.getItem('profileed_dev_mode') === 'true';
};

