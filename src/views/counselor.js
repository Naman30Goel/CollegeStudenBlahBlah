import { store } from '../store/index.js';
import { computeProfileStrength, getStrengthBreakdown, getCollegeRecommendations } from '../store/ai-engine.js';

export function renderCounselorDashboard(container, activeTab, triggerToast) {
  const counselor = store.getActiveUser();
  if (!counselor || counselor.role !== 'counselor') {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No active counselor session found.</h3></div>';
    return;
  }

  const students = store.state.students;
  const totalStudents = students.length;
  const activeStudents = students.filter(s => (Date.now() - (s.lastActivity || 0)) <= 7 * 86400000).length;
  
  const studentScores = students.map(s => computeProfileStrength(s));
  const avgCompletion = Math.round(studentScores.reduce((sum, s) => sum + s, 0) / (totalStudents || 1));
  
  // Readiness score: average of GPA * 10
  const avgGpa = students.reduce((sum, s) => sum + (s.grades?.gpa || 0), 0) / (totalStudents || 1);
  const avgReadiness = Math.round((avgGpa / 10) * 100);

  if (activeTab === 'overview') {
    renderOverviewTab(container, counselor, students, totalStudents, activeStudents, avgCompletion, avgReadiness, triggerToast);
  } else if (activeTab === 'monitoring') {
    renderMonitoringTab(container, students, triggerToast);
  } else if (activeTab === 'reporting') {
    renderReportingTab(container, students, avgCompletion, avgReadiness, triggerToast);
  }
}

