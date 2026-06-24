import './style.css';
import { store } from './store/index.js';
import { renderStudentDashboard } from './views/student.js';
import { renderCounselorDashboard } from './views/counselor.js';
import { renderCollegeDashboard } from './views/college.js';

// Global navigation tab states
let currentTab = 'dashboard'; 
let isOnboarding = false;
let onboardingStep = 1;
let onboardingData = {
  name: '',
  school: '',
  grade: 11,
  city: '',
  careerInterests: [],
  intendedDegree: 'Computer Science',
  dreamColleges: [],
  skills: [],
  socialLinks: {}
};

// -------------------------------------------------------------
// TOAST NOTIFICATION UTILITY
// -------------------------------------------------------------
function triggerToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '';
  if (type === 'warning') icon = '';
  if (type === 'error') icon = '';
  if (type === 'info') icon = '';

  toast.innerHTML = `
    <span>${icon}</span>
    <span class="text-sm font-semibold">${message}</span>
  `;
  container.appendChild(toast);

  // Play animation, then remove
  toast.style.animation = 'toast-in 0.3s ease forwards';

  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// -------------------------------------------------------------
// RENDER ROUTER
// -------------------------------------------------------------
function render() {
  const activeUser = store.getActiveUser();
  const root = document.querySelector('#app');

  if (!activeUser) {
    if (isOnboarding) {
      renderOnboarding(root);
    } else {
      renderLogin(root);
    }
    return;
  }

  // User is logged in, render app shell
  renderAppShell(root, activeUser);
}

