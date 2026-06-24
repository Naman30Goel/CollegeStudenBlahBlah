import { store } from '../store/index.js';
import { computeProfileStrength, getStrengthBreakdown, getCollegeRecommendations, getCourseRecommendations, getProfileFeedback } from '../store/ai-engine.js';

export function renderStudentDashboard(container, activeTab, triggerToast) {
  const student = store.getActiveUser();
  if (!student || student.role !== 'student') {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No active student session found.</h3></div>';
    return;
  }

  // Refresh computed scores
  const profileScore = computeProfileStrength(student);
  const breakdown = getStrengthBreakdown(student);
  const collegeMatches = getCollegeRecommendations(student);
  const courseMatches = getCourseRecommendations(student);
  const feedback = getProfileFeedback(student);

  // Active contact requests count
  const approvedRequests = store.state.communications.filter(c => c.toStudentId === student.id && c.status === 'approved').length;
  const pendingRequests = store.state.communications.filter(c => c.toStudentId === student.id && c.status === 'pending').length;

  if (activeTab === 'dashboard') {
    renderDashboardTab(container, student, profileScore, breakdown, collegeMatches, courseMatches, feedback, approvedRequests, pendingRequests, triggerToast);
  } else if (activeTab === 'achievements') {
    renderAchievementsTab(container, student, triggerToast);
  } else if (activeTab === 'colleges') {
    renderCollegesTab(container, student, collegeMatches, triggerToast);
  } else if (activeTab === 'discovery') {
    renderDiscoveryTab(container, student, triggerToast);
  } else if (activeTab === 'inbox') {
    renderInboxTab(container, student, triggerToast);
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD TAB
// -------------------------------------------------------------
function renderDashboardTab(container, student, score, breakdown, colleges, courses, feedback, approvedCount, pendingCount, triggerToast) {
  // Generate random data for GitHub-style heatmap (84 cells = 12 weeks)
  let heatmapHTML = '';
  // Let's seed the heatmap with some active days based on student achievements and random variance
  const seed = student.name.charCodeAt(0) + student.achievements.length;
  for (let i = 0; i < 84; i++) {
    // Determine cell intensity: 0 (gray), 1 (light green), 2 (medium green), 3 (dark green)
    let intensity = 0;
    const r = Math.sin(seed + i) * 10;
    if (r > 7) intensity = 3;
    else if (r > 4) intensity = 2;
    else if (r > 1) intensity = 1;
    
    // Highlight today (last cell)
    if (i === 83 && student.streakDays > 0) {
      intensity = 3;
    }

    let colorClass = 'cell-empty';
    if (intensity === 1) colorClass = 'cell-low';
    if (intensity === 2) colorClass = 'cell-medium';
    if (intensity === 3) colorClass = 'cell-high';

    heatmapHTML += `<div class="heatmap-cell ${colorClass}" title="Activity Level: ${intensity}"></div>`;
  }

  // Determine circular badge color
  let scoreColorClass = 'low';
  if (score >= 70) scoreColorClass = 'high';
  else if (score >= 40) scoreColorClass = 'mid';

  // SVG dash array calculation (circumference of 120px ring is 2 * pi * 55 = 345.5)
  const strokeDashoffset = Math.max(0, 345.5 - (345.5 * score) / 100);

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <!-- HERO MISSION CONTROL CENTER (Sparingly Glassmorphic) -->
      <div class="hero-mission-control mb-6">
        <div class="hero-left">
          <span class="badge badge-indigo mb-2">Welcome Back, ${student.name}</span>
          <h1 class="text-3xl font-extrabold mb-2" style="color: white; line-height: 1.1;">Build Your Student Profile.<br>Get Discovered By Top Colleges.</h1>
          <p style="color: rgb(255 255 255 / 0.85); font-size: var(--text-sm);">Track your growth, review tailored match lists, and communicate with admissions representatives.</p>
        </div>
        <div class="hero-stats-grid">
          <div class="hero-stat-card">
            <span class="hero-stat-value">${score}%</span>
            <span class="hero-stat-label">Profile Strength</span>
          </div>
          <div class="hero-stat-card">
            <span class="hero-stat-value">${colleges.length}</span>
            <span class="hero-stat-label">College Matches</span>
          </div>
          <div class="hero-stat-card">
            <span class="hero-stat-value">${student.achievements.length}</span>
            <span class="hero-stat-label">Achievements</span>
          </div>
          <div class="hero-stat-card">
            <span class="hero-stat-value">${approvedCount + pendingCount}</span>
            <span class="hero-stat-label">Colleges Interested</span>
          </div>
        </div>
      </div>

      <div class="grid-3 mb-6">
        <!-- PROFILE STRENGTH RING WIDGET -->
        <div class="strength-widget">
          <h3 class="font-bold text-center" style="font-size: var(--text-base);">Profile Completion</h3>
          <div class="strength-ring">
            <svg>
              <circle class="strength-ring-track" cx="70" cy="70" r="55"></circle>
              <circle class="strength-ring-fill ${scoreColorClass}" cx="70" cy="70" r="55" 
                      style="stroke-dasharray: 345.5; stroke-dashoffset: ${strokeDashoffset};"></circle>
            </svg>
            <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span class="score-badge ${scoreColorClass}" style="font-size: 1.75rem;">${score}</span>
              <span style="font-size: var(--text-xs); color: var(--color-text-secondary); font-weight: var(--weight-medium);">of 100</span>
            </div>
          </div>
          <div class="w-full flex flex-col gap-2 mt-2">
            ${breakdown.map(item => `
              <div class="flex items-center justify-between">
                <span class="text-sm flex items-center gap-2"><span>${item.icon}</span> ${item.label}</span>
                <div class="flex items-center gap-2">
                  <div class="mini-progress" style="width: 80px;">
                    <div class="mini-progress-fill" style="width: ${(item.score / item.max) * 100}%; background-color: var(--color-success);"></div>
                  </div>
                  <span class="breakdown-score">${item.score}/${item.max}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- PROFILE FEEDBACK / ADVICE -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div class="card-header">
            <h3 class="font-bold flex items-center gap-2"><span>✨</span> AI Profile Insights</h3>
          </div>
          <div class="card-body flex-1 flex flex-col gap-3">
            ${feedback.map(item => `
              <div class="feedback-item ${item.type}">
                <span>${item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : '💡'}</span>
                <p class="text-sm">${item.text}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- STREAK BADGES -->
        <div class="card">
          <div class="card-header">
            <h3 class="font-bold">Unlocked Badges</h3>
          </div>
          <div class="card-body flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="badge-icon-wrap ${student.streakDays >= 7 ? 'active' : ''}">🏆</div>
              <div>
                <h5 class="text-sm font-semibold">7 Day Streak</h5>
                <p class="text-xs text-muted">Maintain activity for 7 consecutive days.</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="badge-icon-wrap ${student.streakDays >= 30 ? 'active' : ''}">🔥</div>
              <div>
                <h5 class="text-sm font-semibold">30 Day Streak</h5>
                <p class="text-xs text-muted">Maintain activity for 30 consecutive days.</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="badge-icon-wrap ${student.streakDays >= 100 ? 'active' : ''}">🚀</div>
              <div>
                <h5 class="text-sm font-semibold">100 Day Streak</h5>
                <p class="text-xs text-muted">Complete 100 consecutive days of growth.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DREAM COLLEGES & COURSE RECOMMENDATIONS GRID -->
      <div class="grid-3 mb-6">
        <!-- DREAM COLLEGES CARD -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div class="card-header">
            <h3 class="font-bold flex items-center gap-2"><span>🏫</span> My Dream Colleges</h3>
          </div>
          <div class="card-body flex-1 flex flex-col gap-1">
            ${(student.dreamColleges || []).length === 0 ? `
              <div class="text-center text-muted text-xs p-4">No dream colleges added to your profile.</div>
            ` : (student.dreamColleges || []).map(dcName => {
              const match = colleges.find(c => c.name.toLowerCase().includes(dcName.toLowerCase()) || dcName.toLowerCase().includes(c.name.toLowerCase()));
              const matchScoreHTML = match 
                ? `<span class="badge badge-emerald">${match.matchScore}% Fit</span>` 
                : `<span class="badge badge-slate">Calculating</span>`;
              return `
                <div class="flex items-center justify-between pb-3" style="border-block-end: 1px solid var(--color-border); margin-block-end: var(--space-3);">
                  <div class="flex items-center gap-2" style="min-width: 0;">
                    <span style="font-size: 1.25rem; flex-shrink: 0;">🏛️</span>
                    <div style="min-width: 0;">
                      <h5 class="text-sm font-semibold truncate" style="max-width: 130px;">${dcName}</h5>
                    </div>
                  </div>
                  ${matchScoreHTML}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- COURSE RECOMMENDATIONS -->
        <div class="card" style="grid-column: span 2;">
          <div class="card-header">
            <h3 class="font-bold flex items-center gap-2"><span>📚</span> AI Suggested Degree Programs</h3>
            <span class="text-xs text-muted">Based on your skills & achievements</span>
          </div>
          <div class="card-body">
            <div class="grid-2">
              ${courses.map(course => `
                <div class="course-card">
                  <div class="course-icon">${course.icon}</div>
                  <h4 class="font-bold text-base mt-2">${course.name}</h4>
                  <p class="text-xs text-secondary mt-1 flex-1">${course.description}</p>
                  <div class="course-skills-list mt-2">
                    ${course.skills.slice(0, 3).map(skill => `<span class="badge badge-slate">${skill}</span>`).join('')}
                  </div>
                  <div style="margin-block-start: var(--space-4); display: flex; align-items: center; justify-content: space-between;">
                    <span class="text-xs font-semibold text-primary">Match score</span>
                    <span class="badge badge-emerald">${course.matchScore}% Match</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 2. ACHIEVEMENTS TAB
// -------------------------------------------------------------
function renderAchievementsTab(container, student, triggerToast) {
  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">Academic & Extracurricular Portfolio</h2>
          <p class="section-subtitle">Manage your verified credentials, awards, and certifications.</p>
        </div>
        <button id="btn-add-achievement" class="btn btn-primary">
          <span>➕</span> Add Achievement
        </button>
      </div>

      <div class="grid-auto">
        ${student.achievements.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1;">
            <div class="empty-state">
              <div class="empty-icon">🎖️</div>
              <h3>No achievements uploaded yet</h3>
              <p>Add certificates, competitions, and leadership roles to boost your college match score.</p>
            </div>
          </div>
        ` : student.achievements.map(ach => `
          <div class="card">
            <div class="card-header">
              <span class="badge ${getCategoryBadgeColor(ach.category)}">${ach.category}</span>
              <button class="btn-delete-ach btn-ghost btn-icon btn-sm text-error" data-id="${ach.id}" title="Delete achievement">✕</button>
            </div>
            <div class="card-body">
              <h4 class="font-bold text-base mb-1">${ach.title}</h4>
              <span class="text-xs text-muted mb-2 block">📅 ${ach.date}</span>
              <p class="text-xs text-secondary line-clamp-3">${ach.description}</p>
              ${ach.document ? `
                <div class="verified-document-pill mt-4">
                  <span>📄</span> Verified Attachment
                </div>
              ` : `
                <div class="verified-document-pill pending mt-4">
                  <span>⚠️</span> Self-reported (No doc)
                </div>
              `}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- MODAL DIALOG FOR ADDING ACHIEVEMENT -->
      <dialog id="dialog-achievement">
        <div class="dialog-header">
          <h3 class="font-bold">Add Portfolio Achievement</h3>
          <button id="dialog-ach-close" class="btn btn-ghost btn-icon btn-sm">✕</button>
        </div>
        <form id="form-achievement">
          <div class="dialog-body">
            <div class="input-group">
              <label class="input-label" for="ach-title">Title / Award Name</label>
              <input class="input" type="text" id="ach-title" placeholder="e.g. FIRST Robotics Regional Winner" required>
            </div>
            <div class="input-group">
              <label class="input-label" for="ach-category">Category</label>
              <select class="input select" id="ach-category" required>
                <option value="Olympiads">Olympiads</option>
                <option value="Competitions">Competitions</option>
                <option value="Certifications">Certifications</option>
                <option value="Internships">Internships</option>
                <option value="Leadership Roles">Leadership Roles</option>
                <option value="Volunteering">Volunteering</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="grid-2">
              <div class="input-group">
                <label class="input-label" for="ach-date">Month & Year</label>
                <input class="input" type="month" id="ach-date" required>
              </div>
              <div class="input-group">
                <label class="input-label" for="ach-doc">Supporting Document</label>
                <input class="input" type="file" id="ach-doc" style="padding: var(--space-2) var(--space-3);">
              </div>
            </div>
            <div class="input-group">
              <label class="input-label" for="ach-desc">Description</label>
              <textarea class="input" id="ach-desc" placeholder="Explain your role, contributions, and key takeaways." required></textarea>
            </div>
          </div>
          <div class="dialog-footer">
            <button type="button" id="btn-ach-cancel" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Upload Portfolio</button>
          </div>
        </form>
      </dialog>
    </div>
  `;

  // Attach event handlers
  const dialog = container.querySelector('#dialog-achievement');
  const btnOpen = container.querySelector('#btn-add-achievement');
  const btnClose = container.querySelector('#dialog-ach-close');
  const btnCancel = container.querySelector('#btn-ach-cancel');
  const form = container.querySelector('#form-achievement');

  btnOpen.addEventListener('click', () => dialog.showModal());
  btnClose.addEventListener('click', () => dialog.close());
  btnCancel.addEventListener('click', () => dialog.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = container.querySelector('#ach-title').value;
    const category = container.querySelector('#ach-category').value;
    const date = container.querySelector('#ach-date').value;
    const description = container.querySelector('#ach-desc').value;
    const docInput = container.querySelector('#ach-doc');

    store.addAchievement(student.id, {
      title,
      category,
      date,
      description,
      document: docInput.files.length > 0 ? docInput.files[0].name : null,
    });

    dialog.close();
    triggerToast('Achievement successfully added! Your profile score updated.', 'success');
    renderAchievementsTab(container, student, triggerToast);
  });

  container.querySelectorAll('.btn-delete-ach').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const achId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this achievement? This will update your profile score.')) {
        store.deleteAchievement(student.id, achId);
        triggerToast('Achievement deleted.', 'warning');
        renderAchievementsTab(container, student, triggerToast);
      }
    });
  });
}

function getCategoryBadgeColor(cat) {
  switch (cat) {
    case 'Olympiads': return 'badge-indigo';
    case 'Competitions': return 'badge-amber';
    case 'Certifications': return 'badge-emerald';
    case 'Internships': return 'badge-blue';
    case 'Leadership Roles': return 'badge-indigo';
    case 'Volunteering': return 'badge-emerald';
    default: return 'badge-slate';
  }
}

// -------------------------------------------------------------
// 3. COLLEGES MATCH / RECOMMENDATIONS TAB
// -------------------------------------------------------------
function renderCollegesTab(container, student, collegeMatches, triggerToast) {
  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">AI College Match Discovery</h2>
          <p class="section-subtitle">Personalized options tailored to your grades, dream interests, and portfolio accomplishments.</p>
        </div>
      </div>

      <div class="grid-3">
        ${collegeMatches.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1;">
            <div class="empty-state">
              <div class="empty-icon">🏫</div>
              <h3>No college recommendations found</h3>
              <p>Add more details to your achievements log to kickstart recommendations.</p>
            </div>
          </div>
        ` : collegeMatches.map(col => {
          let scoreClass = 'low';
          if (col.matchScore >= 75) scoreClass = 'high';
          else if (col.matchScore >= 50) scoreClass = 'medium';

          return `
            <!-- Tinder-Style College Match Card -->
            <div class="match-card">
              <div class="match-card-header">
                <div>
                  <span class="college-type-badge">${col.type} • ${col.country}</span>
                  <h3 class="font-bold text-base mt-1">${col.name}</h3>
                  <span class="text-xs text-muted">📍 ${col.location}</span>
                </div>
                <div class="match-score-pill ${scoreClass}">
                  <span>⚡</span> ${col.matchScore}%
                </div>
              </div>
              <div class="card-body flex-1 flex flex-col gap-3">
                <p class="text-xs text-secondary line-clamp-2">${col.description}</p>
                
                <div class="flex flex-col gap-1">
                  <span class="text-xs font-semibold text-muted">Matched Focus Areas</span>
                  <div class="tag-list">
                    ${col.strengths.slice(0, 3).map(tag => `<span class="badge badge-slate" style="font-size: 10px;">✓ ${tag}</span>`).join('')}
                  </div>
                </div>

                <div class="flex justify-between items-center text-xs mt-2" style="border-block-start: 1px solid var(--color-border); padding-block-start: var(--space-2);">
                  <span>Target GPA: <strong class="text-primary">${col.targetGPA}</strong></span>
                  <span>Acceptance: <strong>${col.acceptance}</strong></span>
                </div>
              </div>
              <div class="card-footer">
                <button class="btn btn-secondary btn-sm w-full btn-view-college" data-id="${col.id}">View Reasons</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- COLLEGE DETAIL MODAL -->
      <dialog id="dialog-college">
        <div class="dialog-header">
          <h3 id="modal-college-name" class="font-bold">College Details</h3>
          <button id="dialog-col-close" class="btn btn-ghost btn-icon btn-sm">✕</button>
        </div>
        <div class="dialog-body" id="modal-college-body">
          <!-- Populated dynamically -->
        </div>
        <div class="dialog-footer">
          <button id="dialog-col-cancel" class="btn btn-ghost">Close</button>
        </div>
      </dialog>
    </div>
  `;

  // Handlers
  const dialog = container.querySelector('#dialog-college');
  const btnClose = container.querySelector('#dialog-col-close');
  const btnCancel = container.querySelector('#dialog-col-cancel');
  // Connect options removed from student matching dashboard
  let selectedCollege = null;

  btnClose.addEventListener('click', () => dialog.close());
  btnCancel.addEventListener('click', () => dialog.close());

  container.querySelectorAll('.btn-view-college').forEach(btn => {
    btn.addEventListener('click', () => {
      const colId = btn.getAttribute('data-id');
      selectedCollege = collegeMatches.find(c => c.id === colId);
      if (selectedCollege) {
        container.querySelector('#modal-college-name').innerText = selectedCollege.name;
        
        let strengthsHTML = selectedCollege.strengths.map(s => `<span class="badge badge-indigo">${s}</span>`).join('');
        let improvementsHTML = selectedCollege.improvements.length > 0 
          ? selectedCollege.improvements.map(i => `<li class="text-xs text-warning" style="margin-inline-start: var(--space-4);">⚠️ ${i}</li>`).join('')
          : '<li class="text-xs text-success" style="margin-inline-start: var(--space-4);">✅ No suggestions needed! Excellent fit.</li>';

        container.querySelector('#modal-college-body').innerHTML = `
          <p class="text-sm text-primary mb-2"><strong>${selectedCollege.matchScore}% AI Match Recommendation</strong></p>
          <p class="text-sm text-secondary mb-4">${selectedCollege.description}</p>
          
          <div class="divider"></div>
          
          <h5 class="text-sm font-semibold mb-2">Why Recommended?</h5>
          <p class="text-xs text-success bg-emerald-50 p-3 rounded-lg mb-4">💡 ${selectedCollege.whyRecommended}</p>
          
          <h5 class="text-sm font-semibold mb-2">Programs & Strengths</h5>
          <div class="tag-list mb-4">${strengthsHTML}</div>

          <h5 class="text-sm font-semibold mb-2">Suggested Portfolio Adjustments</h5>
          <ul class="flex flex-col gap-1 mb-4">${improvementsHTML}</ul>

          <div class="divider"></div>
          
          <div class="grid-2 text-xs">
            <div>📍 <strong>Location:</strong> ${selectedCollege.location}</div>
            <div>🎓 <strong>Acceptance rate:</strong> ${selectedCollege.acceptance}</div>
          </div>
        `;
        dialog.showModal();
      }
    });
  });

  // Connect event listeners removed
}

// -------------------------------------------------------------
// 4. STUDENT DISCOVERY TAB
// -------------------------------------------------------------
function renderDiscoveryTab(container, student, triggerToast) {
  const searchInputHTML = `
    <div class="search-bar mb-6 w-full">
      <span class="search-icon">🔍</span>
      <input type="text" id="discovery-search" class="input" placeholder="Search other students by school, career interest, intended degree...">
    </div>
  `;

  const renderRoster = (query = '') => {
    const listContainer = container.querySelector('#discovery-roster-list');
    if (!listContainer) return;

    // Filter other students
    const otherStudents = store.state.students.filter(s => s.id !== student.id && s.isPublic);
    const filtered = otherStudents.filter(s => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.intendedDegree.toLowerCase().includes(q) ||
        s.careerInterests.some(i => i.toLowerCase().includes(q))
      );
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">👥</div>
          <h3>No students match your query</h3>
          <p>Try searching another keyword.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(s => {
      const isFollowing = student.following.includes(s.id);
      const score = computeProfileStrength(s);

      return `
        <div class="student-card animate-fade-in">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar-md avatar-badge font-bold">${s.name.split(' ').map(n=>n[0]).join('')}</div>
              <div>
                <h4 class="font-bold text-base">${s.name}</h4>
                <p class="text-xs text-muted">Grade ${s.grade} • ${s.school}</p>
              </div>
            </div>
            <div class="score-badge high" style="font-size: var(--text-xs); border: 1px solid var(--color-border); padding: 2px 8px; border-radius: var(--radius-full);">
              Score: ${score}
            </div>
          </div>
          <div class="flex-1 flex flex-col gap-2 mt-2">
            <p class="text-xs text-secondary"><strong>Goal Degree:</strong> ${s.intendedDegree}</p>
            <div class="tag-list mt-1">
              ${s.careerInterests.map(i => `<span class="badge badge-slate" style="font-size: 10px;">${i}</span>`).join('')}
              ${s.skills.slice(0, 2).map(sk => `<span class="badge badge-indigo" style="font-size: 10px;">${sk}</span>`).join('')}
            </div>
          </div>
          <div class="flex justify-between items-center mt-3 pt-3" style="border-block-start: 1px solid var(--color-border);">
            <span class="text-xs text-muted">${s.followers.length} followers</span>
            <button class="btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-toggle-follow" data-id="${s.id}">
              ${isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Toggle follow trigger
    listContainer.querySelectorAll('.btn-toggle-follow').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-id');
        const isFollowing = student.following.includes(targetId);
        
        if (isFollowing) {
          store.unfollowStudent(student.id, targetId);
          triggerToast(`Unfollowed student.`, 'warning');
        } else {
          store.followStudent(student.id, targetId);
          triggerToast(`You are now following this student!`, 'success');
        }
        renderRoster(query);
      });
    });
  };

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header">
        <div>
          <h2 class="section-title">Student Discovery Community</h2>
          <p class="section-subtitle">Connect, follow, and collaborate with peer students around academic paths.</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs text-secondary">Public Profile Toggle:</span>
          <button id="btn-privacy-toggle" class="btn btn-sm ${student.isPublic ? 'btn-primary' : 'btn-secondary'}">
            ${student.isPublic ? 'Visible to Public' : 'Hidden / Private'}
          </button>
        </div>
      </div>

      ${searchInputHTML}

      <div class="grid-3" id="discovery-roster-list">
        <!-- populated dynamically -->
      </div>
    </div>
  `;

  renderRoster();

  // Search input handler
  const searchInput = container.querySelector('#discovery-search');
  searchInput.addEventListener('input', (e) => {
    renderRoster(e.target.value);
  });

  // Privacy toggle handler
  const privacyBtn = container.querySelector('#btn-privacy-toggle');
  privacyBtn.addEventListener('click', () => {
    const isPublic = !student.isPublic;
    store.updateStudent(student.id, { isPublic });
    privacyBtn.innerText = isPublic ? 'Visible to Public' : 'Hidden / Private';
    privacyBtn.className = `btn btn-sm ${isPublic ? 'btn-primary' : 'btn-secondary'}`;
    triggerToast(`Profile status set to ${isPublic ? 'Publicly Searchable' : 'Private Mode'}.`, 'success');
  });
}

// -------------------------------------------------------------
// 5. INBOX / COMMUNICATIONS TAB
// -------------------------------------------------------------
function renderInboxTab(container, student, triggerToast) {
  // Get student's communications
  const comms = store.state.communications.filter(c => c.toStudentId === student.id);

  const renderActiveChat = (selectedCommId) => {
    const chatContainer = container.querySelector('#active-chat-window');
    if (!chatContainer) return;

    const comm = comms.find(c => c.id === selectedCommId);
    if (!comm) {
      chatContainer.innerHTML = '<div class="empty-state"><h3>Select a conversation</h3><p>Approve pending interest requests to initiate college messaging.</p></div>';
      return;
    }

    const college = store.state.colleges.find(c => c.id === comm.fromCollegeId);
    const messages = store.getMessagesForComm(comm.id);

    if (comm.status === 'pending') {
      chatContainer.innerHTML = `
        <div class="empty-state" style="padding: var(--space-8);">
          <div class="empty-icon">✉️</div>
          <h3 class="mb-2">Contact Request from ${college.name}</h3>
          <p class="text-sm text-secondary mb-4">The admissions representatives would like to discuss admissions plans, brochures, and scholarship details.</p>
          <div class="feedback-item tip mb-4">
            <p class="text-xs"><strong>Initial Message:</strong> "${comm.message}"</p>
          </div>
          <div class="flex gap-4">
            <button id="btn-request-reject" class="btn btn-danger">Decline Request</button>
            <button id="btn-request-approve" class="btn btn-primary">Approve Communication</button>
          </div>
        </div>
      `;

      chatContainer.querySelector('#btn-request-approve').addEventListener('click', () => {
        store.respondToRequest(comm.id, 'approved');
        triggerToast('Communication request approved! You can now send messages.', 'success');
        renderInboxTab(container, student, triggerToast);
      });

      chatContainer.querySelector('#btn-request-reject').addEventListener('click', () => {
        store.respondToRequest(comm.id, 'rejected');
        triggerToast('Contact request declined.', 'warning');
        renderInboxTab(container, student, triggerToast);
      });

      return;
    }

    if (comm.status === 'rejected') {
      chatContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">✕</div><h3>Request Declined</h3><p>You declined communication with ${college.name}.</p></div>`;
      return;
    }

    // Chat view
    const messagesHTML = messages.length === 0 
      ? '<div class="text-center text-muted text-xs p-8">No messages exchanged yet. Send a note to the college representative!</div>'
      : messages.map(m => {
          const isMe = m.fromId === student.id;
          const senderName = isMe ? student.name : college.name;
          return `
            <div class="message-bubble ${isMe ? 'me' : 'them'}">
              <span class="message-sender">${senderName}</span>
              <p class="message-text">${m.text}</p>
              <span class="message-time">${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          `;
        }).join('');

    chatContainer.innerHTML = `
      <div class="chat-header">
        <h4 class="font-bold">${college.name}</h4>
        <span class="badge badge-emerald">Connected</span>
      </div>
      <div class="chat-messages" id="chat-messages-box">
        ${messagesHTML}
      </div>
      <form id="chat-input-form" class="chat-input-panel">
        <input type="text" id="chat-message-text" class="input" placeholder="Type a message to the admissions office..." required autocomplete="off">
        <button type="submit" class="btn btn-primary">Send</button>
      </form>
    `;

    // Scroll to bottom
    const box = chatContainer.querySelector('#chat-messages-box');
    box.scrollTop = box.scrollHeight;

    chatContainer.querySelector('#chat-input-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = chatContainer.querySelector('#chat-message-text').value;
      store.sendMessage(comm.id, student.id, txt);
      chatContainer.querySelector('#chat-message-text').value = '';
      
      // Simulated representative response after 2 seconds
      setTimeout(() => {
        const reps = store.state.employees.filter(e => e.collegeId === college.id);
        const repName = reps.length > 0 ? reps[0].name : 'Admissions Support';
        store.sendMessage(comm.id, college.id, `Hello! Thank you for the note. Our admissions representative, ${repName}, will follow up with details on application timelines and campus visits shortly!`);
        renderActiveChat(selectedCommId);
      }, 1500);

      renderActiveChat(selectedCommId);
    });
  };

  container.innerHTML = `
    <div class="animate-fade-up shell-split" style="display: grid; grid-template-columns: 320px 1fr; gap: var(--space-4); min-height: 480px; height: calc(100vh - 200px);">
      <!-- LEFT LIST -->
      <div class="card flex flex-col overflow-hidden">
        <div class="card-header" style="padding: var(--space-4);">
          <h3 class="font-bold text-sm">Admissions Channels</h3>
        </div>
        <div class="flex-1 overflow-y-auto flex flex-col gap-1 p-2" id="inbox-channels-list">
          ${comms.length === 0 ? `
            <div class="text-center text-muted text-xs p-8">No college channels found. Complete your profile and wait for matching invites!</div>
          ` : comms.map(c => {
            const col = store.state.colleges.find(col => col.id === c.fromCollegeId);
            const isPending = c.status === 'pending';
            
            return `
              <button class="inbox-channel-btn btn-ghost text-start w-full ${isPending ? 'pending-dot' : ''}" data-id="${c.id}">
                <div class="flex flex-col gap-1 w-full">
                  <div class="flex justify-between items-center w-full">
                    <strong class="text-sm truncate" style="max-width: 180px;">${col.name}</strong>
                    <span class="badge ${isPending ? 'badge-amber' : 'badge-emerald'}" style="font-size: 10px;">${c.status}</span>
                  </div>
                  <span class="text-xs text-muted truncate">${c.message}</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- RIGHT CHAT WINDOW -->
      <div class="card flex flex-col overflow-hidden relative" id="active-chat-window">
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Approve pending interest requests to initiate college messaging.</p>
        </div>
      </div>
    </div>
  `;

  // Register channel clickers
  container.querySelectorAll('.inbox-channel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.inbox-channel-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const commId = btn.getAttribute('data-id');
      renderActiveChat(commId);
    });
  });
}
