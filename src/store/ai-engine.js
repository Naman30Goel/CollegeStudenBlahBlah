// ============================================================
// ProfileED - AI Engine
// Computes profile strength scores, college/course recommendations
// ============================================================

const ACHIEVEMENT_CATEGORY_WEIGHTS = {
  'Olympiads': 18,
  'Competitions': 15,
  'Certifications': 12,
  'Internships': 14,
  'Leadership Roles': 13,
  'Volunteering': 10,
  'Other': 8,
};

const COLLEGE_DB = [
  // Traditional Indian
  {
    id: 'rec_001', name: 'IIT Bombay', type: 'traditional', country: 'India', location: 'Mumbai',
    description: 'Premier engineering institution with world-class research.',
    programs: ['Computer Science', 'Mechanical Engineering', 'Electronics', 'Chemical Engineering'],
    strengths: ['Engineering', 'Technology', 'Robotics', 'Sciences'],
    targetGPA: 9.0, acceptance: '2%',
    link: 'https://iitb.ac.in',
  },
  {
    id: 'rec_002', name: 'Ashoka University', type: 'traditional', country: 'India', location: 'Sonipat',
    description: 'Liberal arts leader with strong interdisciplinary programs.',
    programs: ['Liberal Arts', 'Computer Science', 'Economics', 'Media Studies'],
    strengths: ['Liberal Arts', 'Social Sciences', 'Business', 'Technology'],
    targetGPA: 8.0, acceptance: '15%',
    link: 'https://ashoka.edu.in',
  },
  {
    id: 'rec_003', name: 'BITS Pilani', type: 'traditional', country: 'India', location: 'Pilani',
    description: 'Top autonomous tech institute with excellent placement.',
    programs: ['Computer Science', 'Electronics', 'Mechanical', 'Finance'],
    strengths: ['Engineering', 'Technology', 'Finance', 'Business'],
    targetGPA: 8.5, acceptance: '3%',
    link: 'https://bits-pilani.ac.in',
  },
  {
    id: 'rec_004', name: 'AIIMS Delhi', type: 'traditional', country: 'India', location: 'New Delhi',
    description: 'India\'s foremost medical and research institution.',
    programs: ['Medicine (MBBS)', 'Nursing', 'Medical Research'],
    strengths: ['Medicine', 'Biology', 'Healthcare'],
    targetGPA: 9.2, acceptance: '0.5%',
    link: 'https://aiims.edu',
  },
  {
    id: 'rec_005', name: 'NID Ahmedabad', type: 'traditional', country: 'India', location: 'Ahmedabad',
    description: 'India\'s premiere design institute shaping global creatives.',
    programs: ['Industrial Design', 'Communication Design', 'Textile Design', 'Film & Video'],
    strengths: ['Design', 'Arts', 'Creative', 'Media'],
    targetGPA: 7.5, acceptance: '5%',
    link: 'https://nid.edu',
  },
  // New-Age Indian
  {
    id: 'rec_006', name: 'Plaksha University', type: 'new-age', country: 'India', location: 'Mohali',
    description: 'Next-gen tech university co-founded with UC Berkeley and CMU.',
    programs: ['Technology & Applied Sciences', 'Computer Science', 'AI & ML'],
    strengths: ['Technology', 'Entrepreneurship', 'Engineering'],
    targetGPA: 8.0, acceptance: '10%',
    link: 'https://plaksha.edu.in',
  },
  {
    id: 'rec_007', name: 'Krea University', type: 'new-age', country: 'India', location: 'Sricity',
    description: 'Interwoven education combining arts, sciences and tech.',
    programs: ['Economics', 'Computer Science', 'Liberal Arts', 'Data Science'],
    strengths: ['Liberal Arts', 'Technology', 'Economics', 'Social Sciences'],
    targetGPA: 7.8, acceptance: '20%',
    link: 'https://krea.edu.in',
  },
  {
    id: 'rec_008', name: 'FLAME University', type: 'new-age', country: 'India', location: 'Pune',
    description: 'Liberal education hub building holistic thinkers and leaders.',
    programs: ['Business', 'Design', 'Psychology', 'Media', 'Law'],
    strengths: ['Business', 'Design', 'Arts', 'Media', 'Entrepreneurship'],
    targetGPA: 7.5, acceptance: '25%',
    link: 'https://flame.edu.in',
  },
  {
    id: 'rec_013', name: 'Hive School', type: 'new-age', country: 'India', location: 'Gurugram, Haryana',
    description: 'A revenue-first business school focusing on SaaS, go-to-market strategies, and tech sales.',
    programs: ['Post Graduate Program in Revenue', 'Entrepreneurship', 'Sales Strategy'],
    strengths: ['Business', 'Entrepreneurship', 'Technology', 'Finance'],
    targetGPA: 7.2, acceptance: '12%',
    link: 'https://hiveschool.co',
  },
  {
    id: 'rec_014', name: 'Masters\' Union', type: 'new-age', country: 'India', location: 'Gurugram, Haryana',
    description: 'An industry-led business school with experiential learn-by-doing programs in business leadership and technology.',
    programs: ['PGP in Business Leadership', 'Technology Management', 'Marketing & Sales'],
    strengths: ['Business', 'Entrepreneurship', 'Technology', 'Finance', 'Leadership'],
    targetGPA: 7.8, acceptance: '8%',
    link: 'https://mastersunion.org',
  },
  // International
  {
    id: 'rec_009', name: 'MIT', type: 'international', country: 'USA', location: 'Cambridge, MA',
    description: 'World\'s top institute for science, engineering and technology.',
    programs: ['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'AI'],
    strengths: ['Technology', 'Engineering', 'Science', 'Entrepreneurship'],
    targetGPA: 9.5, acceptance: '4%',
    link: 'https://mit.edu',
  },
  {
    id: 'rec_010', name: 'London School of Economics', type: 'international', country: 'UK', location: 'London',
    description: 'World\'s leading social sciences and economics university.',
    programs: ['Economics', 'Finance', 'International Relations', 'Sociology'],
    strengths: ['Finance', 'Business', 'Economics', 'Social Sciences'],
    targetGPA: 8.8, acceptance: '12%',
    link: 'https://lse.ac.uk',
  },
  {
    id: 'rec_011', name: 'Parsons School of Design', type: 'international', country: 'USA', location: 'New York',
    description: 'One of the world\'s most innovative art and design schools.',
    programs: ['Fashion Design', 'Graphic Design', 'Interior Design', 'Photography'],
    strengths: ['Design', 'Arts', 'Media', 'Creative'],
    targetGPA: 7.0, acceptance: '35%',
    link: 'https://newschool.edu/parsons',
  },
  {
    id: 'rec_012', name: 'NUS Singapore', type: 'international', country: 'Singapore', location: 'Singapore',
    description: 'Asia\'s leading research university with global impact.',
    programs: ['Computer Science', 'Business', 'Engineering', 'Medicine'],
    strengths: ['Technology', 'Business', 'Engineering', 'Medicine'],
    targetGPA: 8.5, acceptance: '8%',
    link: 'https://nus.edu.sg',
  },
];

export const COURSE_DB = {
  'Computer Science': {
    icon: '💻', description: 'AI, software development, systems design',
    strengths: ['Technology', 'Engineering', 'Mathematics'],
    skills: ['Python', 'JavaScript', 'C++', 'Algorithms', 'Machine Learning'],
  },
  'Business Administration': {
    icon: '📊', description: 'Management, strategy, organizational leadership',
    strengths: ['Business', 'Finance', 'Entrepreneurship'],
    skills: ['Leadership', 'Financial Modeling', 'Excel', 'Communication'],
  },
  'Design': {
    icon: '🎨', description: 'UX/UI, graphic design, industrial design',
    strengths: ['Design', 'Arts', 'Creative', 'Media'],
    skills: ['Figma', 'Illustration', 'Typography', 'Photography'],
  },
  'Finance & Economics': {
    icon: '💹', description: 'Investment banking, economic theory, markets',
    strengths: ['Finance', 'Business', 'Economics'],
    skills: ['Financial Modeling', 'Excel', 'Statistics', 'CFA'],
  },
  'Engineering': {
    icon: '⚙️', description: 'Mechanical, electrical, civil, chemical engineering',
    strengths: ['Engineering', 'Robotics', 'Technology'],
    skills: ['CAD', 'Arduino', 'Physics', 'Mathematics'],
  },
  'Liberal Arts & Humanities': {
    icon: '📚', description: 'Philosophy, literature, social sciences, history',
    strengths: ['Liberal Arts', 'Social Sciences', 'Arts'],
    skills: ['Writing', 'Research', 'Public Speaking', 'Critical Thinking'],
  },
  'Entrepreneurship': {
    icon: '🚀', description: 'Startup building, innovation, venture capital',
    strengths: ['Entrepreneurship', 'Business', 'Technology'],
    skills: ['Leadership', 'Pitching', 'Product Management', 'Networking'],
  },
  'Medicine & Biology': {
    icon: '🧬', description: 'Pre-med, biological research, healthcare systems',
    strengths: ['Medicine', 'Biology', 'Healthcare', 'Science'],
    skills: ['Research', 'Statistics', 'Lab Work', 'Biology'],
  },
};

// ---- CORE COLLEGE MATCH CALCULATION ----
export function calculateCollegeMatch(student, college) {
  let matchScore = 0;
  const gpa = student.grades?.gpa || 0;
  const interests = [...(student.careerInterests || []), ...(student.skills || [])];
  const achCategories = student.achievements.map(a => a.category);

  // GPA match
  if (gpa >= college.targetGPA) matchScore += 30;
  else if (gpa >= college.targetGPA - 0.5) matchScore += 20;
  else if (gpa >= college.targetGPA - 1.0) matchScore += 10;

  // Interest overlap
  const overlap = interests.filter(i =>
    college.strengths.some(s => s.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(s.toLowerCase()))
  );
  matchScore += Math.min(40, overlap.length * 12);

  // Achievement bonus
  const achBonus = achCategories.filter(cat =>
    ['Olympiads', 'Competitions', 'Certifications', 'Internships'].includes(cat)
  ).length;
  matchScore += Math.min(30, achBonus * 8);

  return Math.min(100, matchScore);
}

// ---- PROFILE STRENGTH SCORE (DREAM COLLEGE READINESS) ----
export function computeProfileStrength(student) {
  if (!student) return 0;

  const dreamColleges = student.dreamColleges || [];
  let scores = [];

  // Find dream college records in COLLEGE_DB
  if (dreamColleges.length > 0) {
    dreamColleges.forEach(dcName => {
      const college = COLLEGE_DB.find(c => c.name.toLowerCase().includes(dcName.toLowerCase()) || dcName.toLowerCase().includes(c.name.toLowerCase()));
      if (college) {
        scores.push(calculateCollegeMatch(student, college));
      } else {
        // Mock average match score based on student GPA for self-reported dream colleges
        const gpaVal = student.grades?.gpa || 0;
        scores.push(Math.min(100, Math.round((gpaVal / 10) * 60 + student.achievements.length * 6)));
      }
    });
  }

  // If no dream colleges are set, or none of them matched, use top 3 matches from COLLEGE_DB
  if (scores.length === 0) {
    COLLEGE_DB.forEach(college => {
      scores.push(calculateCollegeMatch(student, college));
    });
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 3);
  }

  const average = scores.reduce((sum, s) => sum + s, 0) / (scores.length || 1);
  return Math.min(100, Math.round(average));
}