// -------------------------------------------------------------
// LOGIN PAGE
// -------------------------------------------------------------
function renderLogin(root) {
  root.innerHTML = `
    <div class="login-shell animate-fade-in">
      <div class="login-hero">
        <div style="z-index: 1; max-width: 440px;">
          <div class="logo-mark mb-4" style="background: white; color: var(--color-primary); width: 48px; height: 48px; font-size: 1.5rem;">P</div>
          <h1 style="color: white; font-size: 2.25rem; margin-block-end: var(--space-4);">ProfileED</h1>
          <p class="text-lg" style="color: rgb(255 255 255 / 0.9); font-weight: var(--weight-medium); margin-block-end: var(--space-4);">
            The Verified High School Portfolio & AI Matching Network
          </p>
          <ul class="flex flex-col gap-3 text-sm" style="color: rgb(255 255 255 / 0.8);">
            <li>✓ Build an audited achievements record</li>
            <li>✓ Discover traditional, new-age & global colleges</li>
            <li>✓ Get matching invites directly from admissions offices</li>
          </ul>
        </div>
      </div>
      <div class="login-form-wrap">
        <div>
          <h2 class="text-2xl font-bold mb-2">Welcome Back</h2>
          <p class="text-sm text-secondary">Log in to manage your portfolio or admissions pipeline.</p>
        </div>
        
        <form id="form-login" class="flex flex-col gap-4 mt-4" style="max-width: 400px;">
          <div class="input-group">
            <label class="input-label" for="login-email">Email Address</label>
            <input class="input" type="email" id="login-email" placeholder="student@example.com / counselor@example.com / admissions@ashoka.edu.in" required>
          </div>
          <div class="input-group">
            <label class="input-label" for="login-password">Password</label>
            <input class="input" type="password" id="login-password" value="demo" required>
          </div>
          <button type="submit" class="btn btn-primary w-full mt-2">Log In</button>
        </form>

        <div class="divider" style="max-width: 400px;"></div>

        <div class="flex flex-col gap-3" style="max-width: 400px;">
          <button id="btn-mock-google" class="btn btn-secondary w-full justify-center">
            <span></span> Simulated Google OAuth Login (Aanya)
          </button>
          <button id="btn-start-onboarding" class="btn btn-ghost w-full justify-center text-sm font-semibold">
            First time student? <strong>Get Started / Onboarding</strong>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach login triggers
  root.querySelector('#form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = root.querySelector('#login-email').value;
    const password = root.querySelector('#login-password').value;
    const user = store.login(email, password);
    if (user) {
      triggerToast(`Welcome back, ${user.name}!`, 'success');
      // Set default tab based on role
      if (user.role === 'student') currentTab = 'dashboard';
      else if (user.role === 'counselor') currentTab = 'overview';
      else if (user.role === 'college_admin' || user.role === 'college_employee') currentTab = 'profile';
    } else {
      triggerToast('Invalid email or password. Use demo/demo for test accounts.', 'error');
    }
  });

  root.querySelector('#btn-mock-google').addEventListener('click', () => {
    // Aanya Sharma is the default seeded student
    const user = store.login('aanya@example.com', 'demo');
    if (user) {
      currentTab = 'dashboard';
      triggerToast('Authenticated via Google OAuth.', 'success');
    }
  });

  root.querySelector('#btn-start-onboarding').addEventListener('click', () => {
    isOnboarding = true;
    onboardingStep = 1;
    render();
  });
}

// -------------------------------------------------------------
// STUDENT ONBOARDING FLOW
// -------------------------------------------------------------
function renderOnboarding(root) {
  let stepHTML = '';

  if (onboardingStep === 1) {
    stepHTML = `
      <div class="onboarding-step-body animate-fade-up">
        <h3 class="font-bold">Step 1: Student Demographics</h3>
        <p class="text-xs text-muted">Let's set up your profile details first.</p>
        <div class="input-group">
          <label class="input-label" for="ob-name">Full Name</label>
          <input class="input" type="text" id="ob-name" value="${onboardingData.name}" placeholder="Aanya Sharma" required>
        </div>
        <div class="input-group">
          <label class="input-label" for="ob-school">High School Name</label>
          <input class="input" type="text" id="ob-school" value="${onboardingData.school}" placeholder="Government Model Senior Secondary School" required>
        </div>
        <div class="grid-2">
          <div class="input-group">
            <label class="input-label" for="ob-grade">Grade Level</label>
            <select class="input select" id="ob-grade">
              <option value="9" ${onboardingData.grade === 9 ? 'selected' : ''}>Grade 9</option>
              <option value="10" ${onboardingData.grade === 10 ? 'selected' : ''}>Grade 10</option>
              <option value="11" ${onboardingData.grade === 11 ? 'selected' : ''}>Grade 11</option>
              <option value="12" ${onboardingData.grade === 12 ? 'selected' : ''}>Grade 12</option>
            </select>
          </div>
          <div class="input-group">
            <label class="input-label" for="ob-city">City</label>
            <input class="input" type="text" id="ob-city" value="${onboardingData.city}" placeholder="New Delhi" required>
          </div>
        </div>
      </div>
    `;
  } else if (onboardingStep === 2) {
    stepHTML = `
      <div class="onboarding-step-body animate-fade-up">
        <h3 class="font-bold">Step 2: Interests & Intended Degrees</h3>
        <p class="text-xs text-muted">Colleges filter matching recommendations using these preferences.</p>
        <div class="input-group">
          <label class="input-label" for="ob-degree">Intended Undergraduate Degree</label>
          <select class="input select" id="ob-degree">
            <option value="Computer Science">Computer Science</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Design">Design</option>
            <option value="Finance & Economics">Finance & Economics</option>
            <option value="Engineering">Engineering</option>
            <option value="Liberal Arts & Humanities">Liberal Arts & Humanities</option>
            <option value="Medicine & Biology">Medicine & Biology</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Career Focus Areas (Select all that apply)</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${['Technology', 'Entrepreneurship', 'Finance', 'Business', 'Design', 'Arts', 'Robotics', 'Medicine'].map(interest => {
              const checked = onboardingData.careerInterests.includes(interest) ? 'checked' : '';
              return `
                <label class="flex items-center gap-2 text-xs" style="cursor: pointer;">
                  <input type="checkbox" class="ob-interest-cb" value="${interest}" ${checked}> ${interest}
                </label>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (onboardingStep === 3) {
    stepHTML = `
      <div class="onboarding-step-body animate-fade-up">
        <h3 class="font-bold">Step 3: Skills & Dream Colleges</h3>
        <p class="text-xs text-muted">Final credentials to complete your portfolio onboarding.</p>
        <div class="input-group">
          <label class="input-label" for="ob-skills">Your Skills (Comma separated)</label>
          <input class="input" type="text" id="ob-skills" value="${onboardingData.skills.join(', ')}" placeholder="Python, Figma, Public Speaking">
        </div>
        <div class="input-group">
          <label class="input-label" for="ob-dream">Dream Colleges (Comma separated)</label>
          <input class="input" type="text" id="ob-dream" value="${onboardingData.dreamColleges.join(', ')}" placeholder="MIT, Stanford, Ashoka University">
        </div>
        
        <div class="feedback-item tip mt-4">
          <p class="text-xs"> Parent/guardian consent required for student profile audits under data compliance guidelines.</p>
        </div>
      </div>
    `;
  }

  root.innerHTML = `
    <div class="onboarding-wrap animate-fade-in">
      <div class="onboarding-card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-extrabold text-primary">Student Registration</h2>
          <div class="steps">
            <div class="step ${onboardingStep >= 1 ? 'active done' : ''}"><div class="step-circle">1</div></div>
            <div class="step-line"></div>
            <div class="step ${onboardingStep >= 2 ? 'active done' : ''}"><div class="step-circle">2</div></div>
            <div class="step-line"></div>
            <div class="step ${onboardingStep >= 3 ? 'active done' : ''}"><div class="step-circle">3</div></div>
          </div>
        </div>

        <form id="form-onboarding">
          ${stepHTML}
          
          <div class="flex justify-between items-center mt-6 pt-4" style="border-block-start: 1px solid var(--color-border);">
            <button type="button" id="btn-ob-back" class="btn btn-ghost" ${onboardingStep === 1 ? 'disabled' : ''}>Back</button>
            <button type="submit" class="btn btn-primary">${onboardingStep === 3 ? 'Complete Profile Onboarding' : 'Next Step'}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Handlers
  const form = root.querySelector('#form-onboarding');
  const btnBack = root.querySelector('#btn-ob-back');

  btnBack.addEventListener('click', () => {
    saveStepData();
    onboardingStep--;
    render();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveStepData();

    if (onboardingStep < 3) {
      onboardingStep++;
      render();
    } else {
      // Complete: Register Student in Store
      const newStudent = {
        id: `stu_${Date.now()}`,
        role: 'student',
        name: onboardingData.name,
        school: onboardingData.school,
        grade: onboardingData.grade,
        city: onboardingData.city,
        careerInterests: onboardingData.careerInterests,
        intendedDegree: onboardingData.intendedDegree,
        dreamColleges: onboardingData.dreamColleges,
        skills: onboardingData.skills,
        socialLinks: {},
        avatar: null,
        achievements: [],
        grades: { gpa: 8.5, board: 'CBSE' }, // default seed GPA
        streakDays: 1,
        lastActivity: Date.now(),
        followers: [],
        following: [],
        savedProfiles: [],
        contactRequests: [],
        isPublic: true,
        createdAt: Date.now()
      };

      store.state.students.push(newStudent);
      store.state.activeUserId = newStudent.id;
      store._save();
      store._notify();

      isOnboarding = false;
      currentTab = 'dashboard';
      triggerToast('Registration complete! Welcome to ProfileED.', 'success');
    }
  });

  function saveStepData() {
    if (onboardingStep === 1) {
      onboardingData.name = root.querySelector('#ob-name').value;
      onboardingData.school = root.querySelector('#ob-school').value;
      onboardingData.grade = parseInt(root.querySelector('#ob-grade').value);
      onboardingData.city = root.querySelector('#ob-city').value;
    } else if (onboardingStep === 2) {
      onboardingData.intendedDegree = root.querySelector('#ob-degree').value;
      onboardingData.careerInterests = Array.from(root.querySelectorAll('.ob-interest-cb:checked')).map(cb => cb.value);
    } else if (onboardingStep === 3) {
      onboardingData.skills = root.querySelector('#ob-skills').value.split(',').map(s => s.trim()).filter(Boolean);
      onboardingData.dreamColleges = root.querySelector('#ob-dream').value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
}

// -------------------------------------------------------------
// MAIN APP SHELL
// -------------------------------------------------------------
function renderAppShell(root, user) {
  // Navigation tabs config based on user role
  let navHTML = '';
  if (user.role === 'student') {
    navHTML = `
      <button class="nav-item ${currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
        <span class="nav-icon"></span> Dashboard
      </button>
      <button class="nav-item ${currentTab === 'achievements' ? 'active' : ''}" data-tab="achievements">
        <span class="nav-icon"></span> Portfolio Log
      </button>
      <button class="nav-item ${currentTab === 'colleges' ? 'active' : ''}" data-tab="colleges">
        <span class="nav-icon"></span> AI Matches
      </button>
      <button class="nav-item ${currentTab === 'discovery' ? 'active' : ''}" data-tab="discovery">
        <span class="nav-icon"></span> Discovery
      </button>
      <button class="nav-item ${currentTab === 'inbox' ? 'active' : ''}" data-tab="inbox">
        <span class="nav-icon"></span> Messages Inbox
      </button>
    `;
  } else if (user.role === 'counselor') {
    navHTML = `
      <button class="nav-item ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
        <span class="nav-icon"></span> School Overview
      </button>
      <button class="nav-item ${currentTab === 'monitoring' ? 'active' : ''}" data-tab="monitoring">
        <span class="nav-icon"></span> Student Monitoring
      </button>
      <button class="nav-item ${currentTab === 'reporting' ? 'active' : ''}" data-tab="reporting">
        <span class="nav-icon"></span> Guidance Reports
      </button>
    `;
  } else if (user.role === 'college_admin' || user.role === 'college_employee') {
    const isAdmin = user.role === 'college_admin';
    navHTML = `
      <button class="nav-item ${currentTab === 'profile' ? 'active' : ''}" data-tab="profile">
        <span class="nav-icon"></span> College Profile
      </button>
      <button class="nav-item ${currentTab === 'matching' ? 'active' : ''}" data-tab="matching">
        <span class="nav-icon"></span> Student Matches
      </button>
      ${isAdmin ? `
        <button class="nav-item ${currentTab === 'targeting' ? 'active' : ''}" data-tab="targeting">
          <span class="nav-icon"></span> Target Preferences
        </button>
        <button class="nav-item ${currentTab === 'employees' ? 'active' : ''}" data-tab="employees">
          <span class="nav-icon"></span> Manage Employees
        </button>
      ` : ''}
    `;
  }

  // Roster profiles for quick role switcher (evaluation/judges convenience)
  const allSwitchUsers = [
    { id: 'stu_001', name: 'Aanya (Student)', role: 'Student' },
    { id: 'cou_001', name: 'Ms. Deepa (Counselor)', role: 'Counselor' },
    { id: 'col_001', name: 'Ashoka (University Admin)', role: 'Admissions' },
    { id: 'emp_001', name: 'Vikram (University Employee)', role: 'Admissions staff' }
  ];

  const roleSwitcherHTML = `
    <div class="role-switcher">
      ${allSwitchUsers.map(u => `
        <button class="role-btn ${user.id === u.id ? 'active' : ''}" data-user-id="${u.id}">
          ${u.name}
        </button>
      `).join('')}
    </div>
  `;

  // Initials for avatar
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';

  root.innerHTML = `
    <div class="app-shell">
      <!-- LEFT SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-mark">P</div>
          <span class="logo-text">ProfileED</span>
        </div>
        <nav class="sidebar-nav">
          <span class="nav-section-label">Guidance Hub</span>
          ${navHTML}
        </nav>
        <div class="sidebar-user">
          <div class="avatar avatar-md font-bold">${initials}</div>
          <div style="min-width: 0; flex: 1;">
            <h5 class="text-sm font-semibold truncate">${user.name}</h5>
            <p class="text-xs text-muted truncate">${user.role.replace('_', ' ')}</p>
          </div>
          <button id="btn-logout" class="btn btn-ghost btn-icon btn-sm" title="Log Out">✕</button>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <main class="main-content">
        <!-- TOPBAR -->
        <header class="topbar">
          <h3 id="topbar-title" class="font-bold flex-1" style="text-transform: capitalize;">${currentTab.replace('-', ' ')}</h3>
          
          <!-- QUICK EVALUATION SELECTOR -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted font-medium">Switch Session:</span>
            ${roleSwitcherHTML}
          </div>

          <div style="position: relative;">
            <button id="btn-notifications" class="btn btn-ghost btn-icon" style="position: relative;">
              <span></span>
              ${store.getUnreadCount(user.id) > 0 ? `<div class="notif-dot"></div>` : ''}
            </button>
            <div id="notif-dropdown" class="card hidden" style="position: absolute; top: 48px; right: 0; width: 280px; z-index: 50; max-height: 300px; overflow-y: auto;">
              <div class="card-header" style="padding: var(--space-3) var(--space-4);">
                <span class="text-xs font-bold">Recent Alerts</span>
              </div>
              <div class="card-body flex flex-col gap-2" style="padding: var(--space-3) var(--space-4);" id="notif-dropdown-body">
                <!-- Notifications loaded here -->
              </div>
            </div>
          </div>

          <div class="avatar avatar-sm font-bold">${initials}</div>
        </header>

        <!-- PAGE SCROLL VIEW -->
        <div class="page-content" id="page-content-view">
          <!-- Dynamic components mount here -->
        </div>
      </main>
    </div>
  `;

  // Attach nav handlers
  root.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.getAttribute('data-tab');
      render();
    });
  });

  // Switcher triggers
  root.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uId = btn.getAttribute('data-user-id');
      store.switchRole(uId);
      const switchedUser = store.getActiveUser();
      
      // Update defaults
      if (switchedUser.role === 'student') currentTab = 'dashboard';
      else if (switchedUser.role === 'counselor') currentTab = 'overview';
      else if (switchedUser.role === 'college_admin' || switchedUser.role === 'college_employee') currentTab = 'profile';
      
      triggerToast(`Switched active session to: ${switchedUser.name}`, 'info');
      render();
    });
  });

  root.querySelector('#btn-logout').addEventListener('click', () => {
    store.logout();
    triggerToast('Logged out successfully.', 'info');
  });

  // Notification dropdown trigger
  const notifBtn = root.querySelector('#btn-notifications');
  const notifDropdown = root.querySelector('#notif-dropdown');
  
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = notifDropdown.classList.contains('hidden');
    
    if (isHidden) {
      notifDropdown.classList.remove('hidden');
      loadNotifications(user.id);
      store.markNotificationsRead(user.id);
      // Remove dot
      const dot = notifBtn.querySelector('.notif-dot');
      if (dot) dot.remove();
    } else {
      notifDropdown.classList.add('hidden');
    }
  });

  document.addEventListener('click', () => {
    if (notifDropdown) notifDropdown.classList.add('hidden');
  });

  function loadNotifications(userId) {
    const list = store.state.notifications.filter(n => n.userId === userId);
    const body = root.querySelector('#notif-dropdown-body');
    if (list.length === 0) {
      body.innerHTML = '<span class="text-xs text-muted text-center py-4">No recent notifications.</span>';
      return;
    }
    body.innerHTML = list.map(n => `
      <div class="pb-2 text-xs" style="border-block-end: 1px solid var(--color-border); margin-block-end: var(--space-2);">
        <p>${n.text}</p>
        <span class="text-muted" style="font-size: 9px;">${new Date(n.createdAt).toLocaleTimeString()}</span>
      </div>
    `).join('');
  }

  // Mount specific dashboard views
  const viewContainer = root.querySelector('#page-content-view');
  if (user.role === 'student') {
    renderStudentDashboard(viewContainer, currentTab, triggerToast);
  } else if (user.role === 'counselor') {
    renderCounselorDashboard(viewContainer, currentTab, triggerToast);
  } else if (user.role === 'college_admin' || user.role === 'college_employee') {
    renderCollegeDashboard(viewContainer, currentTab, triggerToast);
  }
}

// -------------------------------------------------------------
// INITIALIZE APPLICATION
// -------------------------------------------------------------
store.subscribe(() => {
  render();
});

// Run initial boot
render();