// -------------------------------------------------------------
// 1. OVERVIEW TAB
// -------------------------------------------------------------
function renderOverviewTab(container, counselor, students, total, active, avgCompletion, avgReadiness, triggerToast) {
  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">Counselor Dashboard - ${counselor.school}</h2>
          <p class="section-subtitle">Monitor college application readiness, progress trends, and profile metrics.</p>
        </div>
      </div>

      <!-- COUNSELOR METRICS CARDS -->
      <div class="grid-4 mb-6">
        <div class="metric-card">
          <div class="metric-icon indigo">👥</div>
          <div>
            <div class="metric-value">${total}</div>
            <div class="metric-label">Total Assigned Students</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon blue">⚡</div>
          <div>
            <div class="metric-value">${active}</div>
            <div class="metric-label">Active This Week</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon emerald">📈</div>
          <div>
            <div class="metric-value">${avgCompletion}%</div>
            <div class="metric-label">Avg. Profile Strength</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon amber">🎓</div>
          <div>
            <div class="metric-value">${avgReadiness}/100</div>
            <div class="metric-label">College Readiness Score</div>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-6">
        <!-- RECENT ACTIVITY CARD -->
        <div class="card">
          <div class="card-header">
            <h3 class="font-bold">Recent Student Activities</h3>
          </div>
          <div class="card-body">
            <div class="flex flex-col gap-3">
              ${students.slice(0, 4).map(s => {
                const lastActStr = s.lastActivity ? new Date(s.lastActivity).toLocaleDateString() : 'Inactive';
                const latestAch = s.achievements.length > 0 ? s.achievements[s.achievements.length - 1].title : 'Updated profile details';
                return `
                  <div class="flex items-center justify-between pb-3" style="border-block-end: 1px solid var(--color-border); gap: var(--space-4);">
                    <div style="min-width: 0; flex: 1;">
                      <h5 class="text-sm font-semibold truncate">${s.name}</h5>
                      <p class="text-xs text-muted truncate">Action: ${latestAch}</p>
                    </div>
                    <span class="text-xs text-secondary" style="white-space: nowrap;">📅 ${lastActStr}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- READINESS DISTRIBUTION -->
        <div class="card">
          <div class="card-header">
            <h3 class="font-bold">Profile Strength Distribution</h3>
          </div>
          <div class="card-body flex flex-col gap-4">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-success">Strong Fit (Score > 70)</span>
                <span>${students.filter(s => computeProfileStrength(s) >= 70).length} students</span>
              </div>
              <div class="mini-progress"><div class="mini-progress-fill" style="width: ${(students.filter(s => computeProfileStrength(s) >= 70).length / students.length) * 100}%; background-color: var(--color-success);"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-warning">Moderate Fit (Score 40-70)</span>
                <span>${students.filter(s => { const sc = computeProfileStrength(s); return sc >= 40 && sc < 70; }).length} students</span>
              </div>
              <div class="mini-progress"><div class="mini-progress-fill" style="width: ${(students.filter(s => { const sc = computeProfileStrength(s); return sc >= 40 && sc < 70; }).length / students.length) * 100}%; background-color: var(--color-warning);"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-error">Attention Needed (Score < 40)</span>
                <span>${students.filter(s => computeProfileStrength(s) < 40).length} students</span>
              </div>
              <div class="mini-progress"><div class="mini-progress-fill" style="width: ${(students.filter(s => computeProfileStrength(s) < 40).length / students.length) * 100}%; background-color: var(--color-error);"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 2. MONITORING / ROSTER TAB
// -------------------------------------------------------------
function renderMonitoringTab(container, students, triggerToast) {
  const searchInputHTML = `
    <div class="search-bar mb-6 w-full">
      <span class="search-icon">🔍</span>
      <input type="text" id="roster-search" class="input" placeholder="Search students by name, career interests, intended major...">
    </div>
  `;

  const renderTableRows = (query = '') => {
    const tbody = container.querySelector('#roster-table-body');
    if (!tbody) return;

    const filtered = students.filter(s => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q) ||
        s.intendedDegree.toLowerCase().includes(q) ||
        s.careerInterests.some(i => i.toLowerCase().includes(q))
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-8">No students matching query.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      const score = computeProfileStrength(s);
      let badgeClass = 'low';
      if (score >= 70) badgeClass = 'high';
      else if (score >= 40) badgeClass = 'mid';

      const lastActStr = s.lastActivity ? new Date(s.lastActivity).toLocaleDateString() : 'Never';

      return `
        <tr class="roster-row" data-id="${s.id}" style="cursor: pointer;">
          <td><strong>${s.name}</strong></td>
          <td>Grade ${s.grade}</td>
          <td>${s.school}</td>
          <td><span class="score-badge ${badgeClass}">${score}</span></td>
          <td>${s.achievements.length}</td>
          <td>
            <button class="btn btn-ghost btn-sm btn-inspect-student" data-id="${s.id}">Inspect</button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row inspection handlers
    container.querySelectorAll('.roster-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        openInspectModal(id);
      });
    });
  };

  const openInspectModal = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const score = computeProfileStrength(student);
    const breakdown = getStrengthBreakdown(student);
    const collegeMatches = getCollegeRecommendations(student);

    const dialog = container.querySelector('#dialog-inspect-student');
    container.querySelector('#inspect-student-name').innerText = student.name;

    let achievementsHTML = student.achievements.length === 0
      ? '<p class="text-xs text-muted">No achievements uploaded yet.</p>'
      : student.achievements.map(ach => `
          <div class="pb-2" style="border-block-end: 1px solid var(--color-border); margin-block-end: var(--space-2);">
            <div class="flex justify-between items-center mb-1">
              <strong class="text-xs">${ach.title}</strong>
              <span class="badge badge-slate" style="font-size: 8px;">${ach.category}</span>
            </div>
            <p class="text-xs text-secondary">${ach.description}</p>
          </div>
        `).join('');

    let matchesHTML = collegeMatches.length === 0
      ? '<p class="text-xs text-muted">No AI college matches configured.</p>'
      : collegeMatches.slice(0, 3).map(m => `
          <div class="flex justify-between items-center text-xs py-1" style="border-block-end: 1px solid var(--color-border);">
            <span>${m.name}</span>
            <span class="text-success font-bold">${m.matchScore}% Match</span>
          </div>
        `).join('');

    container.querySelector('#inspect-student-body').innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
        <div>
          <h5 class="text-sm font-semibold mb-2">Profile Strengths</h5>
          <div class="w-full flex flex-col gap-2 mb-4">
            ${breakdown.map(item => `
              <div class="flex items-center justify-between text-xs">
                <span>${item.icon} ${item.label}</span>
                <span class="font-bold">${item.score}/${item.max}</span>
              </div>
            `).join('')}
          </div>

          <div class="divider"></div>

          <h5 class="text-sm font-semibold mb-2">Intended Career Paths</h5>
          <p class="text-xs text-secondary mb-1"><strong>Degree:</strong> ${student.intendedDegree}</p>
          <div class="tag-list mb-4">
            ${student.careerInterests.map(c => `<span class="badge badge-slate" style="font-size: 10px;">${c}</span>`).join('')}
          </div>

          <div class="divider"></div>

          <h5 class="text-sm font-semibold mb-2">Dream Colleges</h5>
          <div class="tag-list">
            ${student.dreamColleges.map(c => `<span class="badge badge-indigo" style="font-size: 10px;">${c}</span>`).join('')}
          </div>
        </div>

        <div>
          <h5 class="text-sm font-semibold mb-2">Achievements Log (${student.achievements.length})</h5>
          <div style="max-block-size: 180px; overflow-y: auto;">
            ${achievementsHTML}
          </div>

          <div class="divider"></div>

          <h5 class="text-sm font-semibold mb-2">Top AI Recommended Colleges</h5>
          <div class="flex flex-col gap-1">
            ${matchesHTML}
          </div>
        </div>
      </div>
    `;

    dialog.showModal();
  };

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">Student Progress Monitoring</h2>
          <p class="section-subtitle">Select a student record to review achievements portfolio, degree matching, and counselor tips.</p>
        </div>
      </div>

      ${searchInputHTML}

      <!-- ROSTER TABLE -->
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Grade</th>
              <th>High School</th>
              <th>Profile Score</th>
              <th>Achievements</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="roster-table-body">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>

      <!-- INSPECT STUDENT MODAL -->
      <dialog id="dialog-inspect-student" style="max-width: 760px;">
        <div class="dialog-header">
          <h3 id="inspect-student-name" class="font-bold">Student Profile Details</h3>
          <button id="dialog-inspect-close" class="btn btn-ghost btn-icon btn-sm">✕</button>
        </div>
        <div class="dialog-body" id="inspect-student-body">
          <!-- Populated dynamically -->
        </div>
        <div class="dialog-footer">
          <button id="dialog-inspect-cancel" class="btn btn-ghost">Close Window</button>
        </div>
      </dialog>
    </div>
  `;

  renderTableRows();

  const searchInput = container.querySelector('#roster-search');
  searchInput.addEventListener('input', (e) => {
    renderTableRows(e.target.value);
  });

  const dialog = container.querySelector('#dialog-inspect-student');
  container.querySelector('#dialog-inspect-close').addEventListener('click', () => dialog.close());
  container.querySelector('#dialog-inspect-cancel').addEventListener('click', () => dialog.close());
}

