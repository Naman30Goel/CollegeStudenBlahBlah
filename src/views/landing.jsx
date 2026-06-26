import React, { useState } from 'react';
import { store, checkDevMode } from '../store/index.js';
import { supabase } from '../store/supabase.js';

export default function LandingPage({ onGetStarted, onAdminLogin }) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const isDevMode = checkDevMode();

  // Form fields
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('Class 12');
  const [school, setSchool] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handlePreRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !school.trim() || !city.trim() || !email.trim() || !phone.trim()) {
      return;
    }
    
    // Always store in the local state/store first
    store.addPreRegistration({
      name,
      studentClass,
      school,
      city,
      email,
      phone
    });

    try {
      await supabase.addWaitlist({
        name,
        studentClass,
        school,
        city,
        email,
        phone
      });
      setIsRegistered(true);
    } catch (err) {
      console.error('Failed to submit to Supabase waitlist:', err);
      // Mark as registered in the UI since it is successfully saved to local store
      setIsRegistered(true);
      alert('Your registration has been saved locally, but we could not sync it with the server.');
    }
  };

  const handleOpenRegisterModal = () => {
    setName('');
    setSchool('');
    setCity('');
    setEmail('');
    setPhone('');
    setIsRegistered(false);
    setShowRegisterModal(true);
  };



  return (
    <div className="bg-gradient-to-b from-[#FCF5EB] via-[#A4D0ED]/20 to-[#FCF5EB] min-h-screen flex flex-col overflow-x-hidden font-sans">
      
      {/* Background illustration wrapper for Navbar + Hero */}
      <div className="relative w-full">
        {/* Full-width illustration background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-85" 
          style={{ backgroundImage: "url('/images/hero_background.png')" }}
        ></div>
        {/* Edge gradient overlays to blend illustration into background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FCF5EB]/10 to-[#FCF5EB] pointer-events-none"></div>

        {/* Floating Pill Top Nav Bar */}
        <div className="w-full px-6 pt-4 relative z-50">
          <header className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-[#DBB092]/50 rounded-full px-8 py-3.5 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#4C7397] font-bold text-xl tracking-tight">ProfilED</span>
            </div>
            
            <nav className="hidden md:flex gap-8 text-xs font-bold font-label">
              <a href="#" className="text-[#4C7397] border-b-2 border-[#4C7397] pb-0.5">Home</a>
            </nav>
            
            <div className="flex items-center gap-4 font-label">
              <button
                onClick={onAdminLogin}
                className="text-[#4C7397] hover:text-[#181819] hover:underline text-xs font-bold transition-all cursor-pointer bg-transparent border-0 py-2.5"
              >
                Admin Login
              </button>
              <button
                onClick={handleOpenRegisterModal}
                className="bg-[#4C7397] hover:bg-[#181819] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow-sm border-0"
              >
                Get Started
              </button>
            </div>
          </header>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 w-full min-h-[500px] py-16 px-6 flex items-center justify-center">
          {/* Central Card */}
          <div className="bg-white/90 backdrop-blur-md border border-[#DBB092]/40 rounded-[32px] p-10 max-w-lg w-full text-center relative z-10 shadow-lg hover:shadow-xl transition-all duration-300">
            <h1 className="text-[#4C7397] font-bold text-4xl sm:text-5xl tracking-tight leading-tight mb-4">
              Build Your Profile.<br />
              Discover Your<br />
              Future.
            </h1>
            <p className="text-on-surface-variant text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto mb-6">
              One profile that helps counsellors guide you,<br />
              colleges discover you, and AI recommend your<br />
              perfect future.
            </p>
            
            <button
              onClick={handleOpenRegisterModal}
              className="bg-[#4C7397] hover:bg-[#181819] text-white text-xs font-bold px-7 py-3 rounded-full transition-all duration-200 cursor-pointer shadow-md hover:-translate-y-0.5 mb-6 border-0"
            >
              Pre-Register
            </button>

            <div className="flex justify-center gap-2.5 text-[9px] font-bold text-[#4C7397] font-label">
              <span className="px-3 py-1 bg-[#4C7397]/5 border border-[#4C7397]/25 rounded-full">#FutureReady</span>
              <span className="px-3 py-1 bg-[#4C7397]/5 border border-[#4C7397]/25 rounded-full">#CollegeBound</span>
            </div>
          </div>
        </section>
      </div>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full font-sans">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-primary tracking-tight">Featured Destinations</h2>
            <p className="text-xs text-on-surface-variant mt-1 font-light">Campuses looking for students like you.</p>
          </div>
          <button 
            onClick={onGetStarted} 
            className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0 font-label"
          >
            View all &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Masters Union */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(10,51,35,0.03)] flex flex-col hover:shadow-[0_12px_40px_rgba(10,51,35,0.06)] transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src="/images/masters_union.png" alt="Masters Union" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-extrabold text-sm tracking-tight">Masters Union</h4>
                <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5 font-label">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  Gurugram, India
                </div>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex gap-2 flex-wrap mb-2.5 font-label">
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Corporate Campus
                  </span>
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Leadership
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  Immersive CEO–in–training experience located in the heart of Cyber City, offerin...
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Scaler School of Technology */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(10,51,35,0.03)] flex flex-col hover:shadow-[0_12px_40px_rgba(10,51,35,0.06)] transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src="/images/scaler_tech.png" alt="Scaler School of Technology" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-extrabold text-sm tracking-tight">Scaler School of Technology</h4>
                <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5 font-label">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  Bangalore, India
                </div>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex gap-2 flex-wrap mb-2.5 font-label">
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Tech Hub
                  </span>
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Agile
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  Modern tech park setting with sprint rooms and collaborative coding spaces...
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Newton School of Technology */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(10,51,35,0.03)] flex flex-col hover:shadow-[0_12px_40px_rgba(10,51,35,0.06)] transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src="/images/newton_tech.png" alt="Newton School of Technology" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-extrabold text-sm tracking-tight">Newton School of Technology</h4>
                <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5 font-label">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  Sonepat, India
                </div>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex gap-2 flex-wrap mb-2.5 font-label">
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Innovation
                  </span>
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Residential
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  Blending high-end tech labs with collaborative residential spaces in a stat...
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Hive School */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(10,51,35,0.03)] flex flex-col hover:shadow-[0_12px_40px_rgba(10,51,35,0.06)] transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src="/images/hive_school.png" alt="Hive School" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-extrabold text-sm tracking-tight">Hive School</h4>
                <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5 font-label">
                  <span className="material-symbols-outlined text-[12px]">location_on</span>
                  Bangalore, India
                </div>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex gap-2 flex-wrap mb-2.5 font-label">
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Innovative Learning
                  </span>
                  <span className="bg-[#EDCEAF] text-[#4C7397] text-[9px] font-bold px-3 py-1 rounded-full">
                    Tech First
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  Pioneering futuristic school campus with integrated digital systems, coding sprints, and project-based growth...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 w-full mt-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-label text-on-surface-variant">
          <span className="font-bold text-[#4C7397] text-sm">ProfilED</span>
          
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
          
          <span className="text-outline font-medium">© 2026 ProfilED. All rights reserved.</span>
        </div>
      </footer>

      {/* Pre-Register Modal Overlay */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white border border-[#DBB092]/40 rounded-[32px] w-full max-w-lg shadow-2xl p-8 relative font-sans text-left animate-fade-up space-y-5">
            <button 
              type="button" 
              onClick={() => setShowRegisterModal(false)} 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-[#4C7397] cursor-pointer text-base bg-transparent border-0 font-bold"
            >
              ✕
            </button>
            
            {!isRegistered ? (
              <form onSubmit={handlePreRegisterSubmit} className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-2xl text-primary tracking-tight">Pre-Register for ProfilED</h3>
                  <p className="text-xs text-on-surface-variant font-light mt-1">Join the waitlist to get your profile discovered by top universities.</p>
                </div>
                
                <div className="space-y-3 font-label text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-primary">Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="ghost-input px-3.5 py-2.5 rounded-full w-full"
                      style={{ backgroundColor: '#EDCEAF' }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-primary">Class/Status *</label>
                      <select 
                        value={studentClass} 
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="ghost-input px-3.5 py-2.5 rounded-full w-full appearance-none bg-[#EDCEAF]"
                        required
                      >
                        <option value="Class 12">Class 12</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 8">Class 8</option>
                        <option value="College">College</option>
                        <option value="Job">Job</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-primary">City *</label>
                      <input 
                        type="text" 
                        placeholder="Enter city" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)}
                        className="ghost-input px-3.5 py-2.5 rounded-full w-full"
                        style={{ backgroundColor: '#EDCEAF' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-primary">School Name *</label>
                    <input 
                      type="text" 
                      placeholder="Enter school name" 
                      value={school} 
                      onChange={(e) => setSchool(e.target.value)}
                      className="ghost-input px-3.5 py-2.5 rounded-full w-full"
                      style={{ backgroundColor: '#EDCEAF' }}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-primary">Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="alex@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="ghost-input px-3.5 py-2.5 rounded-full w-full"
                      style={{ backgroundColor: '#EDCEAF' }}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-primary">Phone Number *</label>
                    <input 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="ghost-input px-3.5 py-2.5 rounded-full w-full"
                      style={{ backgroundColor: '#EDCEAF' }}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2 font-label">
                  <button type="button" onClick={() => setShowRegisterModal(false)} className="border border-[#DBB092] hover:bg-surface-container text-[#4C7397] px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer bg-transparent font-sans">Cancel</button>
                  <button type="submit" className="bg-[#4C7397] hover:bg-[#181819] text-white px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer border-0 font-sans">Submit Pre-Registration</button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <span className="material-symbols-outlined text-5xl text-secondary animate-bounce">check_circle</span>
                <h3 className="font-extrabold text-xl text-primary">Pre-Registration Successful!</h3>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                  Your credentials have been securely stored in the waitlist database.
                </p>
                <div className="flex flex-col gap-2 pt-2 items-center">
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setIsRegistered(false);
                    }}
                    className="bg-[#4C7397] hover:bg-[#181819] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow border-0 font-label"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
