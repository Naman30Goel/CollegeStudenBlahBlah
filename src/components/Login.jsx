import React, { useState } from 'react';
import { store } from '../store/index.js';

export default function Login({ onLoginSuccess, onBackToLanding, onStartOnboarding, triggerToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = store.login(email, password);
    if (user) {
      onLoginSuccess(user);
    } else {
      triggerToast('Invalid email or password. Use demo/demo for test accounts.', 'error');
    }
  };

  const handleSimulateGoogle = () => {
    const user = store.login('alex@example.com', 'demo');
    if (user) {
      onLoginSuccess(user);
      triggerToast('Authenticated via Google OAuth.', 'success');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background font-sans">
      {/* Left side hero */}
      <div className="w-full md:w-1/2 bg-primary-container flex items-center justify-center p-8 lg:p-16 text-on-primary-container relative">
        {/* Soft background shape */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-md z-10">
          <img
            src="/images/mascot.png"
            onClick={onBackToLanding}
            alt="ProfilED Mascot"
            className="w-14 h-14 object-contain cursor-pointer hover:scale-105 transition-all mb-6 shadow-sm hover:-translate-y-0.5"
            title="Back to Landing Page"
          />
          <h1 className="font-sans text-5xl font-extrabold tracking-tight mb-4 text-on-primary">ProfilED</h1>
          <p className="text-lg text-on-primary-container/90 font-light leading-relaxed mb-8">
            The Verified High School Portfolio & AI Student Discovery Network
          </p>
          <ul className="flex flex-col gap-4 font-label text-sm text-on-primary-container/85 font-medium">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-container p-1 bg-secondary/20 rounded-lg">verified</span>
              Build an audited achievements record
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-container p-1 bg-secondary/20 rounded-lg">explore</span>
              Discover traditional, new-age & global colleges
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-container p-1 bg-secondary/20 rounded-lg">school</span>
              Get matching invites directly from admissions offices
            </li>
          </ul>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface-container-low">
        <div className="w-full max-w-sm flex flex-col gap-6 bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
          <div>
            <h2 className="text-3xl font-extrabold text-primary tracking-tight">Welcome Back</h2>
            <p className="text-sm text-on-surface-variant mt-1.5 font-light">
              Log in to manage your portfolio or admissions pipeline.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="ghost-input px-4 py-2.5 rounded-full text-sm w-full font-label shadow-sm"
                type="email"
                id="email"
                placeholder="student@example.com / admissions@ashoka.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="password">
                Password
              </label>
              <input
                className="ghost-input px-4 py-2.5 rounded-full text-sm w-full font-label shadow-sm"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-button py-3 font-semibold text-sm w-full cursor-pointer mt-2 shadow-md">
              Log In
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink mx-4 text-xs text-outline tracking-wider uppercase font-bold font-label">Or</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSimulateGoogle}
              className="w-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm font-label text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              Simulated Google OAuth Login (Alex)
            </button>
            
            <button
              onClick={onStartOnboarding}
              className="text-xs font-bold text-secondary hover:text-primary transition-colors hover:underline w-full text-center mt-2 cursor-pointer bg-transparent border-0 font-label"
            >
              First time student? <strong>Get Started / Onboarding</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
