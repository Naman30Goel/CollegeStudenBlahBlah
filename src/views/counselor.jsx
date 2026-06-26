import React, { useState, useEffect } from 'react';
import { store } from '../store/index.js';
import { computeProfileStrength, getStrengthBreakdown, getCollegeRecommendations } from '../store/ai-engine.js';

export default function CounselorWorkspace({ activeTab, triggerToast, onTabChange }) {
  const [storeState, setStoreState] = useState(store.state);

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setStoreState({ ...newState });
    });
    return unsubscribe;
  }, []);

  const counselor = store.getActiveUser();
  if (!counselor || counselor.role !== 'counselor') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <span className="material-symbols-outlined text-outline text-5xl mb-4">school</span>
        <h3 className="text-lg font-bold text-primary">No active counselor session found.</h3>
      </div>
    );
  }

  const students = storeState.students;
  const totalStudents = students.length;
  const activeStudents = students.filter(
    (s) => Date.now() - (s.lastActivity || 0) <= 7 * 86400000
  ).length;

  const studentScores = students.map((s) => computeProfileStrength(s));
  const avgCompletion = Math.round(
    studentScores.reduce((sum, s) => sum + s, 0) / (totalStudents || 1)
  );

  // Readiness score: average of GPA * 10
  const avgGpa =
    students.reduce((sum, s) => sum + (s.grades?.gpa || 0), 0) / (totalStudents || 1);
  const avgReadiness = Math.round((avgGpa / 10) * 100);

  switch (activeTab) {
    case 'overview':
      return (
        <OverviewTab
          counselor={counselor}
          students={students}
          total={totalStudents}
          active={activeStudents}
          avgCompletion={avgCompletion}
          avgReadiness={avgReadiness}
          onTabChange={onTabChange}
        />
      );
    case 'monitoring':
      return <MonitoringTab students={students} triggerToast={triggerToast} />;
    case 'reporting':
      return (
        <ReportingTab
          students={students}
          avgCompletion={avgCompletion}
          avgReadiness={avgReadiness}
          triggerToast={triggerToast}
        />
      );
    default:
      return (
        <OverviewTab
          counselor={counselor}
          students={students}
          total={totalStudents}
          active={activeStudents}
          avgCompletion={avgCompletion}
          avgReadiness={avgReadiness}
          onTabChange={onTabChange}
        />
      );
  }
}

