import React, { useState, useEffect } from 'react';
import { store, checkDevMode } from '../store/index.js';

export default function AdminWorkspace({ activeTab, triggerToast }) {
  const [storeState, setStoreState] = useState(store.state);
  const [list, setList] = useState(store.getPreRegistrations());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isDevMode = checkDevMode();

  const fetchFromSheets = () => {
    const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL || '';
    if (!sheetsUrl) return;
    
    setIsLoading(true);
    fetch(sheetsUrl)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setList(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch from Google Sheets:', err);
        setIsLoading(false);
        triggerToast('Failed to fetch records from Google Sheets.', 'error');
      });
  };

  useEffect(() => {
    const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL || '';
    if (sheetsUrl) {
      fetchFromSheets();
    }
    
    const unsubscribe = store.subscribe((newState) => {
      setStoreState({ ...newState });
      if (!sheetsUrl) {
        setList(store.getPreRegistrations());
      }
    });
    return unsubscribe;
  }, []);

  const admin = store.getActiveUser();

  if (!admin || admin.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full text-primary font-sans">
        <span className="material-symbols-outlined text-outline text-5xl mb-4">gavel</span>
        <h3 className="text-lg font-bold">Unauthorized. Administrator privileges required.</h3>
      </div>
    );
  }

  // Filter list
  const filtered = list.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.school.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.studentClass.toLowerCase().includes(q)
    );
  });

  // Calculate metrics
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
  const otherCount = totalCount - class12Count - class11Count - class10Count;

  const handleDownloadCSV = () => {
    if (list.length === 0) {
      triggerToast('Waitlist database is empty.', 'warning');
      return;
    }
    
    const headers = ['ID', 'Name', 'Class', 'School', 'City', 'Email', 'Phone', 'Registered At'];
    const rows = list.map(r => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.studentClass.replace(/"/g, '""')}"`,
      `"${r.school.replace(/"/g, '""')}"`,
      `"${r.city.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      new Date(r.createdAt).toISOString()
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "profileed_pre_registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Waitlist database exported successfully (CSV/Excel).', 'success');
  };

  const handleSwitchSession = (userId) => {
    store.switchRole(userId);
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-fade-up font-sans text-left text-primary relative">
      {/* Header and Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#ECE9CB]/40 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0A3323] tracking-tight">Waitlist Database</h2>
          <p className="text-xs text-on-surface-variant font-light mt-1 font-label">
            Monitor and manage landing page pre-registrations. Private Admin view.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {import.meta.env.VITE_GOOGLE_SHEETS_URL && (
            <button
              onClick={fetchFromSheets}
              disabled={isLoading}
              className="bg-[#51652a] hover:bg-[#3a4d15] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-label border-0 disabled:opacity-50"
              title="Sync with Google Sheets"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>sync</span> 
              {isLoading ? 'Syncing...' : 'Sync Sheets'}
            </button>
          )}
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              type="text"
              className="ghost-input pl-10 pr-4 py-2.5 rounded-full text-xs w-full shadow-sm bg-white"
              placeholder="Search waitlist by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleDownloadCSV}
            className="bg-[#0A3323] hover:bg-[#001d11] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-label border-0"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export Database (CSV)
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-label">
        <div className="bg-white border border-[#ECE9CB]/35 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0A3323] tracking-tight">{totalCount}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Total Registrations</div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE9CB]/35 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[#F2EFD0] text-[#0A3323] flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0A3323] tracking-tight">{class12Count}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Class 12 Waitlist</div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE9CB]/35 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF2D3] text-[#0A3323] flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0A3323] tracking-tight">{class11Count + class10Count}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Classes 10 & 11</div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE9CB]/35 rounded-[24px] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">location_on</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0A3323] tracking-tight">{Object.keys(cityBreakdown).length}</div>
            <div className="text-xs text-outline font-bold uppercase mt-0.5">Unique Cities</div>
          </div>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="bg-white border border-[#ECE9CB]/35 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-[9px] uppercase tracking-wider text-outline font-bold border-b border-outline-variant/30 font-label">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Class</th>
                <th className="py-4 px-6">School</th>
                <th className="py-4 px-6">City</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-primary">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-surface-container-low/20 transition-colors">
                  <td className="py-4 px-6 font-bold">{reg.name}</td>
                  <td className="py-4 px-6 font-semibold">{reg.studentClass}</td>
                  <td className="py-4 px-6">{reg.school}</td>
                  <td className="py-4 px-6 font-label">{reg.city}</td>
                  <td className="py-4 px-6 font-semibold">{reg.email}</td>
                  <td className="py-4 px-6 font-mono text-outline">{reg.phone || '—'}</td>
                  <td className="py-4 px-6 text-outline font-light">
                    {new Date(reg.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant/60 font-light italic">
                    No waitlist registrations found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Evaluation Switcher widget */}
      {isDevMode && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/30 shadow-lg font-label">
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
                  handleSwitchSession(swUser.id);
                  triggerToast(`Switched active session to: ${swUser.name}`, 'info');
                }}
                className={`px-1.5 py-0.5 text-[10px] rounded transition-colors font-medium cursor-pointer ${
                  admin.id === swUser.id
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
    </div>
  );
}
