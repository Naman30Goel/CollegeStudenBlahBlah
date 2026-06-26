// ============================================================
// ProfileED - Supabase REST API Client Bridge
// Direct fetch client to communicate with Supabase backend
// ============================================================

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://yiibcfburlkojbzfkcuh.supabase.co').replace(/\/$/, '');
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaWJjZmJ1cmxrb2piemZrY3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NjE3NDcsImV4cCI6MjA5ODAzNzc0N30.l8mbO1DvlA0B1_wTTSUNhyrfkffzYQvYB0ckQ1NACRM';

export const supabase = {
  isConfigured() {
    return !!supabaseKey;
  },
  async fetch(endpoint, options = {}) {
    if (!supabaseKey) {
      console.warn("Supabase Anon Key is missing. Check your .env configuration.");
      return null;
    }
    
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Standardize url to prevent rest/v1 duplicates
    const url = `${supabaseUrl}/rest/v1/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase API Error: ${response.status} ${response.statusText} - ${errText}`);
    }
    
    if (response.status === 204) return null;
    return await response.json();
  },
  
  async getWaitlist() {
    return await this.fetch('pre_registrations?select=*&order=created_at.desc');
  },
  
  async addWaitlist(record) {
    return await this.fetch('pre_registrations', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: record.name,
        student_class: record.studentClass,
        school: record.school,
        city: record.city,
        email: record.email,
        phone: record.phone || null
      })
    });
  },
  
  async deleteWaitlist(id) {
    // Delete by UUID or primary key
    return await this.fetch(`pre_registrations?id=eq.${id}`, {
      method: 'DELETE'
    });
  }
};
