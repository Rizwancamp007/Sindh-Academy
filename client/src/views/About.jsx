import React from 'react';
import { Award, BookOpen, ShieldCheck, GraduationCap } from 'lucide-react';

export const About = () => {
  return (
    <div className="page-transition" style={{
      width: '90%',
      maxWidth: '1200px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '60px'
    }}>
      {/* Page Header */}
      <header style={{ textAlign: 'center', padding: '60px 20px 20px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 50px)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '16px' }}>
          About Sindh Educational Academy
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
          Providing high-caliber MDCAT & ECAT coaching to students in Ghotki and across northern Sindh, enabling bright minds to excel in medical and engineering admissions.
        </p>
      </header>

      {/* Narrative grid section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Our Noble Mission</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
            Sindh Educational Academy was established with the vision of leveling the playing field for student candidates from Ghotki and adjacent rural regions. We believe that access to high-quality preparation materials, structured mock tests, and rigorous teacher feedback should not be limited by geography.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
            By utilizing a hybrid digital platform, we allow students to review core concepts, verify billing vouchers easily, track daily study consistency via streaks, and get automatic weakness-based recommendations.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Our Teaching Philosophy</h2>
          <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <li style={{ display: 'flex', gap: '15px' }}>
              <div style={{ color: 'var(--accent)', marginTop: '3px' }}><BookOpen size={24} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>Conceptual Mastery First</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>We focus on building rock-solid foundations in Biology, Chemistry, Physics, and English, going beyond rote learning.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '15px' }}>
              <div style={{ color: 'var(--success)', marginTop: '3px' }}><Award size={24} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>Simulating Actual Exam Conditions</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Our Exam Engine strictly mimics the MDCAT and ECAT formats, including test timers, bookmarking, and negative marking adjustments.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '15px' }}>
              <div style={{ color: 'var(--accent)', marginTop: '3px' }}><ShieldCheck size={24} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>Transparent Auditing & Security</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>From anti-copying video streams to clerk-audited billing receipts, we ensure a secure and authenticated educational workspace.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

     

      {/* Highlights & Announcements Advertisement Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>Academy Highlights & Announcements</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '-15px' }}>
          Explore our latest preparatory materials, MDCAT schedules, and physical campus alerts.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          
          <div className="glass-panel hover-card-3d hover-glow-violet" style={{ overflow: 'hidden', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'var(--transition-smooth)' }}>
            <img 
              src="/assests/advertising-1.jpg" 
              alt="MDCAT Prep Advertising Campaign" 
              style={{ width: '100%', borderRadius: '12px', height: '240px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
            />
            <div style={{ padding: '0 5px' }}>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>MDCAT Preparation Launch</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                Exclusive medical university preparatory program covering core Biology, Chemistry, and Physics syllabus according to the official PMC curriculum.
              </p>
            </div>
          </div>

          <div className="glass-panel hover-card-3d hover-glow-blue" style={{ overflow: 'hidden', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'var(--transition-smooth)' }}>
            <img 
              src="/assests/advertising-2.jpg" 
              alt="ECAT Prep Advertising Campaign" 
              style={{ width: '100%', borderRadius: '12px', height: '240px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
            />
            <div style={{ padding: '0 5px' }}>
              <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>ECAT Engineering Admissions Prep</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                Advanced numerical techniques, engineering mathematics short-cuts, and computer science modules tailored for Sindh-based engineering programs.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
