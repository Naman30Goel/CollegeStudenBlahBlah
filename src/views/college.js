import { store } from '../store/index.js';
import { computeProfileStrength, matchStudentsForCollege } from '../store/ai-engine.js';

export function renderCollegeDashboard(container, activeTab, triggerToast) {
  const activeUser = store.getActiveUser();
  let college = null;
  let isEmployee = false;

  if (!activeUser) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No active session found.</h3></div>';
    return;
  }

  if (activeUser.role === 'college_admin') {
    college = activeUser;
  } else if (activeUser.role === 'college_employee') {
    college = store.state.colleges.find(c => c.id === activeUser.collegeId);
    isEmployee = true;
  }

  if (!college) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No associated college found for your session.</h3></div>';
    return;
  }

  if (activeTab === 'profile') {
    renderProfileTab(container, college, isEmployee, triggerToast);
  } else if (activeTab === 'targeting') {
    renderTargetingTab(container, college, triggerToast);
  } else if (activeTab === 'matching') {
    renderMatchingTab(container, college, triggerToast);
  } else if (activeTab === 'employees') {
    renderEmployeesTab(container, college, isEmployee, triggerToast);
  }
}

// -------------------------------------------------------------
// 1. COLLEGE PROFILE TAB
// -------------------------------------------------------------
function renderProfileTab(container, college, isEmployee, triggerToast) {
  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">College Admissions Profile</h2>
          <p class="section-subtitle">Manage details that high school students see when browsing campuses.</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="font-bold">Campus General Info</h3>
          </div>
          <form id="form-college-profile">
            <div class="card-body flex flex-col gap-4">
              <div class="input-group">
                <label class="input-label" for="col-name">University Name</label>
                <input class="input" type="text" id="col-name" value="${college.name}" ${isEmployee ? 'disabled' : 'required'}>
              </div>
              <div class="input-group">
                <label class="input-label" for="col-desc">Brief Description</label>
                <textarea class="input" id="col-desc" ${isEmployee ? 'disabled' : 'required'}>${college.description}</textarea>
              </div>
              <div class="grid-2">
                <div class="input-group">
                  <label class="input-label" for="col-fees">Annual Tuition Fees</label>
                  <input class="input" type="text" id="col-fees" value="${college.fees}" ${isEmployee ? 'disabled' : ''}>
                </div>
                <div class="input-group">
                  <label class="input-label" for="col-deadline">Application Deadline</label>
                  <input class="input" type="date" id="col-deadline" value="${college.applicationDeadline}" ${isEmployee ? 'disabled' : ''}>
                </div>
              </div>
            </div>
            ${!isEmployee ? `
              <div class="card-footer flex justify-end">
                <button type="submit" class="btn btn-primary">Save Profile Info</button>
              </div>
            ` : ''}
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="font-bold">Academic details & Placement</h3>
          </div>
          <form id="form-college-details">
            <div class="card-body flex flex-col gap-4">
              <div class="input-group">
                <label class="input-label" for="col-programs">Programs Offered (comma separated)</label>
                <input class="input" type="text" id="col-programs" value="${college.programs.join(', ')}" ${isEmployee ? 'disabled' : ''}>
              </div>
              <div class="input-group">
                <label class="input-label" for="col-scholarships">Scholarship Programs (comma separated)</label>
                <input class="input" type="text" id="col-scholarships" value="${college.scholarships.join(', ')}" ${isEmployee ? 'disabled' : ''}>
              </div>
              <div class="input-group">
                <label class="input-label" for="col-placement">Placement & Career Metrics</label>
                <textarea class="input" id="col-placement" ${isEmployee ? 'disabled' : ''}>${college.placement}</textarea>
              </div>
            </div>
            ${!isEmployee ? `
              <div class="card-footer flex justify-end">
                <button type="submit" class="btn btn-primary">Save Academic Details</button>
              </div>
            ` : ''}
          </form>
        </div>
      </div>
    </div>
  `;

  if (!isEmployee) {
    container.querySelector('#form-college-profile').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#col-name').value;
      const description = container.querySelector('#col-desc').value;
      const fees = container.querySelector('#col-fees').value;
      const applicationDeadline = container.querySelector('#col-deadline').value;

      store.updateCollege(college.id, { name, description, fees, applicationDeadline });
      triggerToast('General campus settings updated.', 'success');
    });

    container.querySelector('#form-college-details').addEventListener('submit', (e) => {
      e.preventDefault();
      const programs = container.querySelector('#col-programs').value.split(',').map(s => s.trim()).filter(Boolean);
      const scholarships = container.querySelector('#col-scholarships').value.split(',').map(s => s.trim()).filter(Boolean);
      const placement = container.querySelector('#col-placement').value;

      store.updateCollege(college.id, { programs, scholarships, placement });
      triggerToast('Academic profile details updated.', 'success');
    });
  }
}

// -------------------------------------------------------------
// 2. STUDENT TARGETING PREFERENCES TAB
// -------------------------------------------------------------
function renderTargetingTab(container, college, triggerToast) {
  const prefs = college.targetPrefs || { minGPA: 8.0, grades: [11, 12], interests: [], minScore: 60 };

  const allInterests = [
    'Technology', 'Engineering', 'Robotics', 'Business', 'Finance', 
    'Entrepreneurship', 'Design', 'Arts', 'Liberal Arts', 'Social Sciences', 'Medicine', 'Biology'
  ];

  let interestsCheckboxesHTML = allInterests.map(interest => {
    const checked = prefs.interests.includes(interest) ? 'checked' : '';
    return `
      <label class="flex items-center gap-2 text-sm text-secondary" style="cursor: pointer;">
        <input type="checkbox" name="target-interests" value="${interest}" ${checked}>
        <span>${interest}</span>
      </label>
    `;
  }).join('');

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">Target Student Preferences</h2>
          <p class="section-subtitle">Set filtering criteria to target high school students in search matches.</p>
        </div>
      </div>

      <div class="card" style="max-width: 800px;">
        <div class="card-header">
          <h3 class="font-bold">Match Engine Filters</h3>
        </div>
        <form id="form-targeting-prefs">
          <div class="card-body flex flex-col gap-6">
            
            <!-- GRADE LEVEL -->
            <div class="input-group">
              <label class="input-label">Target Grade Levels</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 text-sm" style="cursor: pointer;">
                  <input type="checkbox" name="target-grades" value="10" ${prefs.grades.includes(10) ? 'checked' : ''}> Grade 10
                </label>
                <label class="flex items-center gap-2 text-sm" style="cursor: pointer;">
                  <input type="checkbox" name="target-grades" value="11" ${prefs.grades.includes(11) ? 'checked' : ''}> Grade 11
                </label>
                <label class="flex items-center gap-2 text-sm" style="cursor: pointer;">
                  <input type="checkbox" name="target-grades" value="12" ${prefs.grades.includes(12) ? 'checked' : ''}> Grade 12
                </label>
              </div>
            </div>

            <!-- ACADEMIC RANGE SLIDERS -->
            <div class="grid-2">
              <div class="input-group">
                <div class="flex justify-between">
                  <label class="input-label" for="pref-gpa">Minimum High School GPA (Out of 10.0)</label>
                  <span class="text-sm font-bold text-primary" id="gpa-val">${prefs.minGPA}</span>
                </div>
                <input class="input" type="range" id="pref-gpa" min="5.0" max="10.0" step="0.1" value="${prefs.minGPA}" style="padding: 0;">
              </div>
              
              <div class="input-group">
                <div class="flex justify-between">
                  <label class="input-label" for="pref-score">Minimum Profile Strength Score</label>
                  <span class="text-sm font-bold text-primary" id="score-val">${prefs.minScore}</span>
                </div>
                <input class="input" type="range" id="pref-score" min="10" max="100" step="5" value="${prefs.minScore}" style="padding: 0;">
              </div>
            </div>

            <div class="divider"></div>

            <!-- CAREER/MAJOR FOCUS -->
            <div class="input-group">
              <label class="input-label">Target Focus Fields / Interests</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-2);">
                ${interestsCheckboxesHTML}
              </div>
            </div>

          </div>
          <div class="card-footer flex justify-end">
            <button type="submit" class="btn btn-primary">Save Targeting Matrix</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Dynamics
  const gpaInput = container.querySelector('#pref-gpa');
  const gpaVal = container.querySelector('#gpa-val');
  gpaInput.addEventListener('input', () => gpaVal.innerText = gpaInput.value);

  const scoreInput = container.querySelector('#pref-score');
  const scoreVal = container.querySelector('#score-val');
  scoreInput.addEventListener('input', () => scoreVal.innerText = scoreInput.value);

  container.querySelector('#form-targeting-prefs').addEventListener('submit', (e) => {
    e.preventDefault();
    const minGPA = parseFloat(gpaInput.value);
    const minScore = parseInt(scoreInput.value);
    
    const grades = [];
    container.querySelectorAll('input[name="target-grades"]:checked').forEach(cb => {
      grades.push(parseInt(cb.value));
    });

    const interests = [];
    container.querySelectorAll('input[name="target-interests"]:checked').forEach(cb => {
      interests.push(cb.value);
    });

    store.updateCollege(college.id, {
      targetPrefs: { minGPA, minScore, grades, interests }
    });

    triggerToast('Target student match matrix updated!', 'success');
  });
}

// -------------------------------------------------------------
// 3. STUDENT MATCH LIST TAB
// -------------------------------------------------------------
function renderMatchingTab(container, college, triggerToast) {
  // Compute matched students based on targeting matrix
  const matched = matchStudentsForCollege(college, store.state.students);

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">ProfileED Match Recommendations</h2>
          <p class="section-subtitle">Top high school students who match your GPA boundaries, grades, and interest targets.</p>
        </div>
      </div>

      <div class="grid-3">
        ${matched.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1;">
            <div class="empty-state">
              <div class="empty-icon">👥</div>
              <h3>No students meet your targeting filters</h3>
              <p>Try widening your GPA or Profile Strength filters in the Targeting tab.</p>
            </div>
          </div>
        ` : matched.map(stu => {
          const profileStrength = computeProfileStrength(stu);
          const alreadySent = college.sentRequests.includes(stu.id);

          return `
            <div class="match-card">
              <div class="match-card-header">
                <div>
                  <h3 class="font-bold text-base">${stu.name}</h3>
                  <span class="text-xs text-muted">Grade ${stu.grade} • ${stu.school}</span>
                </div>
                <div class="match-score-pill high">
                  ⚡ ${stu.matchScore}% Match
                </div>
              </div>
              <div class="card-body flex-1 flex flex-col gap-3">
                <div class="flex justify-between text-xs">
                  <span>GPA: <strong>${stu.grades?.gpa || 'N/A'}</strong></span>
                  <span>Profile Score: <strong class="text-success">${profileStrength}</strong></span>
                </div>

                <div class="flex flex-col gap-1 mt-2">
                  <span class="text-xs font-semibold text-muted">Interests & Skills</span>
                  <div class="tag-list">
                    ${stu.careerInterests.map(i => `<span class="badge badge-slate" style="font-size: 9px;">${i}</span>`).join('')}
                    ${stu.skills.slice(0, 2).map(s => `<span class="badge badge-indigo" style="font-size: 9px;">${s}</span>`).join('')}
                  </div>
                </div>
              </div>
              <div class="card-footer flex gap-2">
                ${alreadySent ? `
                  <button class="btn btn-secondary btn-sm w-full" disabled>✉️ Invitation Sent</button>
                ` : `
                  <button class="btn btn-primary btn-sm w-full btn-open-invite" data-id="${stu.id}">Connect</button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- INVITATION DIALOG -->
      <dialog id="dialog-invite">
        <div class="dialog-header">
          <h3 class="font-bold">Contact Student representative</h3>
          <button id="dialog-inv-close" class="btn btn-ghost btn-icon btn-sm">✕</button>
        </div>
        <form id="form-invite-student">
          <div class="dialog-body">
            <p class="text-xs text-secondary mb-4">Under ProfileED privacy rules, students must review and approve your communication request before message exchange is enabled.</p>
            <div class="input-group">
              <label class="input-label" for="inv-type">Request Channel Type</label>
              <select class="input select" id="inv-type" required>
                <option value="brochure">Share Digital Brochure</option>
                <option value="meeting">Schedule Virtual Info Meeting</option>
                <option value="application">Direct Application Invite</option>
                <option value="interest">General Interest Connection</option>
              </select>
            </div>
            <div class="input-group">
              <label class="input-label" for="inv-msg">Personalized Introduction Message</label>
              <textarea class="input" id="inv-msg" required>We reviewed your achievements on ProfileED and think you would be a great fit for our programs. Let's schedule an introductory chat.</textarea>
            </div>
          </div>
          <div class="dialog-footer">
            <button type="button" id="btn-inv-cancel" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Send Interest Request</button>
          </div>
        </form>
      </dialog>
    </div>
  `;

  // Handlers
  const dialog = container.querySelector('#dialog-invite');
  const btnClose = container.querySelector('#dialog-inv-close');
  const btnCancel = container.querySelector('#btn-inv-cancel');
  const form = container.querySelector('#form-invite-student');
  let selectedStudentId = null;

  btnClose.addEventListener('click', () => dialog.close());
  btnCancel.addEventListener('click', () => dialog.close());

  container.querySelectorAll('.btn-open-invite').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedStudentId = btn.getAttribute('data-id');
      dialog.showModal();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const type = container.querySelector('#inv-type').value;
    const msg = container.querySelector('#inv-msg').value;

    store.sendContactRequest(college.id, selectedStudentId, type, msg);
    dialog.close();
    triggerToast('Contact request sent! Student has been notified.', 'success');
    renderMatchingTab(container, college, triggerToast);
  });
}

// -------------------------------------------------------------
// 4. EMPLOYEE MANAGEMENT TAB
// -------------------------------------------------------------
function renderEmployeesTab(container, college, isEmployee, triggerToast) {
  // Get employees assigned to college
  const employees = store.state.employees.filter(e => e.collegeId === college.id);

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">Authorized Admissions Representatives</h2>
          <p class="section-subtitle">Manage admissions officers, outreach marketers, and student counselors representing your college.</p>
        </div>
        ${!isEmployee ? `
          <button id="btn-add-employee" class="btn btn-primary">
            <span>➕</span> Invite representative
          </button>
        ` : ''}
      </div>

      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Representative Name</th>
              <th>Work Email</th>
              <th>Admissions Role</th>
              ${!isEmployee ? '<th>Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${employees.length === 0 ? `
              <tr><td colspan="4" class="text-center text-muted p-8">No employees invited.</td></tr>
            ` : employees.map(emp => `
              <tr>
                <td><strong>${emp.name}</strong></td>
                <td>${emp.email}</td>
                <td><span class="badge badge-indigo">${emp.jobRole}</span></td>
                ${!isEmployee ? `
                  <td>
                    <button class="btn btn-ghost btn-sm text-error btn-revoke-emp" data-id="${emp.id}">Revoke Seat</button>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- EMPLOYEE DIALOG -->
      <dialog id="dialog-employee">
        <div class="dialog-header">
          <h3 class="font-bold">Invite Admissions representative</h3>
          <button id="dialog-emp-close" class="btn btn-ghost btn-icon btn-sm">✕</button>
        </div>
        <form id="form-invite-employee">
          <div class="dialog-body">
            <div class="input-group">
              <label class="input-label" for="emp-name">Employee Full Name</label>
              <input class="input" type="text" id="emp-name" placeholder="e.g. Vikram Nair" required>
            </div>
            <div class="input-group">
              <label class="input-label" for="emp-email">Outreach / School Email</label>
              <input class="input" type="email" id="emp-email" placeholder="email@university.edu" required>
            </div>
            <div class="input-group">
              <label class="input-label" for="emp-role">Admissions Role</label>
              <select class="input select" id="emp-role" required>
                <option value="Admissions Officer">Admissions Officer</option>
                <option value="Counselor">Admissions Counselor</option>
                <option value="Marketing Representative">Marketing Representative</option>
              </select>
            </div>
          </div>
          <div class="dialog-footer">
            <button type="button" id="btn-emp-cancel" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Invite representative</button>
          </div>
        </form>
      </dialog>
    </div>
  `;

  if (!isEmployee) {
    const dialog = container.querySelector('#dialog-employee');
    const btnOpen = container.querySelector('#btn-add-employee');
    const btnClose = container.querySelector('#dialog-emp-close');
    const btnCancel = container.querySelector('#btn-emp-cancel');
    const form = container.querySelector('#form-invite-employee');

    btnOpen.addEventListener('click', () => dialog.showModal());
    btnClose.addEventListener('click', () => dialog.close());
    btnCancel.addEventListener('click', () => dialog.close());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#emp-name').value;
      const email = container.querySelector('#emp-email').value;
      const jobRole = container.querySelector('#emp-role').value;

      store.inviteEmployee(college.id, {
        name,
        email,
        jobRole,
        password: 'demo',
      });

      dialog.close();
      triggerToast('Outreach representative invited successfully!', 'success');
      renderEmployeesTab(container, college, isEmployee, triggerToast);
    });

    container.querySelectorAll('.btn-revoke-emp').forEach(btn => {
      btn.addEventListener('click', () => {
        const empId = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to revoke representative access? They will be locked out immediately.')) {
          store.revokeEmployee(college.id, empId);
          triggerToast('Representative seat revoked.', 'warning');
          renderEmployeesTab(container, college, isEmployee, triggerToast);
        }
      });
    });
  }
}
