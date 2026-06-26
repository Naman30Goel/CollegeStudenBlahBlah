import React, { useState } from 'react';
import { store } from '../store/index.js';

export default function Onboarding({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('11');
  const [city, setCity] = useState('');
  const [intendedDegree, setIntendedDegree] = useState('Computer Science');
  const [careerInterests, setCareerInterests] = useState([]);
  const [skillsStr, setSkillsStr] = useState('');
  const [dreamStr, setDreamStr] = useState('');

  const handleInterestChange = (interest) => {
    setCareerInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Create user
      const skills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const dreamColleges = dreamStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const newStudent = {
        id: `stu_${Date.now()}`,
        role: 'student',
        name: name || 'Anonymous Student',
        school: school || 'Public High School',
        grade: parseInt(grade),
        city: city || 'Unknown City',
        careerInterests: careerInterests.length > 0 ? careerInterests : ['Technology'],
        intendedDegree,
        dreamColleges: dreamColleges.length > 0 ? dreamColleges : ['Stanford University'],
        skills: skills.length > 0 ? skills : ['Python'],
        socialLinks: {},
        avatar: null,
        achievements: [],
        grades: { gpa: 8.5, board: 'CBSE' },
        streakDays: 1,
        lastActivity: Date.now(),
        followers: [],
        following: [],
        savedProfiles: [],
        contactRequests: [],
        isPublic: true,
        createdAt: Date.now(),
      };

      store.state.students.push(newStudent);
      store.state.activeUserId = newStudent.id;
      store._save();
      store._notify();
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="flex flex-col gap-4 animate-[toast-in_0.2s_ease_forwards] font-sans">
          <div>
            <h3 className="text-xl font-bold text-primary">Step 1: Student Demographics</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-light">Let's set up your profile details first.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Full Name</label>
            <input
              className="ghost-input px-4 py-2.5 rounded-full text-sm shadow-sm font-label"
              type="text"
              placeholder="Aanya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">High School Name</label>
            <input
              className="ghost-input px-4 py-2.5 rounded-full text-sm shadow-sm font-label"
              type="text"
              placeholder="Government Senior Secondary School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Grade Level</label>
              <select
                className="ghost-input px-4 py-2.5 rounded-full text-sm shadow-sm font-label"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">City</label>
              <input
                className="ghost-input px-4 py-2.5 rounded-full text-sm shadow-sm font-label"
                type="text"
                placeholder="New Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="flex flex-col gap-4 animate-[toast-in_0.2s_ease_forwards] font-sans">
          <div>
            <h3 className="text-xl font-bold text-primary">Step 2: Interests & Degrees</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-light">Colleges filter matching recommendations using these preferences.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Intended Undergraduate Degree</label>
            <select
              className="ghost-input px-4 py-2.5 rounded-full text-sm shadow-sm font-label"
              value={intendedDegree}
              onChange={(e) => setIntendedDegree(e.target.value)}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Design">Design</option>
              <option value="Finance & Economics">Finance & Economics</option>
              <option value="Engineering">Engineering</option>
              <option value="Liberal Arts & Humanities">Liberal Arts & Humanities</option>
              <option value="Medicine & Biology">Medicine & Biology</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label mb-1">
              Career Focus Areas
            </label>
            <div className="grid grid-cols-2 gap-2 bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30 font-label">
              {['Technology', 'Entrepreneurship', 'Finance', 'Business', 'Design', 'Arts', 'Robotics', 'Medicine'].map((interest) => (
                <label key={interest} className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={careerInterests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                    className="rounded text-secondary focus:ring-secondary/20 w-4 h-4 border-outline-variant"
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 animate-[toast-in_0.2s_ease_forwards] font-sans">
        <div>
          <h3 className="text-xl font-bold text-primary">Step 3: Skills & Dream Colleges</h3>
          <p className="text-xs text-on-surface-variant mt-1 font-light">Final credentials to complete your portfolio onboarding.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Your Skills (Comma separated)</label>
          <input
            className="ghost-input px-4 py-2.5 rounded-full text-sm shadow-sm font-label"
            type="text"
            placeholder="Python, Figma, Public Speaking"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Dream Colleges (Comma separated)</label>
          <input
            className="ghost-input px-4 py-2.5 rounded-full text-sm shadow-sm font-label"
            type="text"
            placeholder="MIT, Stanford, Ashoka University"
            value={dreamStr}
            onChange={(e) => setDreamStr(e.target.value)}
          />
        </div>

        <div className="p-3 bg-surface-container border border-outline-variant/30 rounded-2xl mt-2 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          <p className="text-[11px] text-on-surface-variant font-light leading-normal font-label">
            Parent/guardian consent is required for student profile audits under data compliance guidelines.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-background p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">ProfilED Join</h2>
          <div className="flex items-center gap-1.5">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-label transition-all ${step >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>1</span>
            <span className="w-4 h-0.5 bg-outline-variant/40"></span>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-label transition-all ${step >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>2</span>
            <span className="w-4 h-0.5 bg-outline-variant/40"></span>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-label transition-all ${step >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>3</span>
          </div>
        </div>

        <form onSubmit={handleNext} className="flex flex-col gap-6">
          {renderStep()}

          <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4 mt-2">
            <button
              type="button"
              onClick={step === 1 ? onCancel : handleBack}
              className="px-5 py-2.5 border border-outline-variant hover:bg-surface-container-low rounded-full text-xs font-bold font-label transition-colors cursor-pointer text-primary"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button type="submit" className="primary-button px-6 py-2.5 rounded-full text-xs font-bold font-label cursor-pointer shadow-md">
              {step === 3 ? 'Complete Profile' : 'Next Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
