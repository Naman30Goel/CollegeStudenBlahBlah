import React, { useState, useEffect } from 'react';
import { store, checkDevMode } from '../store/index.js';
import { computeProfileStrength, matchStudentsForCollege } from '../store/ai-engine.js';

export default function CollegeWorkspace({ activeTab, triggerToast, onTabChange }) {
  const [storeState, setStoreState] = useState(store.state);
  const isDevMode = checkDevMode();
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [openModal, setOpenModal] = useState(null); // null | 'student_profile' | 'preferences' | 'create_campaign'
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedStudentIds, setBookmarkedStudentIds] = useState([]);

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setStoreState({ ...newState });
    });
    return unsubscribe;
  }, []);

  const activeUser = store.getActiveUser();
  let college = null;
  let isEmployee = false;

  if (!activeUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <span className="material-symbols-outlined text-outline text-5xl mb-4">domain</span>
        <h3 className="text-lg font-bold text-primary">No active session found.</h3>
      </div>
    );
  }

  if (activeUser.role === 'college_admin') {
    college = activeUser;
  } else if (activeUser.role === 'college_employee') {
    college = store.state.colleges.find((c) => c.id === activeUser.collegeId);
    isEmployee = true;
  }

  if (!college) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <span className="material-symbols-outlined text-outline text-5xl mb-4">domain</span>
        <h3 className="text-lg font-bold text-primary">No associated college found for your session.</h3>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab college={college} triggerToast={triggerToast} setOpenModal={setOpenModal} setSelectedStudentId={setSelectedStudentId} onTabChange={onTabChange} />;
      case 'discovery':
        return (
          <RecruitmentOverviewTab 
            college={college} 
            triggerToast={triggerToast} 
            onTabChange={onTabChange} 
            setSelectedStudentId={setSelectedStudentId} 
            setOpenModal={setOpenModal} 
            searchQuery={searchQuery}
            bookmarkedStudentIds={bookmarkedStudentIds}
            setBookmarkedStudentIds={setBookmarkedStudentIds}
          />
        );
      case 'matches':
        return <MatchingTab college={college} triggerToast={triggerToast} onTabChange={onTabChange} setSelectedStudentId={setSelectedStudentId} setOpenModal={setOpenModal} />;
      case 'opportunities':
        return <OpportunitiesTab setOpenModal={setOpenModal} />;
      case 'community':
        return <MessagingCenterTab college={college} triggerToast={triggerToast} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} />;
      case 'resources':
        return <ResourcesTab />;
      default:
        return (
          <RecruitmentOverviewTab 
            college={college} 
            triggerToast={triggerToast} 
            onTabChange={onTabChange} 
            setSelectedStudentId={setSelectedStudentId} 
            setOpenModal={setOpenModal} 
            searchQuery={searchQuery}
            bookmarkedStudentIds={bookmarkedStudentIds}
            setBookmarkedStudentIds={setBookmarkedStudentIds}
          />
        );
    }
  };

  const isDarkHeader = activeTab === 'community';

  return (
    <div className="bg-gradient-to-b from-[#FEFBDB] via-[#EAF2D3]/30 to-[#FEFBDB] min-h-screen flex flex-col overflow-x-hidden font-sans relative">
      
      {/* Floating Pill Top Nav Bar */}
      <div className="w-full px-6 pt-4 sticky top-0 z-50">
        <header className={`max-w-7xl mx-auto rounded-full px-8 py-3.5 flex justify-between items-center shadow-sm transition-all duration-300 ${
          isDarkHeader 
            ? 'bg-[#0A3323] text-white border border-white/10' 
            : 'bg-white/95 backdrop-blur-md border border-[#ECE9CB]/50 text-primary'
        }`}>
          {/* Logo with Sprout Leaf Icon */}
          <div className="flex items-center gap-1.5">
            {!isDarkHeader && (
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#0A3323] shrink-0">
                <path d="M21 3s-3.87 0-7.64 3.78C11.53 8.61 10.43 10.96 10 13h4c.43-2.04 1.53-4.39 3.36-6.22C19.13 5 21 3 21 3zm-9 10H8c-.43 2.04-1.53 4.39-3.36 6.22C2.87 21 1 23 1 23s3.87 0 7.64-3.78C10.47 17.39 11.57 15.04 12 13z" />
              </svg>
            )}
            <span className={`font-bold text-xl tracking-tight ${isDarkHeader ? 'text-white' : 'text-[#0A3323]'}`}>
              {isDarkHeader ? 'ScholarCloud' : 'ProfilED'}
            </span>
          </div>
          
          {/* Nav links */}
          <nav className="hidden md:flex gap-8 text-xs font-bold font-label">
            <button 
              onClick={() => onTabChange('overview')} 
              className={`${activeTab === 'overview' 
                ? (isDarkHeader ? 'text-white border-b-2 border-white pb-0.5' : 'text-[#0A3323] border-b-2 border-[#0A3323] pb-0.5') 
                : (isDarkHeader ? 'text-white/70 hover:text-white' : 'text-on-surface-variant hover:text-[#0A3323]')
              } transition-colors cursor-pointer bg-transparent border-0 font-bold`}
            >
              Home
            </button>
            <button 
              onClick={() => onTabChange('discovery')} 
              className={`${activeTab === 'discovery' 
                ? (isDarkHeader ? 'text-white border-b-2 border-white pb-0.5' : 'text-[#0A3323] border-b-2 border-[#0A3323] pb-0.5') 
                : (isDarkHeader ? 'text-white/70 hover:text-white' : 'text-on-surface-variant hover:text-[#0A3323]')
              } transition-colors cursor-pointer bg-transparent border-0 font-bold`}
            >
              Discover
            </button>
            <button 
              onClick={() => onTabChange('matches')} 
              className={`${activeTab === 'matches' 
                ? (isDarkHeader ? 'text-white border-b-2 border-white pb-0.5' : 'text-[#0A3323] border-b-2 border-[#0A3323] pb-0.5') 
                : (isDarkHeader ? 'text-white/70 hover:text-white' : 'text-on-surface-variant hover:text-[#0A3323]')
              } transition-colors cursor-pointer bg-transparent border-0 font-bold`}
            >
              Colleges
            </button>
            <button 
              onClick={() => onTabChange('opportunities')} 
              className={`${activeTab === 'opportunities' 
                ? (isDarkHeader ? 'text-white border-b-2 border-white pb-0.5' : 'text-[#0A3323] border-b-2 border-[#0A3323] pb-0.5') 
                : (isDarkHeader ? 'text-white/70 hover:text-white' : 'text-on-surface-variant hover:text-[#0A3323]')
              } transition-colors cursor-pointer bg-transparent border-0 font-bold`}
            >
              Opportunities
            </button>
            <button 
              onClick={() => onTabChange('community')} 
              className={`${activeTab === 'community' 
                ? (isDarkHeader ? 'text-white border-b-2 border-white pb-0.5' : 'text-[#0A3323] border-b-2 border-[#0A3323] pb-0.5') 
                : (isDarkHeader ? 'text-white/70 hover:text-white' : 'text-on-surface-variant hover:text-[#0A3323]')
              } transition-colors cursor-pointer bg-transparent border-0 font-bold`}
            >
              Community
            </button>
            <button 
              onClick={() => onTabChange('resources')} 
              className={`${activeTab === 'resources' 
                ? (isDarkHeader ? 'text-white border-b-2 border-white pb-0.5' : 'text-[#0A3323] border-b-2 border-[#0A3323] pb-0.5') 
                : (isDarkHeader ? 'text-white/70 hover:text-white' : 'text-on-surface-variant hover:text-[#0A3323]')
              } transition-colors cursor-pointer bg-transparent border-0 font-bold`}
            >
              Resources
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 font-label text-xs">
            {!isDarkHeader && (
              <div className="relative hidden sm:flex items-center bg-[#FEFBDB]/50 border border-[#ECE9CB] rounded-full px-3 py-1 text-on-surface-variant font-label max-w-[150px]">
                <span className="material-symbols-outlined text-[14px] text-outline mr-1">search</span>
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-[10px] focus:outline-none w-full text-primary placeholder-on-surface-variant/50"
                />
              </div>
            )}
            
            <button className={`relative transition-colors cursor-pointer flex items-center justify-center p-1 rounded-full border-0 bg-transparent ${
              isDarkHeader ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-on-surface-variant hover:text-[#0A3323] hover:bg-surface-container/30'
            }`}>
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            
            <button onClick={() => onTabChange('community')} className={`relative transition-colors cursor-pointer flex items-center justify-center p-1 rounded-full border-0 bg-transparent ${
              isDarkHeader ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-on-surface-variant hover:text-[#0A3323] hover:bg-surface-container/30'
            }`}>
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onTabChange('overview')}>
              <img
                src={isDarkHeader 
                  ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" // Sarah Jenkins
                  : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" // Admin suit
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>
      </div>

      {/* Main active tab content */}
      <div className="flex-1">
        {renderActiveTab()}
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 w-full mt-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-label text-on-surface-variant">
          <span className="font-bold text-[#0A3323] text-sm">ProfilED</span>
          
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Help Center</a>
            <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
            <a href="#" className="hover:text-primary transition-colors">About</a>
          </div>
          
          <span className="text-outline font-medium">© 2024 ProfilED. All rights reserved.</span>
        </div>
      </footer>

      {/* Floating Evaluation Switcher widget */}
      {isDevMode && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/30 shadow-lg">
          <span className="text-[9px] font-bold text-on-surface-variant/70 uppercase">Test Swap:</span>
          <div className="flex gap-1">
            {[
              { id: 'stu_001', name: 'Alex', role: 'Student' },
              { id: 'cou_001', name: 'Ms. Deepa', role: 'Counselor' },
              { id: 'col_001', name: 'Ashoka', role: 'College' },
              { id: 'sad_001', name: 'Admin (Naman)', role: 'SuperAdmin' },
              { id: 'adm_001', name: 'Admin', role: 'Admin' },
            ].map((swUser) => (
              <button
                key={swUser.id}
                onClick={() => {
                  store.switchRole(swUser.id);
                  triggerToast(`Switched active session to: ${swUser.name}`, 'info');
                }}
                className={`px-1.5 py-0.5 text-[10px] rounded transition-colors font-medium cursor-pointer ${
                  college.id === swUser.id || (swUser.id === 'col_001' && activeUser.role?.startsWith('college'))
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {swUser.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal Manager */}
      {openModal === 'student_profile' && selectedStudentId && (
        <StudentProfileModal 
          studentId={selectedStudentId} 
          onClose={() => {
            setOpenModal(null);
            setSelectedStudentId(null);
          }}
          triggerToast={triggerToast}
        />
      )}

      {openModal === 'preferences' && (
        <PreferencesModal 
          college={college} 
          onClose={() => setOpenModal(null)} 
          triggerToast={triggerToast}
        />
      )}

      {openModal === 'create_campaign' && (
        <OutreachCampaignModal 
          college={college} 
          onClose={() => setOpenModal(null)} 
          triggerToast={triggerToast}
        />
      )}

    </div>
  );
}

// =============================================================
// HELPER MODALS
// =============================================================
function StudentProfileModal({ studentId, onClose, triggerToast }) {
  const student = store.state.students.find(s => s.id === studentId);
  if (!student) return null;
  const score = computeProfileStrength(student);
  
  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white border border-[#ECE9CB]/40 rounded-3xl w-full max-w-lg shadow-2xl p-8 relative font-sans text-left animate-fade-up">
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-on-surface-variant hover:text-[#0A3323] cursor-pointer text-base bg-transparent border-0 font-bold"
        >
          ✕
        </button>
        
        <h3 className="font-extrabold text-base text-primary tracking-tight border-b border-[#ECE9CB]/35 pb-2 mb-4">Student Portfolio Preview</h3>
        
        <div className="flex items-center gap-4 py-1 mb-4">
          {student.avatar ? (
            <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover border border-[#ECE9CB]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-xs flex items-center justify-center border border-[#ECE9CB]">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div>
            <h4 className="font-extrabold text-sm text-primary">{student.name}</h4>
            <p className="text-[11px] text-on-surface-variant font-light mt-0.5">{student.school} &bull; Grade {student.grade}</p>
            <p className="text-[9px] text-outline font-bold mt-0.5 font-label">{student.city}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-label mb-4">
          <div className="bg-[#FEFBDB]/50 p-2.5 rounded-xl border border-[#ECE9CB]/40">
            <span className="text-outline font-bold uppercase tracking-wider block text-[8px]">Academic GPA</span>
            <p className="font-extrabold text-primary mt-0.5">{student.grades?.gpa || '9.0'} GPA ({student.grades?.board || 'CBSE'})</p>
          </div>
          <div className="bg-[#FEFBDB]/50 p-2.5 rounded-xl border border-[#ECE9CB]/40">
            <span className="text-outline font-bold uppercase tracking-wider block text-[8px]">Match Score</span>
            <p className="font-extrabold text-secondary mt-0.5">{score}% Match</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-outline">Achievements Log</h4>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
            {student.achievements.length === 0 ? (
              <p className="text-xs text-on-surface-variant font-light italic">No achievements verified yet.</p>
            ) : (
              student.achievements.map((ach) => (
                <div key={ach.id} className="p-2.5 bg-[#FEFBDB]/20 border border-[#ECE9CB]/30 rounded-xl">
                  <div className="flex justify-between items-baseline">
                    <strong className="text-primary text-[11px]">{ach.title}</strong>
                    <span className="text-[8px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">{ach.category}</span>
                  </div>
                  <p className="text-[9px] text-outline font-medium mt-0.5">{ach.date}</p>
                  <p className="text-[10px] text-on-surface-variant font-light mt-1 leading-relaxed">{ach.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-1.5 mb-5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-outline">Skills & Focus</h4>
          <div className="flex flex-wrap gap-1 font-label text-[9px] font-bold">
            {student.skills.map((skill) => (
              <span key={skill} className="bg-secondary/10 text-secondary px-2.5 py-1 rounded-full border border-secondary/15">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={onClose} 
            className="bg-[#0A3323] hover:bg-[#001d11] text-white px-5 py-2 rounded-full text-xs font-bold cursor-pointer border-0 font-label"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferencesModal({ college, onClose, triggerToast }) {
  const targetPrefs = college.targetPrefs || { minGPA: 8.0, grades: [11, 12], interests: ['Liberal Arts', 'Technology'], minScore: 60 };
  const [minGPA, setMinGPA] = useState(targetPrefs.minGPA);
  const [minScore, setMinScore] = useState(targetPrefs.minScore || 60);
  const [interests, setInterests] = useState(targetPrefs.interests.join(', '));

  const handleSubmit = (e) => {
    e.preventDefault();
    const interestList = interests.split(',').map(s => s.trim()).filter(s => s.length > 0);
    store.updateCollegeTargetPrefs(college.id, {
      minGPA: parseFloat(minGPA),
      minScore: parseInt(minScore, 10),
      interests: interestList
    });
    triggerToast('Target Preferences updated! Match Scores recalculated.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white border border-[#ECE9CB]/40 rounded-3xl w-full max-w-lg shadow-2xl p-8 relative font-sans text-left animate-fade-up space-y-4">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-[#0A3323] cursor-pointer text-base bg-transparent border-0 font-bold">✕</button>
        
        <h3 className="font-extrabold text-lg text-primary tracking-tight">AI Matching Preferences</h3>
        <p className="text-xs text-on-surface-variant font-light">Fine-tune matching criteria for incoming student prospects.</p>
        
        <div className="space-y-3 font-label text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-primary">Minimum Target GPA</label>
            <input 
              type="number" 
              step="0.1" 
              min="0.0" 
              max="10.0" 
              value={minGPA} 
              onChange={(e) => setMinGPA(e.target.value)}
              className="ghost-input px-3.5 py-2.5 rounded-full"
              style={{ backgroundColor: '#F7F4D5' }}
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-bold text-primary">Min Match Threshold Score (%)</label>
            <input 
              type="number" 
              min="40" 
              max="100" 
              value={minScore} 
              onChange={(e) => setMinScore(e.target.value)}
              className="ghost-input px-3.5 py-2.5 rounded-full"
              style={{ backgroundColor: '#F7F4D5' }}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-primary">Focus Interests (Comma separated)</label>
            <input 
              type="text" 
              value={interests} 
              onChange={(e) => setInterests(e.target.value)}
              className="ghost-input px-3.5 py-2.5 rounded-full"
              style={{ backgroundColor: '#F7F4D5' }}
              required
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="border border-[#ECE9CB] hover:bg-surface-container text-[#0A3323] px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer bg-transparent">Cancel</button>
          <button type="submit" className="bg-[#0A3323] hover:bg-[#001d11] text-white px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer border-0">Save Preferences</button>
        </div>
      </form>
    </div>
  );
}

function OutreachCampaignModal({ college, onClose, triggerToast }) {
  const [title, setTitle] = useState('');
  const [matchThreshold, setMatchThreshold] = useState(70);
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      triggerToast('Please fill out all fields.', 'error');
      return;
    }
    store.createCampaign(college.id, college.name, title, parseInt(matchThreshold, 10), text);
    triggerToast('Outreach Campaign created and dispatched to matching candidates!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white border border-[#ECE9CB]/40 rounded-3xl w-full max-w-lg shadow-2xl p-8 relative font-sans text-left animate-fade-up space-y-4">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-[#0A3323] cursor-pointer text-base bg-transparent border-0 font-bold">✕</button>
        
        <h3 className="font-extrabold text-lg text-primary tracking-tight">Create Marketing Campaign</h3>
        <p className="text-xs text-on-surface-variant font-light">Target high-potential student prospects matching your criteria.</p>

        <div className="space-y-3 font-label text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-primary">Campaign Title</label>
            <input 
              type="text" 
              placeholder="e.g. Merit Scholarships Open" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="ghost-input px-3.5 py-2.5 rounded-full"
              style={{ backgroundColor: '#F7F4D5' }}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-primary">Target Match Threshold Score (%)</label>
            <input 
              type="number" 
              min="50" 
              max="100" 
              value={matchThreshold} 
              onChange={(e) => setMatchThreshold(e.target.value)}
              className="ghost-input px-3.5 py-2.5 rounded-full"
              style={{ backgroundColor: '#F7F4D5' }}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-primary">Campaign Message</label>
            <textarea 
              rows="3" 
              placeholder="Enter outreach details..." 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              className="ghost-input px-3.5 py-2.5 rounded-2xl resize-none"
              style={{ backgroundColor: '#F7F4D5' }}
              required
            ></textarea>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="border border-[#ECE9CB] hover:bg-surface-container text-[#0A3323] px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer bg-transparent">Cancel</button>
          <button type="submit" className="bg-[#0A3323] hover:bg-[#001d11] text-white px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer border-0">Launch Campaign</button>
        </div>
      </form>
    </div>
  );
}

// =============================================================
// 1. RECRUITMENT OVERVIEW TAB (DISCOVER TAB)
// =============================================================
function RecruitmentOverviewTab({ college, triggerToast, onTabChange, setSelectedStudentId, setOpenModal, searchQuery, bookmarkedStudentIds, setBookmarkedStudentIds }) {
  const [classOf2025Only, setClassOf2025Only] = useState(true);
  const [stemFocusOnly, setStemFocusOnly] = useState(true);
  const [highGpaOnly, setHighGpaOnly] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(2);

  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) return;
    
    const headers = ['Name', 'School', 'City', 'Grade', 'GPA', 'Match Score', 'Interests'];
    const rows = filteredCandidates.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.school.replace(/"/g, '""')}"`,
      `"${c.city.replace(/"/g, '""')}"`,
      c.grade,
      c.grades?.gpa || 'N/A',
      `${c.matchScore}%`,
      `"${(c.careerInterests || []).join(', ').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${college.name.replace(/\s+/g, '_')}_Discovery_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Discovery Report exported successfully (CSV/Excel).', 'success');
  };

  const renderCandidateActions = (studentId, studentName) => {
    const comm = store.state.communications.find(
      c => c.fromCollegeId === college.id && c.toStudentId === studentId
    );
    
    const handleMessageClick = () => {
      if (!comm) {
        store.sendContactRequest(college.id, studentId, 'interest', `Hello! ${college.name} is interested in connecting with you.`);
        triggerToast(`Contact connection initiated with ${studentName}!`, 'success');
      }
      setSelectedStudentId(studentId);
      onTabChange('community');
    };

    const handleInviteClick = () => {
      store.sendContactRequest(college.id, studentId, 'interest', `Hello! ${college.name} is interested in inviting you to apply.`);
      triggerToast(`Direct match invite sent to ${studentName}!`, 'success');
    };

    const isBookmarked = bookmarkedStudentIds.includes(studentId);
    const toggleBookmark = () => {
      if (isBookmarked) {
        setBookmarkedStudentIds(prev => prev.filter(id => id !== studentId));
        triggerToast(`Removed ${studentName} from bookmarked prospects.`, 'info');
      } else {
        setBookmarkedStudentIds(prev => [...prev, studentId]);
        triggerToast(`Bookmarked ${studentName}!`, 'success');
      }
    };

    if (!comm) {
      return (
        <div className="flex items-center gap-3 font-label pt-2">
          <button 
            onClick={handleInviteClick}
            className="border border-[#0A3323] hover:bg-[#0A3323]/5 text-[#0A3323] text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors bg-white shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span> Direct Invite
          </button>
          <button 
            onClick={handleMessageClick}
            className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm text-center border-0"
          >
            Message
          </button>
          <button 
            onClick={toggleBookmark}
            className="w-9 h-9 rounded-full border border-outline-variant/60 hover:bg-surface-container/20 flex items-center justify-center cursor-pointer transition-colors text-on-surface-variant bg-transparent"
          >
            <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'text-secondary filled' : ''}`}>
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>
      );
    }

    if (comm.status === 'pending') {
      return (
        <div className="flex items-center gap-3 font-label pt-2">
          <button 
            disabled
            className="border border-outline-variant text-outline text-xs font-bold px-6 py-2.5 rounded-full bg-surface-container-low shadow-sm flex items-center gap-1.5 opacity-60"
          >
            <span className="material-symbols-outlined text-[16px]">hourglass_empty</span> Pending Response
          </button>
          <button 
            onClick={() => {
              setSelectedStudentId(studentId);
              setOpenModal('student_profile');
            }}
            className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm text-center border-0"
          >
            View Full Profile
          </button>
          <button 
            onClick={toggleBookmark}
            className="w-9 h-9 rounded-full border border-outline-variant/60 hover:bg-surface-container/20 flex items-center justify-center cursor-pointer transition-colors text-on-surface-variant bg-transparent"
          >
            <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'text-secondary filled' : ''}`}>
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 font-label pt-2">
        <button 
          onClick={handleMessageClick}
          className="border border-[#0A3323] hover:bg-[#0A3323]/5 text-[#0A3323] text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors bg-white shadow-sm flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">mail</span> Message
        </button>
        <button 
          onClick={() => {
            setSelectedStudentId(studentId);
            setOpenModal('student_profile');
          }}
          className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm text-center border-0"
        >
          View Full Profile
        </button>
        <button 
          onClick={toggleBookmark}
          className="w-9 h-9 rounded-full border border-outline-variant/60 hover:bg-surface-container/20 flex items-center justify-center cursor-pointer transition-colors text-on-surface-variant bg-transparent"
        >
          <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'text-secondary filled' : ''}`}>
            {isBookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
    );
  };

  const allCandidates = matchStudentsForCollege(college, store.state.students);

  const filteredCandidates = allCandidates.filter(student => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = student.name.toLowerCase().includes(q);
      const schoolMatch = student.school.toLowerCase().includes(q);
      const cityMatch = student.city.toLowerCase().includes(q);
      const interestMatch = student.careerInterests?.some(i => i.toLowerCase().includes(q));
      if (!nameMatch && !schoolMatch && !cityMatch && !interestMatch) return false;
    }

    // Class of 2025 chip (Grade 12)
    if (classOf2025Only && student.grade !== 12) return false;

    // STEM Focus chip
    if (stemFocusOnly) {
      const hasStem = (student.careerInterests || []).some(interest => {
        const item = interest.toLowerCase();
        return item.includes('engineering') || item.includes('tech') || item.includes('science') || item.includes('robotics') || item.includes('math') || item.includes('biology') || item.includes('physics') || item.includes('pcm');
      });
      if (!hasStem) return false;
    }

    // High GPA chip
    if (highGpaOnly && (student.grades?.gpa || 0) < 9.0) return false;

    return true;
  });

  const getAIInsightForStudent = (student) => {
    if (student.name.includes('Sarah Jenkins')) {
      return "Strong candidate for Environmental Science programs. Demonstrated leadership in local climate initiatives. High probability of engagement based on recent campus tour views.";
    }
    if (student.name.includes('Marcus Chen')) {
      return "Solid foundation in Mathematics and early Web3 development. Aligning well with our new Interdisciplinary Tech major. Might need scholarship incentives to increase yield probability.";
    }
    const focusWord = student.careerInterests?.[0] || student.intendedDegree || "studies";
    return `Excellent prospect in ${focusWord}. Matches target college criteria with ${student.achievements.length} verified achievements. Estimated yield is high (${student.matchScore}% Match).`;
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-fade-up font-sans">
      
      {/* Title & Top Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0A3323] tracking-tight">Recruitment Overview</h2>
          <p className="text-xs text-on-surface-variant font-light mt-1">
            Monitor discovery pipeline and student match insights.
          </p>
        </div>
        
        <div className="flex items-center gap-3 font-label">
          <button 
            onClick={handleExportCSV}
            className="px-5 py-2 border border-outline-variant hover:bg-white text-primary text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm bg-transparent flex items-center gap-1 font-sans"
          >
            <span className="material-symbols-outlined text-[16px]">download</span> Export Report
          </button>
          
          <button 
            onClick={() => setOpenModal('preferences')}
            className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm flex items-center gap-1 border-0 font-sans"
          >
            <span className="material-symbols-outlined text-[16px]">filter_list</span> Target Prefs <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-label">
        
        {/* Matches */}
        <div className="bg-[#FEFBDB]/90 border border-[#ECE9CB]/60 rounded-[24px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-[140px]">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-on-surface-variant/70 text-[10px] font-extrabold uppercase tracking-widest block">Student Matches</span>
              <h3 className="text-3xl font-extrabold text-[#0A3323] tracking-tight mt-3">{filteredCandidates.length}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#EAF2D3] flex items-center justify-center text-[#0A3323]">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 pt-2">
            <span className="bg-[#D3ECA2] text-[#576B30] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span> +12%
            </span>
            <span className="text-[10px] text-outline font-medium">vs last week</span>
          </div>
        </div>

        {/* Views */}
        <div className="bg-[#FEFBDB]/90 border border-[#ECE9CB]/60 rounded-[24px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-[140px]">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-on-surface-variant/70 text-[10px] font-extrabold uppercase tracking-widest block">Profile Views</span>
              <h3 className="text-3xl font-extrabold text-[#0A3323] tracking-tight mt-3">8.5k</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#EAF2D3] flex items-center justify-center text-[#0A3323]">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 pt-2">
            <span className="bg-[#D3ECA2] text-[#576B30] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span> +5.2%
            </span>
            <span className="text-[10px] text-outline font-medium">vs last week</span>
          </div>
        </div>

        {/* Leads */}
        <div className="bg-[#FEFBDB]/90 border border-[#ECE9CB]/60 rounded-[24px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-[140px]">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-on-surface-variant/70 text-[10px] font-extrabold uppercase tracking-widest block">New Leads</span>
              <h3 className="text-3xl font-extrabold text-[#0A3323] tracking-tight mt-3">342</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#EAF2D3] flex items-center justify-center text-[#0A3323]">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 pt-2">
            <span className="bg-[#FFDAD6] text-[#93000a] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_down</span> -2%
            </span>
            <span className="text-[10px] text-outline font-medium">vs last week</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-[#FEFBDB]/90 border border-[#ECE9CB]/60 rounded-[24px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-[140px]">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-on-surface-variant/70 text-[10px] font-extrabold uppercase tracking-widest block">Conversion Rate</span>
              <h3 className="text-3xl font-extrabold text-[#0A3323] tracking-tight mt-3">18.4%</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#EAF2D3] flex items-center justify-center text-[#0A3323]">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 pt-2">
            <span className="bg-[#D3ECA2] text-[#576B30] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span> +1.1%
            </span>
            <span className="text-[10px] text-outline font-medium">vs last week</span>
          </div>
        </div>

      </div>

      {/* AI Matching Preferences Row */}
      <div className="bg-[#EAF2D3]/30 border border-[#ECE9CB]/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0A3323] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] filled">psychology</span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#0A3323] font-label uppercase tracking-wider">AI Matching Preferences</h4>
            <p className="text-xs text-on-surface-variant/80 font-light mt-0.5">
              GPA &gt; {college.targetPrefs?.minGPA || 8.0} &bull; Interests: {(college.targetPrefs?.interests || ['Technology']).join(', ')} &bull; Min Match Score: {college.targetPrefs?.minScore || 60}%
            </p>
          </div>
        </div>
        <button 
          onClick={() => setOpenModal('preferences')}
          className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-5 py-2 rounded-full cursor-pointer transition-colors shadow-sm font-label border-0"
        >
          Set Exact Preferences
        </button>
      </div>

      {/* Two Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Discovery Feed (Spans 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-[#0A3323] tracking-tight">Discovery Feed</h3>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-[10px] font-bold font-label">
              <button 
                onClick={() => {
                  setClassOf2025Only(prev => !prev);
                  triggerToast(classOf2025Only ? 'Disabled Class of 2025 filter.' : 'Enabled Class of 2025 filter.', 'info');
                }}
                className={`px-3 py-1 rounded-full border cursor-pointer transition-colors ${classOf2025Only ? 'bg-[#F2EFD0]/70 border-[#ECE9CB]/60 text-[#0A3323]' : 'bg-white border-outline-variant/30 text-outline'}`}
              >
                Class of 2025
              </button>
              
              <button 
                onClick={() => {
                  setStemFocusOnly(prev => !prev);
                  triggerToast(stemFocusOnly ? 'Disabled STEM Focus filter.' : 'Enabled STEM Focus filter.', 'info');
                }}
                className={`px-3 py-1 rounded-full border cursor-pointer transition-colors flex items-center gap-1 ${stemFocusOnly ? 'bg-[#F2EFD0]/70 border-[#ECE9CB]/60 text-[#0A3323]' : 'bg-white border-outline-variant/30 text-outline'}`}
              >
                STEM Focus {stemFocusOnly && <span>&times;</span>}
              </button>

              <button 
                onClick={() => {
                  setHighGpaOnly(prev => !prev);
                  triggerToast(highGpaOnly ? 'Disabled High GPA filter.' : 'Enabled High GPA filter.', 'info');
                }}
                className={`px-3 py-1 rounded-full border cursor-pointer transition-colors flex items-center gap-1 ${highGpaOnly ? 'bg-[#F2EFD0]/70 border-[#ECE9CB]/60 text-[#0A3323]' : 'bg-white border-outline-variant/30 text-outline'}`}
              >
                GPA &gt; 9.0 {highGpaOnly && <span>&times;</span>}
              </button>
              
              <button 
                onClick={() => setOpenModal('preferences')}
                className="border border-[#0A3323] text-[#0A3323] px-3 py-1 rounded-full cursor-pointer bg-white hover:bg-[#0A3323]/5 transition-colors font-sans"
              >
                + Preferences
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-[#ECE9CB]/25 text-center text-outline font-light">
                No candidate profiles found matching current filters.
              </div>
            ) : (
              filteredCandidates.slice(0, displayLimit).map(student => {
                const avatar = student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`;
                const interests = student.careerInterests || [];
                const classification = student.grade === 12 ? 'Senior' : 'Junior';
                return (
                  <div key={student.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-[#ECE9CB]/25 flex flex-col md:flex-row gap-6 relative">
                    <div className="shrink-0 flex justify-center">
                      <img 
                        src={avatar} 
                        alt={student.name} 
                        className="w-16 h-16 rounded-full object-cover border border-[#ECE9CB]" 
                      />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-extrabold text-base text-primary">{student.name}</h4>
                          <div className="text-xs text-on-surface-variant/80 mt-0.5 font-label font-light">
                            {classification} &bull; GPA: {student.grades?.gpa || 'N/A'} &bull; {student.city}
                          </div>
                        </div>
                        <span className="bg-[#D3ECA2] text-[#576B30] text-[10px] font-bold px-2.5 py-1 rounded-full font-label flex items-center gap-1 shadow-sm shrink-0">
                          <span className="material-symbols-outlined text-[12px] font-bold">check_circle</span>
                          {student.matchScore}% Match
                        </span>
                      </div>

                      {/* AI Insight Box */}
                      <div className="bg-[#FEFBDB] border border-[#ECE9CB]/50 rounded-xl p-3.5 space-y-1">
                        <div className="text-[9px] font-bold text-outline flex items-center gap-1 font-label uppercase tracking-widest">
                          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-outline shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v3h3v-3h3v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                          </svg>
                          AI Insight
                        </div>
                        <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                          {getAIInsightForStudent(student)}
                        </p>
                      </div>

                      <div className="flex gap-2 font-label text-[9px] font-bold">
                        {interests.slice(0, 3).map(interest => (
                          <span key={interest} className="bg-[#F2EFD0]/40 border border-[#ECE9CB]/60 text-[#0A3323] px-3 py-1 rounded-full">{interest}</span>
                        ))}
                      </div>

                      {renderCandidateActions(student.id, student.name)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Load More Prospects Button */}
          {filteredCandidates.length > displayLimit && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => {
                  setDisplayLimit(prev => prev + 2);
                  triggerToast('Loaded more prospects matching search criteria.', 'success');
                }}
                className="px-6 py-2.5 border border-[#0A3323] hover:bg-white text-[#0A3323] text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm font-label flex items-center gap-1 bg-transparent font-sans"
              >
                Load More Prospects <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Engagement Trends & Chart (Spans 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm space-y-6 relative">
            <div className="flex justify-between items-center pb-2">
              <h3 className="font-extrabold text-base text-primary">Engagement Trends</h3>
              <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-0">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>

            {/* Main Engagement Stats */}
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-outline font-label uppercase tracking-widest">Weekly Active Prospects</span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-primary tracking-tight">2,410</h3>
                <span className="text-xs font-bold text-secondary flex items-center gap-0.5">
                  +14% <span className="text-[10px] text-outline font-normal">vs last week</span>
                </span>
              </div>
            </div>

            {/* Custom Flexbox Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-36 flex items-end justify-between gap-2.5 px-2">
                {/* Mon */}
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-[#EAF2D3] rounded-t-full transition-all duration-300 group-hover:bg-[#D3ECA2] cursor-pointer" style={{ height: '40%' }} title="Monday: 964 active"></div>
                  <span className="text-[9px] font-bold text-outline font-label">M</span>
                </div>
                {/* Tue */}
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-[#EAF2D3] rounded-t-full transition-all duration-300 group-hover:bg-[#D3ECA2] cursor-pointer" style={{ height: '55%' }} title="Tuesday: 1,325 active"></div>
                  <span className="text-[9px] font-bold text-outline font-label">T</span>
                </div>
                {/* Wed (Highlighted Wednesday) */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-[#0A3323] rounded-t-full cursor-pointer relative" style={{ height: '85%' }} title="Wednesday: 2,048 active">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0A3323] text-white text-[8px] font-bold px-1 py-0.5 rounded shadow opacity-0 hover:opacity-100 transition-opacity">Peak</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#0A3323] font-label font-extrabold">W</span>
                </div>
                {/* Thu */}
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-[#EAF2D3] rounded-t-full transition-all duration-300 group-hover:bg-[#D3ECA2] cursor-pointer" style={{ height: '50%' }} title="Thursday: 1,205 active"></div>
                  <span className="text-[9px] font-bold text-outline font-label">T</span>
                </div>
                {/* Fri */}
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-[#EAF2D3] rounded-t-full transition-all duration-300 group-hover:bg-[#D3ECA2] cursor-pointer" style={{ height: '70%' }} title="Friday: 1,687 active"></div>
                  <span className="text-[9px] font-bold text-outline font-label">F</span>
                </div>
                {/* Sat */}
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-[#EAF2D3] rounded-t-full transition-all duration-300 group-hover:bg-[#D3ECA2] cursor-pointer" style={{ height: '80%' }} title="Saturday: 1,928 active"></div>
                  <span className="text-[9px] font-bold text-outline font-label">S</span>
                </div>
                {/* Sun */}
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-[#EAF2D3] rounded-t-full transition-all duration-300 group-hover:bg-[#D3ECA2] cursor-pointer" style={{ height: '60%' }} title="Sunday: 1,446 active"></div>
                  <span className="text-[9px] font-bold text-outline font-label">S</span>
                </div>
              </div>
            </div>

            {/* Insight Text Callout */}
            <div className="bg-[#FEFBDB] border border-[#ECE9CB]/50 rounded-xl p-3.5 flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">lightbulb</span>
              <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                Peak engagement aligns with recent email campaign. Consider follow-up content focusing on STEM.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

// =============================================================
// 2. MESSAGING CENTER TAB (COMMUNITY TAB)
// =============================================================
function MessagingCenterTab({ college, triggerToast, selectedStudentId, setSelectedStudentId }) {
  // Find all communications from this college
  const collegeComms = store.state.communications.filter(
    c => c.fromCollegeId === college.id
  );

  const [threadSearchQuery, setThreadSearchQuery] = useState('');

  // Default to first active student if none is selected
  const defaultStudentId = selectedStudentId || (collegeComms.length > 0 ? collegeComms[0].toStudentId : null);
  const activeStudent = store.state.students.find(s => s.id === defaultStudentId);

  const activeComm = collegeComms.find(c => c.toStudentId === defaultStudentId);
  const activeMessages = activeComm ? store.getMessagesForComm(activeComm.id) : [];

  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!activeComm) {
      // If no communication exists yet, create it (should normally exist because we show thread)
      const newComm = store.sendContactRequest(college.id, defaultStudentId, 'interest', inputText);
      store.sendMessage(newComm.id, college.id, inputText);
    } else {
      store.sendMessage(activeComm.id, college.id, inputText);
    }

    setInputText('');
    triggerToast('Message sent successfully.', 'success');
  };

  const handleSendAttachment = () => {
    if (!activeComm) return;
    const attachmentText = `[ATTACHMENT: ${college.name.replace(/\s+/g, '_')}_Prospectus.pdf]`;
    store.sendMessage(activeComm.id, college.id, attachmentText);
    triggerToast('Prospectus PDF attachment sent.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans animate-fade-up">
      {/* Messaging Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 rounded-[28px] overflow-hidden shadow-lg border border-[#ECE9CB]/30 min-h-[580px]">
        
        {/* Left Columns: Conversations Sidebar (Spans 4 columns) */}
        <div className="md:col-span-4 bg-[#2E3E35] p-6 text-white flex flex-col gap-6 border-r border-[#ECE9CB]/15">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold tracking-tight">Messages</h2>
            <button className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center bg-white/10 rounded-full px-4 py-2 text-xs text-white/85">
            <span className="material-symbols-outlined text-[16px] text-white/50 mr-2">search</span>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={threadSearchQuery}
              onChange={(e) => setThreadSearchQuery(e.target.value)}
              className="bg-transparent border-0 focus:outline-none w-full text-xs text-white placeholder-white/40"
            />
          </div>

          {/* Conversations Threads List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {collegeComms.filter(comm => {
              if (!threadSearchQuery) return true;
              const student = store.state.students.find(s => s.id === comm.toStudentId);
              return student && student.name.toLowerCase().includes(threadSearchQuery.toLowerCase());
            }).map((comm) => {
              const student = store.state.students.find(s => s.id === comm.toStudentId);
              if (!student) return null;

              const commMessages = store.getMessagesForComm(comm.id);
              const lastMsg = commMessages[commMessages.length - 1];
              const lastMsgText = lastMsg ? lastMsg.text : comm.message;
              const lastMsgTime = lastMsg 
                ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const isSelected = student.id === defaultStudentId;
              const initials = student.name.split(' ').map(n => n[0]).join('');

              return (
                <div 
                  key={comm.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-colors border ${
                    isSelected 
                      ? 'bg-[#3E5247] border-white/5' 
                      : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  {student.avatar ? (
                    <img 
                      src={student.avatar} 
                      alt={student.name} 
                      className="w-10 h-10 rounded-full object-cover border border-[#ECE9CB]/20" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FEFBDB]/10 text-white font-extrabold text-xs flex items-center justify-center border border-white/5 shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs truncate">{student.name}</h4>
                      <span className="text-[9px] text-white/50 font-label">{lastMsgTime}</span>
                    </div>
                    <p className="text-[10px] text-white/80 truncate mt-0.5">
                      {comm.status === 'pending' ? <span className="text-secondary-container">[Pending] </span> : ''}
                      {lastMsgText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Active Chat Area (Spans 8 columns) */}
        <div className="md:col-span-8 bg-[#0E2116] flex flex-col justify-between min-h-[580px] relative">
          
          {activeStudent ? (
            <>
              {/* Header Panel */}
              <div className="bg-black/10 px-6 py-4 flex justify-between items-center border-b border-[#ECE9CB]/10">
                <div className="flex items-center gap-3">
                  {activeStudent.avatar ? (
                    <img 
                      src={activeStudent.avatar} 
                      alt={activeStudent.name} 
                      className="w-10 h-10 rounded-full object-cover border border-[#ECE9CB]/25" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FEFBDB]/10 text-white font-bold text-xs flex items-center justify-center border border-white/20">
                      {activeStudent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{activeStudent.name}</h3>
                    <p className="text-[10px] text-white/60 font-light font-label mt-0.5">
                      {activeStudent.grade}th Grade &bull; {activeStudent.school}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedStudentId(activeStudent.id);
                    setOpenModal('student_profile');
                  }}
                  className="px-4 py-1.5 border border-white/20 hover:bg-white/5 text-white text-[10px] font-bold rounded-full transition-colors cursor-pointer bg-transparent font-label"
                >
                  View Full Profile
                </button>
              </div>

              {/* Chat Messages Feed Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Timestamp */}
                <div className="flex justify-center my-2 font-label">
                  <span className="bg-[#2E3E35] text-white/70 text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Today</span>
                </div>

                {activeMessages.map((msg) => {
                  const isCollege = msg.fromId === college.id || msg.fromId.startsWith('col_') || msg.fromId.startsWith('emp_');
                  const attachmentMatch = msg.text.match(/^\[ATTACHMENT:\s*(.+?)\]$/);
                  
                  if (attachmentMatch) {
                    const filename = attachmentMatch[1];
                    return (
                      <div key={msg.id} className={`flex items-start gap-3 ${isCollege ? 'flex-row-reverse ml-auto' : ''}`}>
                        {/* Avatar */}
                        {isCollege ? (
                          <img 
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" 
                            alt="College" 
                            className="w-7 h-7 rounded-full object-cover border border-[#ECE9CB]/20 shrink-0" 
                          />
                        ) : (
                          activeStudent.avatar ? (
                            <img 
                              src={activeStudent.avatar} 
                              alt={activeStudent.name} 
                              className="w-7 h-7 rounded-full object-cover border border-[#ECE9CB]/20 shrink-0" 
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px] flex items-center justify-center border border-white/10 shrink-0">
                              {activeStudent.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )
                        )}
                        <div className="max-w-[70%] space-y-1">
                          {/* PDF File Attachment Card */}
                          <div className={`p-4 rounded-2xl border border-white/5 space-y-3 shadow-md ${
                            isCollege ? 'bg-[#FEFBDB] text-[#1D1C0A] rounded-tr-none' : 'bg-[#105666] text-white rounded-tl-none'
                          }`}>
                            <div className="bg-black/10 rounded-xl p-3 flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isCollege ? 'bg-[#0A3323]/10 text-[#0A3323]' : 'bg-[#FEFBDB]/10 text-white'
                              }`}>
                                <span className="material-symbols-outlined">folder</span>
                              </div>
                              <div className="min-w-0">
                                <h4 className={`font-bold text-xs truncate ${isCollege ? 'text-[#0a3323]' : 'text-white'}`}>{filename}</h4>
                                <span className={`text-[9px] block font-label mt-0.5 ${isCollege ? 'text-[#0a3323]/60' : 'text-white/50'}`}>2.4 MB</span>
                              </div>
                            </div>
                          </div>
                          <span className={`text-[8px] text-white/40 block font-label ${isCollege ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isCollege ? 'flex-row-reverse ml-auto' : ''}`}>
                      {/* Avatar */}
                      {isCollege ? (
                        <img 
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" 
                          alt="College Admin" 
                          className="w-7 h-7 rounded-full object-cover border border-[#ECE9CB]/20 shrink-0" 
                        />
                      ) : (
                        activeStudent.avatar ? (
                          <img 
                            src={activeStudent.avatar} 
                            alt={activeStudent.name} 
                            className="w-7 h-7 rounded-full object-cover border border-[#ECE9CB]/20 shrink-0" 
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px] flex items-center justify-center border border-white/10 shrink-0">
                            {activeStudent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )
                      )}
                      
                      {/* Bubble */}
                      <div className="space-y-1 max-w-[70%]">
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isCollege 
                            ? 'bg-[#FEFBDB] text-[#1D1C0A] rounded-tr-none font-medium' 
                            : 'bg-[#105666] text-white rounded-tl-none font-light'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        <span className={`text-[8px] text-white/40 block font-label ${isCollege ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Chat Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#ECE9CB]/10 bg-black/5 flex items-center gap-3">
                {activeComm && activeComm.status === 'pending' ? (
                  <div className="w-full bg-[#3E5247]/50 text-white/80 text-xs py-3 px-5 rounded-full text-center border border-white/5 font-label">
                    Awaiting student approval before you can chat.
                  </div>
                ) : (
                  <>
                    <div className="flex-1 bg-[#FEFBDB] rounded-full px-5 py-2 flex items-center gap-3 border border-[#ECE9CB]/35">
                      <button 
                        type="button"
                        onClick={handleSendAttachment}
                        className="text-on-surface-variant/80 hover:text-primary transition-colors cursor-pointer bg-transparent border-0 flex items-center justify-center p-0"
                        title="Send Prospectus PDF"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                      
                      <input 
                        type="text" 
                        placeholder="Type your message..." 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="bg-transparent border-0 focus:outline-none w-full text-xs text-[#1D1C0A] placeholder-on-surface-variant/40"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-9 h-9 rounded-full bg-[#EAF2D3] hover:bg-[#D3ECA2] text-[#0A3323] flex items-center justify-center cursor-pointer transition-colors shadow shrink-0 border-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                  </>
                )}
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full text-white/55">
              <span className="material-symbols-outlined text-white/40 text-5xl mb-4">mail</span>
              <h3 className="font-bold">No Active Chats</h3>
              <p className="text-xs text-white/40 font-light mt-1 max-w-sm">Use the Discover Feed or Match Directory to invite candidates for lead acquisition.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// =============================================================
// 3. COLLEGES TAB (AI DIRECTORY VIEW)
// =============================================================
function OverviewTab({ college, triggerToast, setOpenModal, setSelectedStudentId, onTabChange }) {
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [regionFilter, setRegionFilter] = useState('All Regions');

  const allStudents = store.state.students;
  const matchedStudents = matchStudentsForCollege(college, allStudents);

  const filteredStudents = matchedStudents.filter(student => {
    // Grade filter
    if (gradeFilter !== 'All Grades') {
      const match = gradeFilter.match(/\d+/);
      const gradeNum = match ? parseInt(match[0], 10) : null;
      if (gradeNum && student.grade !== gradeNum) return false;
    }
    // Region filter
    if (regionFilter !== 'All Regions') {
      const cityLower = student.city.toLowerCase();
      if (regionFilter === 'Delhi NCR') {
        if (!cityLower.includes('delhi') && !cityLower.includes('ncr') && !cityLower.includes('sonipat')) return false;
      } else if (regionFilter === 'Karnataka') {
        if (!cityLower.includes('bangalore') && !cityLower.includes('karnataka')) return false;
      } else if (regionFilter === 'Maharashtra') {
        if (!cityLower.includes('mumbai') && !cityLower.includes('pune') && !cityLower.includes('maharashtra')) return false;
      }
    }
    return true;
  });

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-fade-up font-sans">
      
      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-label">
        <div 
          onClick={() => onTabChange && onTabChange('matches')}
          className="bg-[#0A3323] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between min-h-[130px] shadow-lg text-white relative overflow-hidden cursor-pointer hover:bg-[#082a1d] transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-center text-white/70 text-[10px] font-extrabold uppercase tracking-widest">
            <span>Students Matched</span>
            <span className="material-symbols-outlined text-xs">school</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight">1.2k</h3>
            <p className="text-[11px] font-bold text-[#D3ECA2] flex items-center gap-0.5 mt-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +12% this week
            </p>
          </div>
        </div>

        <div 
          onClick={() => onTabChange && onTabChange('discovery')}
          className="bg-[#0A3323] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between min-h-[130px] shadow-lg text-white relative overflow-hidden cursor-pointer hover:bg-[#082a1d] transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-center text-white/70 text-[10px] font-extrabold uppercase tracking-widest">
            <span>New Prospects</span>
            <span className="material-symbols-outlined text-xs">group_add</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight">450</h3>
            <p className="text-[11px] font-bold text-[#D3ECA2] flex items-center gap-0.5 mt-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +5% this week
            </p>
          </div>
        </div>

        <div className="bg-[#0A3323] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between min-h-[130px] shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-center text-white/70 text-[10px] font-extrabold uppercase tracking-widest">
            <span>Profile Views</span>
            <span className="material-symbols-outlined text-xs">visibility</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight">8k</h3>
            <p className="text-[11px] font-semibold text-white/55 flex items-center gap-0.5 mt-1">
              <span className="material-symbols-outlined text-[12px]">trending_flat</span> Steady
            </p>
          </div>
        </div>

        <div 
          onClick={() => onTabChange && onTabChange('community')}
          className="bg-[#0A3323] border border-white/10 rounded-[24px] p-6 flex flex-col justify-between min-h-[130px] shadow-lg text-white relative overflow-hidden cursor-pointer hover:bg-[#082a1d] transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-center text-white/70 text-[10px] font-extrabold uppercase tracking-widest">
            <span>Active Outreach</span>
            <span className="material-symbols-outlined text-xs">chat</span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight">120</h3>
            <p className="text-[11px] font-bold text-white/55 flex items-center gap-0.5 mt-1">
              <span className="material-symbols-outlined text-[12px]">priority_high</span> Pending consent
            </p>
          </div>
        </div>
      </div>

      {/* Student Discovery Table Section */}
      <section className="bg-white rounded-[24px] border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm">
        <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-xl text-primary tracking-tight">Admissions Discovery Feed</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 font-light">Review and manage matched portfolios from across India.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-label">
            <div className="relative">
              <select 
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="appearance-none bg-[#FEFBDB]/50 border border-[#ECE9CB] px-4 py-2 pr-10 rounded-full text-xs cursor-pointer focus:outline-none text-primary"
              >
                <option value="All Grades">All Grades</option>
                <option value="12th Grade">12th Grade</option>
                <option value="11th Grade">11th Grade</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[16px]">expand_more</span>
            </div>
            <div className="relative">
              <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="appearance-none bg-[#FEFBDB]/50 border border-[#ECE9CB] px-4 py-2 pr-10 rounded-full text-xs cursor-pointer focus:outline-none text-primary"
              >
                <option value="All Regions">All Regions</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[16px]">expand_more</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-[9px] uppercase tracking-wider text-outline font-bold border-b border-outline-variant/30 font-label">
                <th className="py-4 px-6">Candidate</th>
                <th className="py-4 px-6">School & Location</th>
                <th className="py-4 px-6">Grade</th>
                <th className="py-4 px-6">Match Index</th>
                <th className="py-4 px-6">Key Focus Tags</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-primary">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`} 
                        alt={`${student.name} Avatar`} 
                        className="w-8 h-8 rounded-full object-cover border border-[#ECE9CB]" 
                      />
                      <span className="font-extrabold text-sm text-primary">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-light">
                    <div className="font-semibold text-primary">{student.school}</div>
                    <div className="text-[10px] text-outline mt-0.5 font-label">{student.city}</div>
                  </td>
                  <td className="py-5 px-6 font-semibold">{student.grade}th</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary min-w-[24px] font-label">{student.matchScore}%</span>
                      <div className="h-1.5 w-20 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: `${student.matchScore}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-label">
                    <div className="flex flex-wrap gap-1.5">
                      {student.careerInterests?.slice(0, 2).map((interest, idx) => (
                        <span key={idx} className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded text-[9px] font-bold">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setOpenModal('student_profile');
                      }}
                      className="text-secondary font-bold hover:underline cursor-pointer border-0 bg-transparent font-sans"
                    >
                      View Card
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#1D1C0A]/60">
                    No candidates match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// =============================================================
// 4. MATCHING FEED TAB (COLLEGES TAB)
// =============================================================
function MatchingTab({ college, triggerToast, onTabChange, setSelectedStudentId }) {
  const [candidates] = useState(store.state.students);
  const [searchQuery, setSearchQuery] = useState('');

  const matched = matchStudentsForCollege(college, candidates);

  const filtered = matched.filter((stu) => {
    return stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.careerInterests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-fade-up font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">AI Match Directory</h2>
          <p className="text-sm text-on-surface-variant font-light mt-1 font-label">Browse all candidates matching your admissions criteria.</p>
        </div>

        <div className="relative w-64 font-label">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            className="bg-white border border-[#ECE9CB] pl-10 pr-4 py-2 rounded-full text-xs w-full shadow-sm focus:outline-none"
            placeholder="Search name, school, interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((stu) => {
          const profileStrength = computeProfileStrength(stu);
          return (
            <div key={stu.id} className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-[300px]">
              <div>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-extrabold text-primary text-base line-clamp-1 tracking-tight">{stu.name}</h4>
                    <p className="text-[10px] text-outline font-bold mt-1 font-label">Grade {stu.grade} &bull; {stu.school}</p>
                  </div>
                  <div className="bg-[#D3ECA2] text-[#576B30] px-2.5 py-1 rounded-full text-xs font-bold shrink-0 font-label">
                    {stu.matchScore}% Match
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-surface-container p-3 rounded-2xl border border-outline-variant/20 text-[10px] mt-4 font-label">
                  <div>
                    <span className="text-outline font-bold uppercase tracking-wider block">Academics</span>
                    <p className="mt-1 font-extrabold text-primary">GPA: {stu.grades?.gpa || '9.0'}</p>
                  </div>
                  <div>
                    <span className="text-outline font-bold uppercase tracking-wider block">Completeness</span>
                    <p className="mt-1 font-extrabold text-secondary">{profileStrength}% Complete</p>
                  </div>
                </div>
              </div>
              {(() => {
                const comm = store.state.communications.find(
                  c => c.fromCollegeId === college.id && c.toStudentId === stu.id
                );
                
                if (!comm) {
                  return (
                    <button 
                      onClick={() => {
                        store.sendContactRequest(college.id, stu.id, 'interest', `Hello! ${college.name} is interested in inviting you to apply.`);
                        triggerToast(`Direct match invite sent to ${stu.name}!`, 'success');
                      }}
                      className="primary-button w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span> Direct Match Invite
                    </button>
                  );
                }
                
                if (comm.status === 'pending') {
                  return (
                    <button 
                      disabled
                      className="w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1 bg-surface-container text-outline border border-outline-variant/30 rounded-full cursor-not-allowed opacity-75"
                    >
                      <span className="material-symbols-outlined text-sm">hourglass_empty</span> Awaiting Student Approval
                    </button>
                  );
                }
                
                return (
                  <button 
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      onTabChange('community');
                    }}
                    className="w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1 bg-[#0A3323] hover:bg-[#001d11] text-white rounded-full cursor-pointer transition-colors shadow"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span> Chat with Lead
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpportunitiesTab({ setOpenModal }) {
  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'STEM Merit Scholarship 2025', threshold: 75, status: 'Active', reach: 145, date: '2025-06-15' },
    { id: 2, title: 'Computer Science Early Action', threshold: 80, status: 'Active', reach: 98, date: '2025-06-20' },
    { id: 3, title: 'Liberal Arts Fellowship', threshold: 60, status: 'Completed', reach: 210, date: '2025-05-10' },
  ]);

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-8 animate-fade-up font-sans">
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Outreach & Campaigns</h2>
          <p className="text-sm text-on-surface-variant font-light mt-1 font-label">Create targeted marketing campaigns to engage matching student prospects.</p>
        </div>
        <button
          onClick={() => setOpenModal('create_campaign')}
          className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-label border-0"
        >
          <span className="material-symbols-outlined text-[16px]">add</span> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-label">
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-outline">Total Campaigns Launched</span>
          <h3 className="text-3xl font-extrabold text-primary mt-2">{campaigns.length}</h3>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-outline">Active Outreach Reach</span>
          <h3 className="text-3xl font-extrabold text-secondary mt-2">
            {campaigns.filter(c => c.status === 'Active').reduce((acc, c) => acc + c.reach, 0)} Students
          </h3>
        </div>
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-outline">Average Match Threshold</span>
          <h3 className="text-3xl font-extrabold text-primary mt-2">72%</h3>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low">
          <h4 className="font-extrabold text-primary text-sm">Campaign Roster</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-[9px] uppercase tracking-wider text-outline font-bold border-b border-outline-variant/30 font-label">
                <th className="py-4 px-6">Campaign Title</th>
                <th className="py-4 px-6">Target Threshold</th>
                <th className="py-4 px-6">Estimated Reach</th>
                <th className="py-4 px-6">Launch Date</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-primary">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-sm">{camp.title}</td>
                  <td className="py-4 px-6 font-semibold">{camp.threshold}% Match</td>
                  <td className="py-4 px-6 font-medium">{camp.reach} candidates</td>
                  <td className="py-4 px-6 text-outline font-light">{camp.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      camp.status === 'Active' ? 'bg-[#EAF2D3] text-[#576B30]' : 'bg-surface-container text-outline'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResourcesTab() {
  return (
    <div className="p-8 lg:p-12 max-w-2xl mx-auto space-y-6 animate-fade-up">
      <h2 className="text-2xl font-extrabold text-primary tracking-tight">University Support</h2>
      <div className="bg-white border border-outline-variant/30 rounded-[24px] p-6 shadow-sm font-label space-y-4">
        <div>
          <h4 className="text-xs font-bold text-primary">How do direct invites work?</h4>
          <p className="text-xs text-on-surface-variant font-light mt-1">Once you send a direct match invite, the student receives an alert in their inbox. They can approve it to open a live connection chat.</p>
        </div>
      </div>
    </div>
  );
}