// ---- CATEGORY BREAKDOWN ----
export function getStrengthBreakdown(student) {
  if (!student) return [];
  
  const gpa = student.grades?.gpa || 0;
  const dreamColleges = student.dreamColleges || [];
  
  // Find average target GPA of dream colleges
  let targetGPA = 8.5; // baseline target
  if (dreamColleges.length > 0) {
    let gpTotals = 0;
    let gpCounts = 0;
    dreamColleges.forEach(dcName => {
      const college = COLLEGE_DB.find(c => c.name.toLowerCase().includes(dcName.toLowerCase()) || dcName.toLowerCase().includes(c.name.toLowerCase()));
      if (college) {
        gpTotals += college.targetGPA;
        gpCounts++;
      }
    });
    if (gpCounts > 0) targetGPA = gpTotals / gpCounts;
  }

  // GPA fit out of 10
  const gpaFitScore = Math.min(10, Math.round((gpa / targetGPA) * 10));

  // Focus alignment
  const studentInterests = [...(student.careerInterests || []), ...(student.skills || [])];
  let focusScore = 0;
  if (dreamColleges.length > 0) {
    let focusMatches = 0;
    dreamColleges.forEach(dcName => {
      const college = COLLEGE_DB.find(c => c.name.toLowerCase().includes(dcName.toLowerCase()) || dcName.toLowerCase().includes(c.name.toLowerCase()));
      if (college) {
        const overlap = studentInterests.filter(i =>
          college.strengths.some(s => s.toLowerCase().includes(i.toLowerCase()))
        );
        if (overlap.length > 0) focusMatches++;
      }
    });
    focusScore = Math.round((focusMatches / dreamColleges.length) * 10);
  } else {
    focusScore = Math.min(10, studentInterests.length * 2);
  }

  // Portfolio size
  const portfolioScore = Math.min(10, student.achievements.length * 2);

  // Outreach (1 for public, 1 for LinkedIn, 1 for GitHub)
  let outreachScore = 0;
  if (student.isPublic) outreachScore += 3;
  if (student.socialLinks?.linkedin) outreachScore += 3;
  if (student.socialLinks?.github) outreachScore += 4;
  outreachScore = Math.min(10, outreachScore);

  return [
    { label: 'GPA Alignment', score: gpaFitScore, max: 10, icon: '🎓' },
    { label: 'Focus Fit', score: focusScore, max: 10, icon: '🎯' },
    { label: 'Portfolio size', score: portfolioScore, max: 10, icon: '🏆' },
    { label: 'Profile Outreach', score: outreachScore, max: 10, icon: '📜' },
  ];
}