// -------------------------------------------------------------
// 3. REPORTING & EXPORT TAB
// -------------------------------------------------------------
function renderReportingTab(container, students, avgCompletion, avgReadiness, triggerToast) {
  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">Counseling Reports Center</h2>
          <p class="section-subtitle">Generate class performance logs and export PDF documents formatted for print.</p>
        </div>
        <button id="btn-export-pdf" class="btn btn-primary">
          <span>📄</span> Export to A4 PDF
        </button>
      </div>

      <div class="grid-3 mb-6">
        <div class="card" style="grid-column: span 3;">
          <div class="card-header">
            <h3 class="font-bold">Academic Readiness Roster Report</h3>
            <span class="badge badge-indigo">ConnectED School guidance</span>
          </div>
          <div class="card-body">
            <div id="print-area">
              <div class="print-only" style="display: none; margin-block-end: 20px; border-block-end: 2px solid #334155; padding-block-end: 15px;">
                <h1>ConnectED - Student Readiness Report</h1>
                <p>Generated by High School Counseling Department on ${new Date().toLocaleDateString()}</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); margin-block-start: 15px;">
                  <div><strong>Total Students:</strong> ${students.length}</div>
                  <div><strong>Avg Profile Strength:</strong> ${avgCompletion}%</div>
                  <div><strong>Avg College Readiness:</strong> ${avgReadiness}/100</div>
                </div>
              </div>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Grade</th>
                    <th>GPA</th>
                    <th>Intended Major</th>
                    <th>Profile score</th>
                    <th>Achievements</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(s => {
                    const score = computeProfileStrength(s);
                    return `
                      <tr>
                        <td><strong>${s.name}</strong></td>
                        <td>Grade ${s.grade}</td>
                        <td>${s.grades?.gpa || 'N/A'} (${s.grades?.board || ''})</td>
                        <td>${s.intendedDegree}</td>
                        <td><strong>${score}%</strong></td>
                        <td>${s.achievements.length} portfolio items</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // PDF Export trigger (utilizing native browser print formatted via CSS media print)
  container.querySelector('#btn-export-pdf').addEventListener('click', () => {
    triggerToast('Preparing report printer settings. Click print or save as PDF.', 'success');
    setTimeout(() => {
      window.print();
    }, 500);
  });
}
