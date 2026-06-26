import React, { useState, useEffect } from 'react';
import { store, checkDevMode } from './store/index.js';
import LandingPage from './views/landing.jsx';
import Login from './components/Login.jsx';
import Onboarding from './components/Onboarding.jsx';
import StudentWorkspace from './views/student.jsx';
import CollegeWorkspace from './views/college.jsx';
import CounselorWorkspace from './views/counselor.jsx';
import AdminWorkspace from './views/admin.jsx';
import SuperAdminWorkspace from './views/super_admin.jsx';

export default function App() {
  const [appState, setAppState] = useState(store.state);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Subscribe to central store changes
  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return unsubscribe;
  }, []);

  // Helper to trigger toast notification
  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  };

  const activeUser = store.getActiveUser();

  // Reset tab when user switches role
  useEffect(() => {
    if (activeUser) {
      if (activeUser.role === 'student') {
        setCurrentTab('dashboard');
      } else if (activeUser.role === 'admin' || activeUser.role === 'super_admin') {
        setCurrentTab('waitlist');
      } else {
        setCurrentTab('overview');
      }
    }
  }, [activeUser?.id]);

  const handleLogout = () => {
    store.logout();
    triggerToast('Logged out successfully.', 'info');
    setIsOnboarding(false);
    setShowLogin(false);
  };

  const handleSwitchSession = (userId) => {
    store.switchRole(userId);
    const switchedUser = store.getActiveUser();
    triggerToast(`Switched active session to: ${switchedUser.name}`, 'info');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setNotifDropdownOpen(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Toast Component rendering
  const renderToasts = () => (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast animate-[toast-in_0.3s_ease_forwards]"
          style={{ pointerEvents: 'auto' }}
        >
          {t.type === 'error' ? (
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
          ) : t.type === 'warning' ? (
            <span className="material-symbols-outlined text-warning text-[20px]">warning</span>
          ) : t.type === 'info' ? (
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          ) : (
            <span className="material-symbols-outlined text-success text-[20px] filled">check_circle</span>
          )}
          <span className="text-sm font-semibold text-on-background">{t.message}</span>
        </div>
      ))}
    </div>
  );

  const isDevMode = checkDevMode();
  const isSuperAdmin = activeUser && activeUser.role === 'super_admin';

  // If user is not logged in or we are in locked production mode (super admin bypasses lockdown)
  if (!activeUser || (!isDevMode && !isSuperAdmin)) {
    if (showLogin) {
      return (
        <>
          <Login
            onLoginSuccess={(user) => {
              setShowLogin(false);
              triggerToast(`Welcome back, ${user.name}!`, 'success');
            }}
            onBackToLanding={() => setShowLogin(false)}
            onStartOnboarding={() => {
              setIsOnboarding(true);
            }}
            triggerToast={triggerToast}
          />
          {renderToasts()}
        </>
      );
    }

    if (isOnboarding) {
      return (
        <>
          <Onboarding
            onComplete={() => {
              setIsOnboarding(false);
              setCurrentTab('dashboard');
              triggerToast('Registration complete! Welcome to ProfilED.', 'success');
            }}
            onCancel={() => {
              setIsOnboarding(false);
              setShowLogin(true);
            }}
          />
          {renderToasts()}
        </>
      );
    }

    if (!isDevMode && !isSuperAdmin) {
      return (
        <>
          <LandingPage onGetStarted={() => setShowLogin(true)} onAdminLogin={() => setShowLogin(true)} />
          {renderToasts()}
        </>
      );
    }

    return (
      <>
        <LandingPage onGetStarted={() => setShowLogin(true)} onAdminLogin={() => setShowLogin(true)} />
        {renderToasts()}
      </>
    );
  }

  // Active user variables
  const initials = activeUser.name ? activeUser.name.split(' ').map((n) => n[0]).join('') : 'U';
  const unreadNotifs = store.getUnreadCount(activeUser.id);
  const notifications = appState.notifications.filter((n) => n.userId === activeUser.id);

  // Sidebar components based on role
  const renderSidebar = () => {
    if (activeUser.role === 'student') {
      return (
        <aside className="sidebar w-[260px] bg-surface border-r border-outline-variant/30 hidden md:flex flex-col gap-4 p-6 shrink-0 h-screen fixed left-0 top-0 z-40">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">ProfilED</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${currentTab === 'dashboard' ? 'filled' : ''}`}>dashboard</span>
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('discovery')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'discovery'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${currentTab === 'discovery' ? 'filled' : ''}`}>person_search</span>
                  Discovery
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('matches')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'matches'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${currentTab === 'matches' ? 'filled' : ''}`}>verified</span>
                  Matches
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('insights')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'insights'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${currentTab === 'insights' ? 'filled' : ''}`}>mail</span>
                  Messages
                  <span className="ml-auto bg-primary-container text-on-primary-container text-xs py-0.5 px-2 rounded-full font-medium">
                    12
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('profile')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'profile'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${currentTab === 'profile' ? 'filled' : ''}`}>group</span>
                  Profile Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('achievements')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'achievements'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                  Achievements
                </button>
              </li>
            </ul>
          </div>
          <div className="mt-auto pt-6">
            <button
              onClick={() => setCurrentTab('discovery')}
              className="primary-button w-full py-2.5 rounded-lg font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 mb-4 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              AI Search
            </button>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`w-full text-left rounded-lg flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'settings' ? 'bg-surface-container font-bold text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Settings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('support')}
                  className={`w-full text-left rounded-lg flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'support' ? 'bg-surface-container font-bold text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">help_outline</span>
                  Support
                </button>
              </li>
            </ul>
          </div>
        </aside>
      );
    } else if (activeUser.role === 'counselor') {
      return (
        <aside className="sidebar w-[260px] bg-surface border-r border-outline-variant/30 hidden md:flex flex-col gap-4 p-6 shrink-0 h-screen fixed left-0 top-0 z-40">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">ProfilED</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider block mb-2 px-2.5">COUNSELOR PORTAL</span>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('overview')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'overview'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">analytics</span>
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('monitoring')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'monitoring'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">group</span>
                  Student Roster
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('reporting')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'reporting'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">description</span>
                  Reports
                </button>
              </li>
            </ul>
          </div>
        </aside>
      );
    } else if (activeUser.role === 'admin') {
      return (
        <aside className="sidebar w-[260px] bg-surface border-r border-outline-variant/30 hidden md:flex flex-col gap-4 p-6 shrink-0 h-screen fixed left-0 top-0 z-40">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">ProfilED</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider block mb-2 px-2.5">ADMIN PORTAL</span>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('waitlist')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'waitlist'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                  Waitlist Database
                </button>
              </li>
            </ul>
          </div>
        </aside>
      );
    } else if (activeUser.role === 'super_admin') {
      return (
        <aside className="sidebar w-[260px] bg-surface border-r border-outline-variant/30 hidden md:flex flex-col gap-4 p-6 shrink-0 h-screen fixed left-0 top-0 z-40">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#0A3323] text-white flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-[#0A3323] tracking-tight">ProfilED</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto font-label">
            <span className="text-[10px] font-bold text-[#51652a] tracking-wider block mb-2 px-2.5">SUPER ADMIN PORTAL</span>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('waitlist')}
                  className={`w-full text-left rounded-lg font-bold flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'waitlist'
                      ? 'bg-[#d3eca2]/30 text-[#001d11]'
                      : 'text-on-surface-variant hover:bg-[#d3eca2]/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                  Waitlist Database
                </button>
              </li>
            </ul>
          </div>
        </aside>
      );
    } else {
      // College Admin & Employee
      return (
        <aside className="sidebar w-[260px] bg-surface border-r border-outline-variant/30 hidden md:flex flex-col gap-4 p-6 shrink-0 h-screen fixed left-0 top-0 z-40">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">ProfilED</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('overview')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'overview'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${currentTab === 'overview' ? 'filled' : ''}`}>dashboard</span>
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('search')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'search'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">person_search</span>
                  Student Search
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('recommended')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'recommended'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  Recommended
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('messages')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'messages'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  Messages
                  <span className="ml-auto bg-primary-container text-on-primary-container text-xs py-0.5 px-2 rounded-full font-medium">
                    12
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('team')}
                  className={`w-full text-left rounded-lg font-medium flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'team'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">group</span>
                  Team Management
                </button>
              </li>
            </ul>
          </div>
          <div className="mt-auto pt-6">
            <button
              onClick={() => setCurrentTab('search')}
              className="primary-button w-full py-2.5 rounded-lg font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 mb-4 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              AI Search
            </button>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`w-full text-left rounded-lg flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'settings' ? 'bg-surface-container font-bold text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Settings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('support')}
                  className={`w-full text-left rounded-lg flex items-center gap-3 p-2.5 transition-colors ${
                    currentTab === 'support' ? 'bg-surface-container font-bold text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">help_outline</span>
                  Support
                </button>
              </li>
            </ul>
          </div>
        </aside>
      );
    }
  };

  const handleNotifDropdownClick = (e) => {
    e.stopPropagation();
    setNotifDropdownOpen(!notifDropdownOpen);
    store.markNotificationsRead(activeUser.id);
  };

  const isHorizontalLayout = activeUser.role === 'student' || activeUser.role === 'college_admin' || activeUser.role === 'college_employee';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Nav */}
      {!isHorizontalLayout && renderSidebar()}

      {/* Main Workspace */}
      <main className={`flex-1 ${isHorizontalLayout ? '' : 'md:ml-[260px]'} flex flex-col h-full overflow-hidden`}>
        {/* Header bar */}
        {!isHorizontalLayout && (
          <header className="bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 h-16 flex items-center justify-between px-8 shrink-0 z-30">
            <div className="flex items-center gap-4">
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface capitalize">
                {currentTab.replace('_', ' ').replace('-', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              {/* Quick switcher container for evaluations */}
              <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/20">
                <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase">Evaluation Switcher:</span>
                <div className="flex gap-1.5">
                  {[
                    { id: 'stu_001', name: 'Alex', role: 'Student' },
                    { id: 'cou_001', name: 'Ms. Deepa', role: 'Counselor' },
                    { id: 'col_001', name: 'Ashoka', role: 'College' },
                    { id: 'emp_001', name: 'Vikram', role: 'Employee' },
                    { id: 'sad_001', name: 'Admin (Naman)', role: 'SuperAdmin' },
                    { id: 'adm_001', name: 'Admin', role: 'Admin' },
                  ].map((swUser) => (
                    <button
                      key={swUser.id}
                      onClick={() => handleSwitchSession(swUser.id)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors font-medium cursor-pointer ${
                        activeUser.id === swUser.id
                          ? 'bg-primary text-on-primary font-bold'
                          : 'bg-surface-container-highest hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {swUser.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={handleNotifDropdownClick}
                  className="text-on-surface-variant hover:text-on-surface relative transition-colors cursor-pointer flex items-center justify-center p-1.5 rounded-full hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border border-surface-container-lowest animate-pulse"></span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 p-4 max-h-[360px] overflow-y-auto"
                  >
                    <div className="border-b border-outline-variant/30 pb-2 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Alert Center</h4>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-on-surface-variant text-center py-4">No new alerts.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {notifications.map((n) => (
                          <div key={n.id} className="text-xs text-on-surface-variant pb-2 border-b border-outline-variant/10 last:border-0 last:pb-0">
                            <p>{n.text}</p>
                            <span className="text-[10px] text-outline block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Avatar / Logout */}
              <div className="flex items-center gap-3">
                <div
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 cursor-pointer relative group flex items-center justify-center bg-primary text-on-primary text-sm font-bold"
                  title="Click to Log Out"
                >
                  <span className="group-hover:hidden">{initials}</span>
                  <span className="material-symbols-outlined text-xs hidden group-hover:inline-block">logout</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic tab rendering */}
        <div className="flex-1 overflow-y-auto">
          {activeUser.role === 'student' && (
            <StudentWorkspace
              activeTab={currentTab}
              triggerToast={triggerToast}
              onTabChange={(tab) => setCurrentTab(tab)}
            />
          )}

          {activeUser.role === 'counselor' && (
            <CounselorWorkspace
              activeTab={currentTab}
              triggerToast={triggerToast}
              onTabChange={(tab) => setCurrentTab(tab)}
            />
          )}

          {activeUser.role === 'admin' && (
            <AdminWorkspace
              activeTab={currentTab}
              triggerToast={triggerToast}
            />
          )}

          {activeUser.role === 'super_admin' && (
            <SuperAdminWorkspace
              triggerToast={triggerToast}
            />
          )}

          {(activeUser.role === 'college_admin' || activeUser.role === 'college_employee') && (
            <CollegeWorkspace
              activeTab={currentTab}
              triggerToast={triggerToast}
              onTabChange={(tab) => setCurrentTab(tab)}
            />
          )}
        </div>
      </main>
      {renderToasts()}
    </div>
  );
}