// ---- COLLEGE RECOMMENDATIONS ----
export function getCollegeRecommendations(student) {
  if (!student) return [];

  const gpa = student.grades?.gpa || 0;
  const interests = [...(student.careerInterests || []), ...(student.skills || [])];
  const achCategories = student.achievements.map(a => a.category);

  return COLLEGE_DB.map(college => {
    let matchScore = 0;

    // GPA match
    if (gpa >= college.targetGPA) matchScore += 30;
    else if (gpa >= college.targetGPA - 0.5) matchScore += 20;
    else if (gpa >= college.targetGPA - 1.0) matchScore += 10;

    // Interest/strength overlap
    const overlap = interests.filter(i =>
      college.strengths.some(s => s.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(s.toLowerCase()))
    );
    matchScore += Math.min(40, overlap.length * 12);

    // Achievement bonus
    const achBonus = achCategories.filter(cat =>
      ['Olympiads', 'Competitions', 'Certifications', 'Internships'].includes(cat)
    ).length;
    matchScore += Math.min(20, achBonus * 5);

    // Dream college boost
    if (student.dreamColleges?.some(dc => dc.toLowerCase().includes(college.name.toLowerCase()))) {
      matchScore += 10;
    }

    matchScore = Math.min(100, matchScore);

    // Generate reasoning
    const reasons = [];
    if (overlap.length > 0) reasons.push(`Strong alignment in ${overlap.slice(0, 2).join(' & ')}`);
    if (gpa >= college.targetGPA) reasons.push(`Your GPA (${gpa}) meets the target`);
    if (achBonus > 0) reasons.push(`${achBonus} relevant achievement(s) strengthen your application`);

    // Improvement tips
    const improvements = [];
    if (gpa < college.targetGPA) improvements.push(`Aim for GPA above ${college.targetGPA}`);
    if (achBonus < 2) improvements.push('Add more competition or olympiad achievements');
    if (!achCategories.includes('Certifications')) improvements.push('Complete a relevant certification course');

    return {
      ...college,
      matchScore,
      whyRecommended: reasons.join('. ') || 'Explore this college to see if it aligns with your goals.',
      improvements,
    };
  })
  .filter(c => c.matchScore > 15)
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 9);
}

