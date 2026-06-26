import React, { useState, useEffect } from 'react';
import { store, checkDevMode } from '../store/index.js';
import { supabase } from '../store/supabase.js';

// Normalize record helper to bridge local (camelCase) and Supabase (snake_case) formats safely
const normalizeRecord = (r) => {
  if (!r) return {};
  return {
    id: r.id || `reg_${Math.random().toString(36).substr(2, 9)}`,
    name: r.name || '',
    studentClass: r.studentClass || r.student_class || 'Other',
    school: r.school || '',
    city: r.city || '',
    email: r.email || '',
    phone: r.phone || '',
    createdAt: r.createdAt || r.created_at || Date.now()
  };
};

export default function SuperAdminWorkspace({ triggerToast }) {
  const [storeState, setStoreState] = useState(store.state);
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbSource, setDbSource] = useState('local'); // 'supabase' | 'local'
  const isDevMode = checkDevMode();
  const activeUser = store.getActiveUser();

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Try fetching from Supabase Waitlist
    try {
      const data = await supabase.getWaitlist();
      if (Array.isArray(data)) {
        setList(data.map(normalizeRecord));
        setDbSource('supabase');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
    }
    
    // 2. Fallback to Local store
    setList((store.getPreRegistrations() || []).map(normalizeRecord));
    setDbSource('local');
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    const unsubscribe = store.subscribe((newState) => {
      setStoreState({ ...newState });
      const hasSupabase = supabase.isConfigured();
      // Automatically keep in sync with local store when operating in local-only database mode
      if (!hasSupabase) {
        setList((store.getPreRegistrations() || []).map(normalizeRecord));
      }
    });
    return unsubscribe;
  }, []);

  const handleDeleteRecord = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}'s pre-registration record?`)) {
      return;
    }
    
    setIsLoading(true);
    if (dbSource === 'supabase') {
      try {
        await supabase.deleteWaitlist(id);
        triggerToast(`Successfully deleted ${name}'s record from Supabase.`, 'success');
        setList(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error('Failed to delete from Supabase:', err);
        triggerToast('Failed to delete record from Supabase.', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local fallback mode deletion
      store.deletePreRegistration(id);
      triggerToast(`Successfully deleted ${name}'s record from local storage.`, 'success');
      setList((store.getPreRegistrations() || []).map(normalizeRecord));
      setIsLoading(false);
    }
  };

  // Filter waitlist entries safely using normalized values
  const filtered = list.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.school || '').toLowerCase().includes(q) ||
      (r.city || '').toLowerCase().includes(q) ||
      (r.studentClass || '').toLowerCase().includes(q)
    );
  });

  // Calculate metrics safely
  const totalCount = list.length;
  
  const classBreakdown = list.reduce((acc, curr) => {
    const cls = curr.studentClass || 'Other';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const cityBreakdown = list.reduce((acc, curr) => {
    const city = curr.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const class12Count = classBreakdown['Class 12'] || 0;
  const class11Count = classBreakdown['Class 11'] || 0;
  const class10Count = classBreakdown['Class 10'] || 0;

  const handleDownloadCSV = () => {
    if (list.length === 0) {
      triggerToast('Waitlist database is empty.', 'warning');
      return;
    }
    
    const headers = ['ID', 'Name', 'Class', 'School', 'City', 'Email', 'Phone', 'Registered At'];
    const rows = list.map(r => [
      r.id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.studentClass || '').replace(/"/g, '""')}"`,
      `"${(r.school || '').replace(/"/g, '""')}"`,
      `"${(r.city || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      new Date(r.createdAt).toISOString()
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "supabase_waitlist_database.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Waitlist CSV exported successfully.', 'success');
  };

  const handleSwitchSession = (userId) => {
    store.switchRole(userId);
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-fade-up font-sans text-left text-[#001d11] bg-[#fefbdb]/20 min-h-screen relative">
      
      {/* Header section with Premium Light Styling */}
      <div className="flex justify-between items-center flex-wrap gap-6 border-b border-[#001d11]/10 pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-[#51652a] uppercase tracking-widest font-label bg-[#d3eca2]/30 px-3 py-1 rounded-full border border-[#d3eca2]">
              Super Admin Control Panel
            </span>
            
            {/* Database status badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm ${
              dbSource === 'supabase'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dbSource === 'supabase' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
              }`}></span>
              {dbSource === 'supabase' ? 'Supabase Connected' : 'Local Storage Mode'}
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#001d11] tracking-tight mt-2.5">Waitlist Database</h2>
          <p className="text-xs text-on-surface-variant font-light mt-1 font-label">
            Real-time management of pre-registered sign-ups directly connected to your database backend.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="bg-[#51652a]/10 hover:bg-[#51652a]/20 text-[#51652a] text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-label border border-[#51652a]/30 disabled:opacity-50 hover:shadow-sm"
            title="Sync Database"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>sync</span> 
            {isLoading ? 'Syncing...' : 'Sync Database'}
          </button>
          
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              type="text"
              className="ghost-input pl-10 pr-10 py-2.5 rounded-full text-xs w-full shadow-sm bg-white border border-[#001d11]/10 focus:border-[#51652a] outline-none transition-all"
              placeholder="Search by name, email, school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 border-0 bg-transparent cursor-pointer p-0 text-outline hover:text-primary flex items-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          
          <button
            onClick={handleDownloadCSV}
            className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-label border-0 hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-label">
        <div className="bg-white border border-[#ECE9CB]/50 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#d3eca2]/40 text-[#576b30] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">database</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#001d11] tracking-tight">{totalCount}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Total Waitlist</div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE9CB]/50 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#F2EFD0] text-[#0A3323] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#001d11] tracking-tight">{class12Count}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Class 12</div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE9CB]/50 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF2D3] text-[#0A3323] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#001d11] tracking-tight">{class11Count + class10Count}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Classes 10 & 11</div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE9CB]/50 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">location_on</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#001d11] tracking-tight">{Object.keys(cityBreakdown).length}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Unique Cities</div>
          </div>
        </div>
      </div>

      {/* Database Grid view */}
      <div className="bg-white border border-[#ECE9CB]/50 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f5d6]/40 text-[9px] uppercase tracking-wider text-[#51652a] font-bold border-b border-[#ECE9CB]/50 font-label">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Class</th>
                <th className="py-4 px-6">School</th>
                <th className="py-4 px-6">City</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Submitted Date</th>
                <th className="py-4 px-6 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE9CB]/20 text-[#001d11]">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-[#f8f5d6]/20 transition-colors">
                  <td className="py-4 px-6 font-bold">{reg.name}</td>
                  <td className="py-4 px-6 font-semibold">{reg.studentClass}</td>
                  <td className="py-4 px-6 font-light">{reg.school}</td>
                  <td className="py-4 px-6 font-label">{reg.city}</td>
                  <td className="py-4 px-6 font-semibold font-mono text-xs text-on-surface-variant">{reg.email}</td>
                  <td className="py-4 px-6 font-mono text-outline">{reg.phone || '—'}</td>
                  <td className="py-4 px-6 text-outline font-light">
                    {new Date(reg.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleDeleteRecord(reg.id, reg.name)}
                      className="text-red-600 hover:text-red-800 bg-transparent border-0 cursor-pointer p-1 font-bold flex items-center justify-center mx-auto hover:bg-red-50 rounded-full transition-colors"
                      title="Delete entry"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-on-surface-variant/70 font-light">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="material-symbols-outlined text-[48px] text-outline opacity-40">inbox_customize</span>
                      <p className="italic font-medium">
                        {isLoading ? 'Loading waitlist submissions...' : 'No pre-registration records found.'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="bg-transparent border border-[#51652a]/20 hover:border-[#51652a] text-[#51652a] text-[10px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Evaluation Switcher widget */}
      {isDevMode && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-full border border-outline-variant/30 shadow-lg font-label transition-all hover:shadow-xl">
          <span className="text-[9px] font-extrabold text-on-surface-variant/80 uppercase tracking-wider">Test Swap:</span>
          <div className="flex gap-1">
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
                onClick={() => {
                  handleSwitchSession(swUser.id);
                  triggerToast(`Switched active session to: ${swUser.name}`, 'info');
                }}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors font-semibold cursor-pointer border-0 ${
                  activeUser?.id === swUser.id
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {swUser.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