// =============================================================
// 1. OVERVIEW TAB
// =============================================================
function OverviewTab({ counselor, students, total, active, avgCompletion, avgReadiness, onTabChange }) {
  const strongFitCount = students.filter((s) => computeProfileStrength(s) >= 70).length;
  const modFitCount = students.filter((s) => {
    const sc = computeProfileStrength(s);
    return sc >= 40 && sc < 70;
  }).length;
  const attentionCount = students.filter((s) => computeProfileStrength(s) < 40).length;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-fade-up font-sans text-left">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Counselor Dashboard</h2>
        <p className="text-sm text-on-surface-variant font-light mt-1">
          Monitor college readiness, portfolio completion trends, and profile metrics for {counselor.school}.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-label">
        <div 
          onClick={() => onTabChange('monitoring')}
          className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-primary tracking-tight">{total}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Assigned Students</div>
          </div>
        </div>

        <div 
          onClick={() => onTabChange('monitoring')}
          className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">insights</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-primary tracking-tight">{active}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Active This Week</div>
          </div>
        </div>

        <div 
          onClick={() => onTabChange('monitoring')}
          className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-primary tracking-tight">{avgCompletion}%</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Avg Profile Score</div>
          </div>
        </div>

        <div 
          onClick={() => onTabChange('monitoring')}
          className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-primary tracking-tight">{avgReadiness}/100</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Readiness Index</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="border-b border-outline-variant/20 pb-4 mb-4">
            <h3 className="font-extrabold text-primary text-base tracking-tight">Recent Student Activities</h3>
          </div>
          <div className="flex-grow divide-y divide-outline-variant/10">
            {students.slice(0, 4).map((s) => {
              const lastActStr = s.lastActivity ? new Date(s.lastActivity).toLocaleDateString() : 'Inactive';
              const latestAch = s.achievements.length > 0 ? s.achievements[s.achievements.length - 1].title : 'Updated profile details';
              return (
                <div 
                  key={s.id} 
                  onClick={() => onTabChange('monitoring')}
                  className="py-3.5 flex justify-between items-center gap-4 first:pt-0 last:pb-0 cursor-pointer hover:bg-surface-container-low/30 transition-colors px-2 rounded-xl"
                >
                  <div className="truncate">
                    <h5 className="font-extrabold text-sm text-primary truncate tracking-tight">{s.name}</h5>
                    <p className="text-xs text-on-surface-variant font-light truncate mt-0.5">{latestAch}</p>
                  </div>
                  <span className="text-[10px] text-outline font-bold shrink-0 font-label">{lastActStr}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Readiness Distribution */}
        <div className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="border-b border-outline-variant/20 pb-4 mb-4">
            <h3 className="font-extrabold text-primary text-base tracking-tight">Profile Strength Distribution</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2 font-label">
                <span className="text-secondary flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Strong Fit (Score &gt; 70)
                </span>
                <span className="text-on-surface-variant font-bold">{strongFitCount} students</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
                <div className="h-full bg-secondary" style={{ width: `${(strongFitCount / total) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2 font-label">
                <span className="text-secondary/70 flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary/70"></span> Moderate Fit (Score 40-70)
                </span>
                <span className="text-on-surface-variant font-bold">{modFitCount} students</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
                <div className="h-full bg-secondary/70" style={{ width: `${(modFitCount / total) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2 font-label">
                <span className="text-tertiary flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> Attention Needed (Score &lt; 40)
                </span>
                <span className="text-on-surface-variant font-bold">{attentionCount} students</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
                <div className="h-full bg-tertiary" style={{ width: `${(attentionCount / total) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// 2. ROSTER MONITORING TAB
// =============================================================
function MonitoringTab({ students, triggerToast }) {
  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const filtered = students.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.school.toLowerCase().includes(q) ||
      s.intendedDegree.toLowerCase().includes(q) ||
      s.careerInterests.some((i) => i.toLowerCase().includes(q))
    );
  });

  const getRosterBadgeClass = (score) => {
    if (score >= 70) return 'bg-secondary-container text-on-secondary-container';
    if (score >= 40) return 'bg-surface-container-highest text-on-surface-variant';
    return 'bg-tertiary-container text-on-tertiary-container';
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-fade-up font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/20 pb-6 font-label">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Student Progress Roster</h2>
          <p className="text-sm text-on-surface-variant font-light mt-1">
            Review portfolio completion details, degree matching targets, and activity status.
          </p>
        </div>

        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            className="ghost-input pl-10 pr-4 py-2.5 rounded-full text-xs w-full shadow-sm"
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-[24px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-container-low text-[9px] uppercase tracking-wider text-outline font-bold border-b border-outline-variant/30 font-label">
              <th className="py-4 px-6">Student Name</th>
              <th className="py-4 px-6">Grade</th>
              <th className="py-4 px-6">Intended Focus</th>
              <th className="py-4 px-6">Profile Strength</th>
              <th className="py-4 px-6">Achievements</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-outline py-8 font-light">
                  No matching student records found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const score = computeProfileStrength(s);
                return (
                  <tr key={s.id} className="hover:bg-surface-container-low/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-sm">{s.name}</td>
                    <td className="py-4 px-6 font-semibold">Grade {s.grade}</td>
                    <td className="py-4 px-6 font-light text-on-surface-variant">{s.intendedDegree}</td>
                    <td className="py-4 px-6 font-label">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getRosterBadgeClass(score)}`}>
                        {score}% Complete
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold">{s.achievements.length} items</td>
                    <td className="py-4 px-6 text-right font-label">
                      <button
                        onClick={() => setSelectedStudentId(s.id)}
                        className="secondary-button px-4 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Student Modal */}
      {selectedStudentId && (
        <InspectModal studentId={selectedStudentId} onClose={() => setSelectedStudentId(null)} triggerToast={triggerToast} />
      )}
    </div>
  );
}

function InspectModal({ studentId, onClose, triggerToast }) {
  const counselor = store.getActiveUser();
  const student = store.state.students.find(s => s.id === studentId);
  if (!student) return null;
  const score = computeProfileStrength(student);
  const breakdown = getStrengthBreakdown(student);
  const collegeMatches = getCollegeRecommendations(student);
  const [recommendedColleges, setRecommendedColleges] = useState({});

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-150 flex items-center justify-center p-4 font-sans text-left">
      <div className="bg-white border border-outline-variant/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col p-8 gap-6 animate-fade-up">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <h3 className="font-extrabold text-lg text-primary tracking-tight">{student.name} - Guidance Review</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-lg cursor-pointer bg-transparent border-0 font-bold">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[420px] pr-2 font-label">
          <div className="space-y-6">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Profile Completion</h5>
              <div className="space-y-3.5 bg-surface-container p-4 rounded-2xl border border-outline-variant/20 text-xs">
                {breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between font-light">
                    <span className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-secondary">{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="font-bold text-primary">{item.score}/{item.max}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Interests & Intended Major</h5>
              <p className="text-xs font-bold text-primary mb-2">Degree Path: {student.intendedDegree}</p>
              <div className="flex flex-wrap gap-1.5">
                {student.careerInterests.map((interest) => (
                  <span key={interest} className="bg-surface-container text-primary px-2.5 py-0.5 rounded text-[10px] font-bold">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Achievements Log</h5>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {student.achievements.length === 0 ? (
                  <p className="text-xs text-outline font-light italic">No achievements reported yet.</p>
                ) : (
                  student.achievements.map((ach) => {
                    const isVerified = ach.verified !== false;
                    return (
                      <div key={ach.id} className="pb-2 border-b border-outline-variant/15 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center gap-2 mb-0.5">
                          <strong className="text-xs text-primary">{ach.title}</strong>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${isVerified ? 'bg-secondary-container text-on-secondary-container' : 'bg-rose-100 text-rose-700'}`}>
                              {isVerified ? 'Verified' : 'Pending'}
                            </span>
                            <input 
                              type="checkbox" 
                              checked={isVerified}
                              onChange={() => {
                                const nextVal = !isVerified;
                                store.toggleAchievementVerification(student.id, ach.id, nextVal);
                                triggerToast(nextVal ? `Verified "${ach.title}"` : `Marked "${ach.title}" as pending.`, 'info');
                              }}
                              className="accent-[#0A3323] cursor-pointer"
                              title="Toggle Verification"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-on-surface-variant font-light line-clamp-2 leading-relaxed">{ach.description}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">AI Matching Recommendations</h5>
              <div className="space-y-2 text-xs">
                {collegeMatches.slice(0, 3).map((m) => {
                  const isSent = recommendedColleges[m.name];
                  return (
                    <div key={m.name} className="flex justify-between items-center py-1.5 border-b border-outline-variant/15 last:border-0">
                      <span className="font-bold text-primary">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-secondary font-bold">{m.matchScore}% Match</span>
                        <button
                          onClick={() => {
                            if (isSent) return;
                            store.sendCounselorRecommendation(student.id, counselor.name, m.name);
                            setRecommendedColleges(prev => ({ ...prev, [m.name]: true }));
                            triggerToast(`Recommended ${m.name} to ${student.name}!`, 'success');
                          }}
                          disabled={isSent}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-label cursor-pointer transition-colors border-0 ${isSent ? 'bg-secondary/15 text-secondary cursor-default' : 'bg-[#0A3323] hover:bg-[#001d11] text-white'}`}
                        >
                          {isSent ? '✓ Recommended' : 'Recommend'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-outline-variant/20 pt-4 mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-outline-variant hover:bg-surface-container rounded-full text-xs font-bold font-label cursor-pointer text-primary bg-transparent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// 3. REPORTING CENTER TAB
// =============================================================
function ReportingTab({ students, avgCompletion, avgReadiness, triggerToast }) {
  const handleExportPDF = () => {
    triggerToast('Preparing print layouts. Save page as A4 PDF document.', 'success');
    setTimeout(() => {
      window.print();
    }, 450);
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-fade-up font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Guidance Reports Center</h2>
          <p className="text-sm text-on-surface-variant font-light mt-1">
            Generate and export application readiness records for the student batch.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="primary-button px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md font-label"
        >
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export Batch Report
        </button>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm overflow-hidden">
        <div id="print-area" className="p-4">
          <div className="hidden print:block border-b-2 border-primary pb-4 mb-6 font-label">
            <h1 className="text-xl font-extrabold text-primary">ProfilED Batch Guidance Report</h1>
            <p className="text-xs text-outline mt-1 font-light">
              DPS Guidance Office • Generated on {new Date().toLocaleDateString()}
            </p>
            <div className="grid grid-cols-3 gap-6 text-xs mt-4">
              <div><strong>Students Audited:</strong> {students.length}</div>
              <div><strong>Average Profile Completion:</strong> {avgCompletion}%</div>
              <div><strong>Guidance Readiness Index:</strong> {avgReadiness}/100</div>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[9px] uppercase tracking-wider text-outline font-bold border-b border-outline-variant/30 font-label">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">GPA Boundary</th>
                <th className="py-3 px-4">Intended Major Focus</th>
                <th className="py-3 px-4">Profile Score</th>
                <th className="py-3 px-4">Achievements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-primary">
              {students.map((s) => {
                const score = computeProfileStrength(s);
                return (
                  <tr key={s.id} className="hover:bg-surface-container-low/10 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sm">{s.name}</td>
                    <td className="py-3.5 px-4 font-semibold">Grade {s.grade}</td>
                    <td className="py-3.5 px-4 font-light text-on-surface-variant">{s.grades?.gpa || '9.0'} ({s.grades?.board || ''})</td>
                    <td className="py-3.5 px-4 font-light text-on-surface-variant">{s.intendedDegree}</td>
                    <td className="py-3.5 px-4 font-bold text-secondary font-label">{score}%</td>
                    <td className="py-3.5 px-4 font-semibold">{s.achievements.length} items</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