// ---- COURSE RECOMMENDATIONS ----
export function getCourseRecommendations(student) {
  if (!student) return [];

  const interests = [...(student.careerInterests || []), student.intendedDegree || ''].map(i => i.toLowerCase());
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());

  return Object.entries(COURSE_DB).map(([name, data]) => {
    let score = 0;

    // Interest match
    const intMatch = data.strengths.filter(s =>
      interests.some(i => i.includes(s.toLowerCase()) || s.toLowerCase().includes(i))
    );
    score += intMatch.length * 25;

    // Skill match
    const skillMatch = data.skills.filter(s =>
      studentSkills.some(sk => sk.includes(s.toLowerCase()) || s.toLowerCase().includes(sk))
    );
    score += skillMatch.length * 15;

    return { name, ...data, matchScore: Math.min(100, score) };
  })
  .filter(c => c.matchScore > 0)
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 4);
}

// ---- MATCH STUDENTS FOR COLLEGE ----
export function matchStudentsForCollege(college, students) {
  const prefs = college.targetPrefs || {};
  return students.map(student => {
    let score = 0;
    const gpa = student.grades?.gpa || 0;
    const interests = student.careerInterests || [];

    if (!prefs.grades || prefs.grades.includes(student.grade)) score += 20;
    if (!prefs.minGPA || gpa >= prefs.minGPA) score += 30;

    const interestOverlap = (prefs.interests || []).filter(pi =>
      interests.some(si => si.toLowerCase().includes(pi.toLowerCase()))
    );
    score += Math.min(30, interestOverlap.length * 15);

    const profileScore = computeProfileStrength(student);
    if (!prefs.minScore || profileScore >= prefs.minScore) score += 20;

    return { ...student, matchScore: Math.min(100, score) };
  })
  .filter(s => s.matchScore > 30)
  .sort((a, b) => b.matchScore - a.matchScore);
}

