import { store } from '../store/index.js';
import { computeProfileStrength, getStrengthBreakdown, getCollegeRecommendations, getCourseRecommendations, getProfileFeedback, COURSE_DB, calculateCollegeMatch } from '../store/ai-engine.js';

let selectedCategoryFilter = null;

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
function renderDashboardTab(container, student, score, breakdown, colleges, courses, feedback, approvedCount, pendingCount, triggerToast) {
  // Determine circular badge color
  let scoreColorClass = 'low';
  if (score >= 70) scoreColorClass = 'high';
  else if (score >= 40) scoreColorClass = 'mid';

  // SVG dash array calculation (circumference of 120px ring is 2 * pi * 55 = 345.5)
  const strokeDashoffset = Math.max(0, 345.5 - (345.5 * score) / 100);

  const initials = student.name ? student.name.split(' ').map(n => n[0]).join('') : 'S';

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <!-- SAAS PROFILE CONSOLE HEADER -->
      <div class="card profile-console-header mb-6 animate-fade-in" style="background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary) 100%); border: none; padding: var(--space-6); color: white; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); border-radius: var(--radius-2xl); position: relative; overflow: hidden; box-shadow: var(--shadow-lg);">
        <div style="position: absolute; right: -50px; top: -50px; width: 200px; height: 200px; border-radius: 50%; background: rgb(255 255 255 / 0.05); pointer-events: none;"></div>
        <div style="position: absolute; left: -30px; bottom: -30px; width: 120px; height: 120px; border-radius: 50%; background: rgb(255 255 255 / 0.03); pointer-events: none;"></div>

        <div class="flex items-center gap-5 flex-wrap" style="flex: 1; min-width: 280px; z-index: 1;">
          <!-- Glowing ring avatar -->
          <div style="position: relative;">
            <svg style="width: 106px; height: 106px; transform: rotate(-90deg); position: absolute; top: -5px; left: -5px; pointer-events: none;">
              <circle cx="53" cy="53" r="49" stroke="rgb(255 255 255 / 0.15)" stroke-width="4" fill="transparent"></circle>
              <circle cx="53" cy="53" r="49" stroke="#10b981" stroke-width="4" fill="transparent" stroke-dasharray="307.8" stroke-dashoffset="${307.8 - (307.8 * score) / 100}" style="transition: stroke-dashoffset 0.5s ease;"></circle>
            </svg>
            <div class="avatar font-bold" style="width: 96px; height: 96px; border-radius: 50%; border: 3px solid white; background: var(--color-slate-100); color: var(--color-primary); font-size: 2.25rem; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md);">
              ${student.avatar ? `<img src="${student.avatar}" alt="${student.name}" style="width: 100%; height: 100%; object-fit: cover;">` : initials}
            </div>
            <div style="position: absolute; bottom: 0; right: 0; background: #10b981; border: 2px solid white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;" title="Audited Portfolio">✓</div>
          </div>
          
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl font-extrabold" style="margin: 0; color: white; letter-spacing: -0.5px;">${student.name}</h1>
              <span class="badge" style="background: rgb(255 255 255 / 0.2); color: white; font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600; backdrop-filter: blur(4px);">Grade ${student.grade}</span>
            </div>
            <p class="text-sm mt-1" style="color: rgb(255 255 255 / 0.9); font-weight: 500;">
              🎓 Intended Major: <span style="font-weight: 700;">${student.intendedDegree}</span>
            </p>
            <div class="flex flex-wrap gap-1 mt-3">
              ${student.careerInterests.map(interest => `
                <span style="font-size: 9px; font-weight: bold; padding: 3px 10px; background: rgb(255 255 255 / 0.12); color: white; border-radius: var(--radius-full); backdrop-filter: blur(4px); text-transform: uppercase; border: 1px solid rgb(255 255 255 / 0.05); letter-spacing: 0.5px;">
                  ${interest}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 justify-end items-end text-end flex-wrap" style="z-index: 1;">
          <span class="text-xs font-semibold" style="color: rgb(255 255 255 / 0.85); letter-spacing: 0.5px;">📍 ${student.city}, India</span>
          <div class="flex gap-2 mt-2">
            <button class="btn btn-secondary btn-sm btn-open-colleges" style="border-radius: var(--radius-lg); background: white; color: var(--color-primary); border: none; font-weight: bold; font-size: 12px; box-shadow: var(--shadow-sm); padding-inline: var(--space-4);">
              Open to Colleges
            </button>
            <button id="lnk-contact-info" class="btn btn-secondary btn-sm" style="border-radius: var(--radius-lg); background: rgb(255 255 255 / 0.15); color: white; border: 1px solid rgb(255 255 255 / 0.1); font-weight: 600; font-size: 12px; backdrop-filter: blur(4px);">
              View Socials
            </button>
          </div>
        </div>
      </div>

      <!-- SAAS PROFILE GRID WORKSPACE -->
      <div class="grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6); align-items: start;">
        
        <!-- LEFT WORKSPACE AREA -->
        <div class="flex flex-col gap-6" style="min-width: 0;">
          
          <!-- SYSTEM STRATEGY & ACTIONS (AI Recommendations checklist) -->
          <div class="card" style="padding: var(--space-5); border-radius: var(--radius-2xl);">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold flex items-center gap-2" style="font-size: var(--text-base); margin: 0;">
                <span>✨</span> AI Strategic Action Center
              </h3>
              <span class="badge badge-indigo" style="font-size: 10px;">Growth Focus</span>
            </div>
            
            <div class="flex flex-col gap-3">
              ${feedback.map(item => {
                let taskTitle = 'Refine Profile Details';
                let actionText = 'Update details';
                let actionTarget = 'strength';
                if (item.text.includes('GPA')) {
                  taskTitle = 'Improve Academic GPA';
                  actionText = 'View tips';
                  actionTarget = 'strength';
                } else if (item.text.includes('achievements') || item.text.includes('diverse')) {
                  taskTitle = 'Expand Extracurricular Portfolio';
                  actionText = 'Add achievement';
                  actionTarget = 'achievements';
                } else if (item.text.includes('internship') || item.text.includes('Internships')) {
                  taskTitle = 'Secure a Summer Internship';
                  actionText = 'Log experience';
                  actionTarget = 'achievements';
                } else if (item.text.includes('certification') || item.text.includes('Certifications')) {
                  taskTitle = 'Earn a Career Certification';
                  actionText = 'Add certificate';
                  actionTarget = 'achievements';
                } else if (item.text.includes('LinkedIn') || item.text.includes('social')) {
                  taskTitle = 'Connect Professional Social Links';
                  actionText = 'Edit socials';
                  actionTarget = 'contact';
                }

                return `
                  <div class="feedback-item ${item.type} p-3 rounded-lg flex items-center justify-between gap-4" style="border: 1px solid var(--color-border); margin: 0; background: var(--color-slate-50);">
                    <div class="flex items-start gap-3" style="min-width: 0; flex: 1;">
                      <span style="font-size: 1.25rem; flex-shrink: 0; margin-top: 2px;">
                        ${item.type === 'success' ? '🚀' : item.type === 'warning' ? '✍️' : '💡'}
                      </span>
                      <div style="min-width: 0; flex: 1;">
                        <h4 class="text-sm font-bold" style="margin: 0; color: var(--color-text);">${taskTitle}</h4>
                        <p class="text-xs text-secondary mt-0.5 truncate" style="max-width: 420px;">${item.text}</p>
                      </div>
                    </div>
                    <button class="btn btn-secondary btn-sm btn-suggestion-action" data-target="${actionTarget}" style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 4px 12px; font-size: 11px; flex-shrink: 0;">
                      ${actionText}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- ANALYTICS INSIGHTS -->
          <div class="card" style="padding: var(--space-5); border-radius: var(--radius-2xl);">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h3 class="font-bold flex items-center gap-2" style="font-size: var(--text-base); margin: 0;">
                  Platform Analytics
                </h3>
                <span class="text-xs text-muted">Audited reach and discoverability metrics</span>
              </div>
              <span class="badge badge-slate" style="font-size: 10px;">Real-time</span>
            </div>
            
            <div class="grid-3 text-start" style="gap: var(--space-4);">
              <div class="analytics-stat-card p-4 rounded-xl hover-bg" style="cursor: pointer; border: 1px solid var(--color-border); background: var(--color-slate-50); transition: all var(--transition-fast);" data-nav="interested">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-muted font-bold">PROFILE VIEWS</span>
                  <span>👁️</span>
                </div>
                <div class="text-3xl font-black mt-2 text-primary" style="letter-spacing: -0.5px;">394</div>
                <div class="text-xs text-secondary mt-1">Colleges that viewed your profile folder</div>
              </div>
              <div class="analytics-stat-card p-4 rounded-xl hover-bg" style="cursor: pointer; border: 1px solid var(--color-border); background: var(--color-slate-50); transition: all var(--transition-fast);" data-nav="achievements">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-muted font-bold">PORTFOLIO REACH</span>
                  <span>📈</span>
                </div>
                <div class="text-3xl font-black mt-2 text-success" style="letter-spacing: -0.5px;">104</div>
                <div class="text-xs text-secondary mt-1">Impressions on credential postings</div>
              </div>
              <div class="analytics-stat-card p-4 rounded-xl hover-bg" style="cursor: pointer; border: 1px solid var(--color-border); background: var(--color-slate-50); transition: all var(--transition-fast);" data-nav="matches">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-muted font-bold">SEARCH APPEARANCES</span>
                  <span>🔍</span>
                </div>
                <div class="text-3xl font-black mt-2 text-indigo" style="letter-spacing: -0.5px;">72</div>
                <div class="text-xs text-secondary mt-1">Found in search queries by advisors</div>
              </div>
            </div>
          </div>

          <!-- DEGREE PATHWAY SUGGESTIONS -->
          <div class="card" style="border-radius: var(--radius-2xl);">
            <div class="card-header flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 class="font-bold flex items-center gap-2" style="margin: 0;">📚 AI Suggested Degree Programs</h3>
                <p class="text-xs text-muted mt-0.5">Recommendations mapped based on interest overlap and skill set alignment</p>
              </div>
              <button id="btn-show-colleges" class="btn btn-secondary btn-sm">Show All Matches</button>
            </div>
            <div class="card-body">
              <div class="grid-2">
                ${courses.map(course => `
                  <div class="course-card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-xl); background: var(--color-bg); border: 1px solid var(--color-border); padding: var(--space-4); height: 100%;">
                    <div>
                      <div class="course-icon" style="background: var(--color-slate-50); border: 1px solid var(--color-border); width: 40px; height: 40px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                        ${course.icon}
                      </div>
                      <h4 class="font-bold text-base mt-2" style="color: var(--color-text);">${course.name}</h4>
                      <p class="text-xs text-secondary mt-1" style="line-height: 1.3;">${course.description}</p>
                      <div class="course-skills-list mt-2">
                        ${course.skills.slice(0, 3).map(skill => `<span class="badge badge-slate" style="font-size: 9px;">${skill}</span>`).join('')}
                      </div>
                    </div>
                    <div style="margin-block-start: var(--space-4); display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap;">
                      <span class="badge badge-emerald">${course.matchScore}% Match</span>
                      <button class="btn btn-secondary btn-xs btn-show-category-colleges" data-category="${course.name}" style="font-size: 11px; padding: 4px 8px; border-radius: var(--radius-md);">Show Colleges</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- VERIFIED PORTFOLIO TIMELINE -->
          <div class="card" style="padding: var(--space-5); border-radius: var(--radius-2xl);">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h3 class="font-bold flex items-center gap-2" style="font-size: var(--text-base); margin: 0;">
                  Verified Accomplishments Timeline
                </h3>
                <p class="text-xs text-muted">Audited milestones submitted to the platform</p>
              </div>
              <button class="btn btn-ghost btn-sm btn-enhance-profile" style="color: var(--color-primary); font-weight: bold; font-size: var(--text-sm);">
                View Full Log
              </button>
            </div>
            
            <div style="position: relative; padding-inline-start: var(--space-6); border-inline-start: 2px solid var(--color-border); margin-inline-start: var(--space-2); display: flex; flex-direction: column; gap: var(--space-6);">
              ${student.achievements.slice(0, 3).map(ach => {
                let achIcon = '📜';
                if (ach.category === 'Olympiads') achIcon = '🏆';
                else if (ach.category === 'Competitions') achIcon = '🥇';
                else if (ach.category === 'Leadership Roles') achIcon = '👥';
                else if (ach.category === 'Volunteering') achIcon = '🌱';
                else if (ach.category === 'Internships') achIcon = '💼';

                return `
                  <div style="position: relative;">
                    <!-- Timeline dot -->
                    <div style="position: absolute; left: calc(-1 * var(--space-6) - 7px); top: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--color-primary); border: 2px solid white; box-shadow: var(--shadow-sm);"></div>
                    
                    <div class="flex items-start gap-3">
                      <div style="font-size: 1.25rem; background-color: var(--color-slate-50); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); flex-shrink: 0; border: 1px solid var(--color-border);">
                        ${achIcon}
                      </div>
                      <div style="flex: 1; min-width: 0;">
                        <div class="flex items-center justify-between gap-2 flex-wrap">
                          <h4 class="text-sm font-bold" style="margin: 0; color: var(--color-text);">${ach.title}</h4>
                          <span class="text-xs text-muted">📅 ${ach.date}</span>
                        </div>
                        <p class="text-xs font-semibold text-secondary mt-0.5">${ach.category} • Verified credential</p>
                        <p class="text-xs text-secondary mt-1.5" style="line-height: 1.3;">${ach.description}</p>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT WORKSPACE AREA: SIDEBAR -->
        <div class="flex flex-col gap-6">
          
          <!-- PROFILE READINESS INDEX -->
          <div class="strength-widget" style="margin: 0; border-radius: var(--radius-2xl); padding: var(--space-5);">
            <h3 class="font-bold text-center" style="font-size: var(--text-base);">Target Readiness Index</h3>
            <div class="strength-ring">
              <svg>
                <circle class="strength-ring-track" cx="70" cy="70" r="55"></circle>
                <circle class="strength-ring-fill ${scoreColorClass}" cx="70" cy="70" r="55" 
                        style="stroke-dasharray: 345.5; stroke-dashoffset: ${strokeDashoffset};"></circle>
              </svg>
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span class="score-badge ${scoreColorClass}" style="font-size: 1.75rem;">${score}%</span>
                <span style="font-size: var(--text-xs); color: var(--color-text-secondary); font-weight: var(--weight-medium);">readiness</span>
              </div>
            </div>
            <div class="w-full flex flex-col gap-2 mt-2">
              ${breakdown.map(item => `
                <div class="flex items-center justify-between">
                  <span class="text-xs flex items-center gap-1"><span>${item.icon}</span> ${item.label}</span>
                  <div class="flex items-center gap-1">
                    <div class="mini-progress" style="width: 60px;">
                      <div class="mini-progress-fill" style="width: ${(item.score / item.max) * 100}%; background-color: var(--color-success);"></div>
                    </div>
                    <span class="breakdown-score" style="font-size: 10px;">${item.score}/${item.max}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- DREAM TARGETS LEDGER -->
          <div class="card" style="display: flex; flex-direction: column; border-radius: var(--radius-2xl); padding: var(--space-4);">
            <h3 class="font-bold text-sm mb-3" style="margin: 0;">Dream Targets Ledger</h3>
            <p class="text-xs text-muted mb-3">Colleges earmarked as primary target outcomes</p>
            
            <div class="flex flex-col gap-2">
              ${(student.dreamColleges || []).length === 0 ? `
                <div class="text-center text-muted text-xs p-4">No dream targets set.</div>
              ` : (student.dreamColleges || []).map(dcName => {
                const match = store.state.colleges.find(c => c.name.toLowerCase().includes(dcName.toLowerCase()) || dcName.toLowerCase().includes(c.name.toLowerCase()));
                const fitPercent = match ? calculateCollegeMatch(student, match) : Math.min(100, Math.round((student.grades?.gpa || 0) * 8 + student.achievements.length * 5));
                const matchScoreHTML = `<span class="badge badge-emerald" style="flex-shrink: 0; font-size: 9px; padding: 2px 6px;">${fitPercent}% Fit</span>`;
                return `
                  <div class="flex items-center justify-between pb-2" style="border-block-end: 1px solid var(--color-border); margin-block-end: var(--space-2); gap: var(--space-2); &:last-child { border-block-end: none; margin-block-end: 0; }">
                    <div class="flex items-center gap-2" style="min-width: 0; flex: 1;">
                      <span style="font-size: 1.1rem; flex-shrink: 0;">🏛️</span>
                      <h5 class="text-xs font-semibold truncate" style="margin: 0;">${dcName}</h5>
                    </div>
                    <div class="flex items-center gap-1" style="flex-shrink: 0;">
                      ${matchScoreHTML}
                      ${match ? `
                        <button class="btn btn-ghost btn-sm btn-view-dream-college" data-id="${match.id}" style="padding: 2px 6px; font-size: 10px; font-weight: bold; border: 1px solid var(--color-border); border-radius: var(--radius-md); height: 22px; min-block-size: auto;">View</button>
                      ` : ''}
                      <button class="btn-remove-dream-college btn-ghost btn-icon btn-sm text-error" data-name="${dcName}" title="Remove target" style="padding: 2px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 10px;">✕</button>
                    </div>
                  </div>
                `;
              }).join('')}
              
              <!-- Inline Add Form -->
              <div style="margin-block-start: var(--space-2); padding-block-start: var(--space-3); border-block-start: 1px dashed var(--color-border);">
                <form id="form-add-dream-college" class="flex gap-2">
                  <input type="text" id="add-dc-name" class="input" placeholder="Add target college..." style="font-size: 11px; padding: 4px 8px; flex: 1; min-block-size: auto;" required autocomplete="off">
                  <button type="submit" class="btn btn-primary btn-sm" style="padding: 4px 8px; font-size: 11px; min-block-size: auto; height: 26px; border-radius: var(--radius-md);">Add</button>
                </form>
              </div>
            </div>
          </div>

          <!-- CONNECTIONS DISCOVERY -->
          <div class="card" style="padding: var(--space-4); border-radius: var(--radius-2xl);">
            <h3 class="font-bold text-sm mb-3" style="margin: 0;">Peer Community Discovery</h3>
            <div class="flex flex-col gap-3">
              ${store.state.students.filter(s => s.id !== student.id).slice(0, 3).map(s => {
                const isFollowing = student.following.includes(s.id);
                return `
                  <div class="flex items-center gap-3 justify-between" style="border-block-end: 1px solid var(--color-border); padding-block-end: var(--space-2); &:last-child { border-block-end: none; padding-block-end: 0; }">
                    <div class="flex items-center gap-2" style="min-width: 0; flex: 1;">
                      <div class="avatar avatar-sm font-bold" style="background-color: var(--color-primary-muted); color: var(--color-primary); flex-shrink: 0; border-radius: 50%; font-size: 11px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                        ${s.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div style="min-width: 0; flex: 1;">
                        <h4 class="text-xs font-bold truncate" style="margin: 0;">${s.name}</h4>
                        <p class="text-xs text-muted truncate" style="margin: 0; font-size: 9px;">${s.intendedDegree} aspirant</p>
                      </div>
                    </div>
                    <button class="btn btn-secondary btn-sm btn-follow-suggestion" data-id="${s.id}" style="padding: 2px 10px; font-size: 10px; height: 26px; min-block-size: auto; border-radius: var(--radius-full); border: 1px solid var(--color-border); flex-shrink: 0;">
                      ${isFollowing ? 'Unfollow' : 'Connect'}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- COLLEGES INTERESTED -->
          <div class="card" style="padding: var(--space-4); border-radius: var(--radius-2xl);">
            <h3 class="font-bold text-sm mb-3" style="margin: 0;">Admissions Inquiries</h3>
            <div class="flex flex-col gap-3">
              ${store.state.communications.filter(c => c.toStudentId === student.id).map(c => {
                const col = store.state.colleges.find(col => col.id === c.fromCollegeId);
                return `
                  <div class="flex items-center gap-3 justify-between" style="border-block-end: 1px solid var(--color-border); padding-block-end: var(--space-2); &:last-child { border-block-end: none; padding-block-end: 0; }">
                    <div class="flex items-center gap-2" style="min-width: 0; flex: 1;">
                      <span style="font-size: 1.25rem; flex-shrink: 0;">🏛️</span>
                      <div style="min-width: 0; flex: 1;">
                        <h4 class="text-xs font-bold truncate" style="margin: 0;">${col.name}</h4>
                        <span class="badge ${c.status === 'approved' ? 'badge-emerald' : 'badge-amber'}" style="font-size: 8px; padding: 1px 4px;">
                          ${c.status}
                        </span>
                      </div>
                    </div>
                    <button class="btn btn-secondary btn-sm btn-message-college" style="padding: 2px 10px; font-size: 10px; height: 26px; min-block-size: auto; border-radius: var(--radius-full); border: 1px solid var(--color-border); flex-shrink: 0;">
                      Message
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOCK COLLEGE DETAIL DIALOG FOR DASHBOARD -->
    <dialog id="dialog-college-dashboard">
      <div class="dialog-header">
        <h3 id="modal-college-name-db" class="font-bold">College Details</h3>
        <button id="dialog-col-close-db" class="btn btn-ghost btn-icon btn-sm">✕</button>
      </div>
      <div class="dialog-body" id="modal-college-body-db">
        <!-- Populated dynamically -->
      </div>
      <div class="dialog-footer">
        <button id="dialog-col-cancel-db" class="btn btn-ghost">Close</button>
      </div>
    </dialog>
  `;

  // Attach event navigation listeners to stats and elements
  container.querySelectorAll('[data-nav]').forEach(card => {
    card.addEventListener('click', () => {
      const navTarget = card.getAttribute('data-nav');
      if (navTarget === 'strength') {
        const el = container.querySelector('.strength-widget');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (navTarget === 'matches') {
        const navBtn = document.querySelector('.nav-item[data-tab="colleges"]');
        if (navBtn) navBtn.click();
      } else if (navTarget === 'achievements') {
        const navBtn = document.querySelector('.nav-item[data-tab="achievements"]');
        if (navBtn) navBtn.click();
      } else if (navTarget === 'interested') {
        const navBtn = document.querySelector('.nav-item[data-tab="inbox"]');
        if (navBtn) navBtn.click();
      }
    });
  });

  const showCollegesBtn = container.querySelector('#btn-show-colleges');
  if (showCollegesBtn) {
    showCollegesBtn.addEventListener('click', () => {
      selectedCategoryFilter = null; // Clear filter for showing all matches
      const navBtn = document.querySelector('.nav-item[data-tab="colleges"]');
      if (navBtn) navBtn.click();
    });
  }

  // Handle click on specific course category button
  container.querySelectorAll('.btn-show-category-colleges').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const category = btn.getAttribute('data-category');
      selectedCategoryFilter = category;
      const navBtn = document.querySelector('.nav-item[data-tab="colleges"]');
      if (navBtn) navBtn.click();
    });
  });

  // Suggestion deep links
  container.querySelectorAll('.btn-suggestion-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target === 'achievements') {
        const navBtn = document.querySelector('.nav-item[data-tab="achievements"]');
        if (navBtn) navBtn.click();
      } else if (target === 'contact') {
        const lnk = container.querySelector('#lnk-contact-info');
        if (lnk) lnk.click();
      } else if (target === 'strength') {
        const el = container.querySelector('.strength-widget');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Open Colleges action
  const openToCollegesBtn = container.querySelector('.btn-open-colleges');
  if (openToCollegesBtn) {
    openToCollegesBtn.addEventListener('click', () => {
      triggerToast('Status updated: You are now marked as Open to Colleges!', 'success');
    });
  }

  // Enhance Profile action
  container.querySelectorAll('.btn-enhance-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      const navBtn = document.querySelector('.nav-item[data-tab="achievements"]');
      if (navBtn) navBtn.click();
    });
  });

  // Message buttons
  container.querySelectorAll('.btn-message-college').forEach(btn => {
    btn.addEventListener('click', () => {
      const navBtn = document.querySelector('.nav-item[data-tab="inbox"]');
      if (navBtn) navBtn.click();
    });
  });

  // Verify in 2 minutes clicker
  const verifyBtn = container.querySelector('#btn-verify-top');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
      triggerToast('Portfolio verification audit requested! Counselor notified.', 'info');
    });
  }

  // Sidebar connect suggestions handler
  container.querySelectorAll('.btn-follow-suggestion').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-id');
      const isFollowing = student.following.includes(targetId);
      if (isFollowing) {
        store.unfollowStudent(student.id, targetId);
        triggerToast('Unfollowed peer student.', 'warning');
      } else {
        store.followStudent(student.id, targetId);
        triggerToast('Connected & Following peer student!', 'success');
      }
      renderStudentDashboard(container, 'dashboard', triggerToast);
    });
  });

  // Contact info popup
  const lnkContact = container.querySelector('#lnk-contact-info');
  if (lnkContact) {
    lnkContact.addEventListener('click', (e) => {
      e.preventDefault();
      const dialog = document.createElement('dialog');
      dialog.className = 'card';
      dialog.style.padding = 'var(--space-5)';
      dialog.style.borderRadius = 'var(--radius-xl)';
      dialog.style.width = '320px';
      dialog.innerHTML = `
        <div class="dialog-header flex justify-between items-center mb-4" style="border-block-end: 1px solid var(--color-border); padding-block-end: var(--space-2);">
          <h3 class="font-bold text-sm" style="margin: 0;">Contact Info</h3>
          <button class="btn-close-contact btn-ghost btn-icon btn-sm" style="border: none; background: transparent; cursor: pointer; font-size: 1rem;">✕</button>
        </div>
        <div class="dialog-body flex flex-col gap-3">
          <p class="text-xs"><strong>📧 Email:</strong><br>${student.email}</p>
          ${student.socialLinks.linkedin ? `<p class="text-xs"><strong>🔗 LinkedIn Profile:</strong><br><a href="https://${student.socialLinks.linkedin}" target="_blank" class="text-primary hover-underline">${student.socialLinks.linkedin}</a></p>` : ''}
          ${student.socialLinks.github ? `<p class="text-xs"><strong>💻 GitHub Portfolio:</strong><br><a href="https://${student.socialLinks.github}" target="_blank" class="text-primary hover-underline">${student.socialLinks.github}</a></p>` : ''}
        </div>
        <div class="dialog-footer mt-4 text-center">
          <button class="btn btn-secondary btn-sm btn-close-contact-btn" style="border-radius: var(--radius-full); width: 100px;">Close</button>
        </div>
      `;
      document.body.appendChild(dialog);
      dialog.showModal();
      
      const closeDialog = () => {
        dialog.close();
        dialog.remove();
      };
      
      dialog.querySelector('.btn-close-contact').addEventListener('click', closeDialog);
      dialog.querySelector('.btn-close-contact-btn').addEventListener('click', closeDialog);
    });
  }

  // Interactive Dream Colleges Handlers
  const addDreamForm = container.querySelector('#form-add-dream-college');
  if (addDreamForm) {
    addDreamForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = container.querySelector('#add-dc-name');
      const name = input.value.trim();
      if (name) {
        const currentList = student.dreamColleges || [];
        if (!currentList.includes(name)) {
          store.updateStudent(student.id, {
            dreamColleges: [...currentList, name]
          });
          triggerToast(`Added ${name} to your dream colleges!`, 'success');
          renderStudentDashboard(container, 'dashboard', triggerToast);
        } else {
          triggerToast('College already in dream list.', 'warning');
        }
      }
    });
  }

  container.querySelectorAll('.btn-remove-dream-college').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.getAttribute('data-name');
      const currentList = student.dreamColleges || [];
      const updatedList = currentList.filter(n => n !== name);
      store.updateStudent(student.id, {
        dreamColleges: updatedList
      });
      triggerToast(`Removed ${name} from dream list.`, 'warning');
      renderStudentDashboard(container, 'dashboard', triggerToast);
    });
  });

  // View dream college details dialog
  const dbDialog = container.querySelector('#dialog-college-dashboard');
  if (dbDialog) {
    container.querySelector('#dialog-col-close-db').addEventListener('click', () => dbDialog.close());
    container.querySelector('#dialog-col-cancel-db').addEventListener('click', () => dbDialog.close());

    container.querySelectorAll('.btn-view-dream-college').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colId = btn.getAttribute('data-id');
        const matchedCollege = store.state.colleges.find(c => c.id === colId);
        if (matchedCollege) {
          container.querySelector('#modal-college-name-db').innerText = matchedCollege.name;
          
          let strengthsHTML = matchedCollege.strengths.map(s => `<span class="badge badge-indigo">${s}</span>`).join('');
          
          const fitScore = calculateCollegeMatch(student, matchedCollege);
          const reasons = [];
          const gpa = student.grades?.gpa || 0;
          const interests = [...(student.careerInterests || []), ...(student.skills || [])];
          const overlap = interests.filter(i =>
            matchedCollege.strengths.some(s => s.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(s.toLowerCase()))
          );
          if (overlap.length > 0) reasons.push(`Strong alignment in ${overlap.slice(0, 2).join(' & ')}`);
          if (gpa >= matchedCollege.targetGPA) reasons.push(`Your GPA (${gpa}) meets the target`);
          
          const improvements = [];
          if (gpa < matchedCollege.targetGPA) improvements.push(`Aim for GPA above ${matchedCollege.targetGPA}`);
          if (!student.achievements?.some(a => a.category === 'Certifications')) improvements.push('Complete a relevant certification course');
          
          let improvementsHTML = improvements.length > 0 
            ? improvements.map(i => `<li class="text-xs text-warning" style="margin-inline-start: var(--space-4);">⚠️ ${i}</li>`).join('')
            : '<li class="text-xs text-success" style="margin-inline-start: var(--space-4);">✅ No suggestions needed! Excellent fit.</li>';

          container.querySelector('#modal-college-body-db').innerHTML = `
            <p class="text-sm text-primary mb-2"><strong>${fitScore}% Fit Score</strong></p>
            <p class="text-sm text-secondary mb-4">${matchedCollege.description}</p>
            
            <div class="divider"></div>
            
            <h5 class="text-sm font-semibold mb-2">Why Recommended?</h5>
            <p class="text-xs text-success bg-emerald-50 p-3 rounded-lg mb-4">💡 ${reasons.join('. ') || 'Matches your dream list.'}</p>
            
            <h5 class="text-sm font-semibold mb-2">Programs & Strengths</h5>
            <div class="tag-list mb-4">${strengthsHTML}</div>

            <h5 class="text-sm font-semibold mb-2">Suggested Portfolio Adjustments</h5>
            <ul class="flex flex-col gap-1 mb-4">${improvementsHTML}</ul>

            <div class="divider"></div>
            
            <div class="grid-2 text-xs">
              <div>📍 <strong>Location:</strong> ${matchedCollege.location}</div>
              <div>🎓 <strong>Acceptance rate:</strong> ${matchedCollege.acceptance}</div>
            </div>
          `;
          dbDialog.showModal();
        }
      });
    });
  }
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
  // Filter colleges if selectedCategoryFilter is set
  let displayedColleges = collegeMatches;
  if (selectedCategoryFilter) {
    const courseData = COURSE_DB[selectedCategoryFilter];
    if (courseData) {
      displayedColleges = collegeMatches.filter(college => {
        const hasStrengthOverlap = college.strengths.some(s => 
          courseData.strengths.some(cs => cs.toLowerCase() === s.toLowerCase())
        );
        const hasProgramOverlap = college.programs.some(p => 
          p.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) || 
          selectedCategoryFilter.toLowerCase().includes(p.toLowerCase())
        );
        return hasStrengthOverlap || hasProgramOverlap;
      });
    }
  }

  container.innerHTML = `
    <div class="animate-fade-up stagger">
      <div class="section-header flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h2 class="section-title">AI College Match Discovery</h2>
          <p class="section-subtitle">Personalized options tailored to your grades, dream interests, and portfolio accomplishments.</p>
        </div>
        <div class="flex items-center gap-2" style="background: var(--color-slate-50); padding: var(--space-2) var(--space-4); border-radius: var(--radius-xl); border: 1px solid var(--color-border);">
          <label for="college-category-filter" class="text-xs text-secondary font-semibold">Focus Filter:</label>
          <select id="college-category-filter" class="input select" style="width: 200px; padding: 4px 8px; font-size: 13px; min-block-size: auto; border-radius: var(--radius-md);">
            <option value="all">All Categories</option>
            ${Object.keys(COURSE_DB).map(catName => `
              <option value="${catName}" ${selectedCategoryFilter === catName ? 'selected' : ''}>${catName}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="grid-3">
        ${displayedColleges.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1;">
            <div class="empty-state">
              <div class="empty-icon">🏫</div>
              <h3>No matched colleges found</h3>
              <p>No colleges found in this category matching your profile parameters. Try clearing the filter or adjusting achievements.</p>
            </div>
          </div>
        ` : displayedColleges.map(col => {
          let scoreClass = 'low';
          if (col.matchScore >= 75) scoreClass = 'high';
          else if (col.matchScore >= 50) scoreClass = 'medium';

          return `
            <!-- Tinder-Style College Match Card -->
            <div class="match-card" style="border-radius: var(--radius-2xl);">
              <div class="match-card-header">
                <div>
                  <span class="college-type-badge">${col.type} • ${col.country}</span>
                  <h3 class="font-bold text-base mt-1" style="color: var(--color-text);">${col.name}</h3>
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
              <div class="card-footer" style="display: flex; justify-content: center; background: transparent; border-block-start: none; padding-block-start: 0; padding-block-end: var(--space-4);">
                <button class="btn btn-secondary btn-sm btn-view-college" data-id="${col.id}" style="width: auto; min-width: 150px; border-radius: var(--radius-full); border: 1px solid var(--color-border);">View Reasons</button>
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
  let selectedCollege = null;

  btnClose.addEventListener('click', () => dialog.close());
  btnCancel.addEventListener('click', () => dialog.close());

  // Dropdown filter change listener
  const categoryFilterSelect = container.querySelector('#college-category-filter');
  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', (e) => {
      selectedCategoryFilter = e.target.value === 'all' ? null : e.target.value;
      renderStudentDashboard(container, 'colleges', triggerToast);
    });
  }

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