// ---- PROFILE FEEDBACK ----
export function getProfileFeedback(student) {
  const feedback = [];
  const gpa = student.grades?.gpa || 0;
  const achCount = student.achievements?.length || 0;
  const socialCount = Object.keys(student.socialLinks || {}).length;

  if (gpa < 8.0) feedback.push({ type: 'warning', text: 'Consider improving your GPA — most top universities expect above 8.0.' });
  if (achCount < 3) feedback.push({ type: 'warning', text: 'Add more achievements. Aim for at least 5 across diverse categories.' });
  if (!student.achievements?.some(a => a.category === 'Internships')) {
    feedback.push({ type: 'tip', text: 'An internship or research experience will significantly strengthen your profile.' });
  }
  if (!student.achievements?.some(a => a.category === 'Certifications')) {
    feedback.push({ type: 'tip', text: 'Earn a certification in a skill relevant to your career interests.' });
  }
  if (socialCount === 0) feedback.push({ type: 'tip', text: 'Add a LinkedIn or GitHub profile to boost discoverability.' });
  if (student.streakDays >= 7) feedback.push({ type: 'success', text: `Great job! You\'re on a ${student.streakDays}-day activity streak!` });
  if (feedback.length === 0) feedback.push({ type: 'success', text: 'Your profile is looking strong. Keep it up!' });

  return feedback;
}
