import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, CreditCard, Award, ArrowRight, Activity, Search } from 'lucide-react';

export const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch('/api/v1/resources/reviews')
      .then(res => res.json())
      .then(data => { if (data.success) setReviews(data.reviews); });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const res = await fetch(`/api/v1/exams/search-mcq?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.questions);
        setSearched(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      width: '90%',
      maxWidth: '1200px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '140px'
    }}>
      {/* Glow Layer */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'var(--accent)',
        filter: 'blur(150px)',
        opacity: 0.12,
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>

      {/* Hero Section */}
      <header style={{
        textAlign: 'center',
        padding: '90px 20px 40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        position: 'relative'
      }}>
        <div className="text-pop-in" style={{ 
          padding: '6px 14px', 
          borderRadius: '30px', 
          background: 'rgba(124, 58, 237, 0.08)', 
          border: '1px solid rgba(124, 58, 237, 0.2)', 
          color: 'var(--accent)', 
          fontSize: '13px', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          marginBottom: '-10px' 
        }}>
          🎓 Ghotki's Premier Preparatory Portal
        </div>

        <h1 className="shimmer-text text-pop-in" style={{
          fontSize: 'clamp(34px, 6.5vw, 68px)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: '950px'
        }}>
          Sindh Educational Academy
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          fontWeight: 400
        }}>
          Ghotki's premium digital gateway to mastering MDCAT & ECAT preparation. High-performance streaming, state-preserving mock tests, and real-time ledger accounting.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <Link to="/login" className="btn-primary" style={{ padding: '14px 28px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Portal Login</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/lectures" className="btn-secondary" style={{ padding: '14px 28px', textDecoration: 'none' }}>
            Attempt Free Mocks
          </Link>
          <a 
            href="https://wa.me/923012345678" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-secondary" 
            style={{ 
              padding: '14px 28px', 
              textDecoration: 'none', 
              background: 'rgba(34, 197, 94, 0.12)', 
              border: '1.5px solid rgba(34, 197, 94, 0.35)', 
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>WhatsApp Admin Desk</span>
          </a>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          <span>📍 Eidgah Road, Ghotki</span>
          <span>📞 Support Line: +92 301 2345678</span>
          <span>✉️ support@sindhacademy.edu.pk</span>
        </div>
      </header>

      {/* Stats Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '30px'
      }}>
        <div className="glass-panel hover-card-3d hover-glow-violet" style={{ padding: '30px', textAlign: 'center', transition: 'var(--transition-smooth)' }}>
          <h2 className="shimmer-text" style={{ fontSize: '48px', fontWeight: 800 }}>98%</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Student Satisfaction</p>
        </div>
        <div className="glass-panel hover-card-3d hover-glow-blue" style={{ padding: '30px', textAlign: 'center', transition: 'var(--transition-smooth)' }}>
          <h2 className="shimmer-text" style={{ fontSize: '48px', fontWeight: 800 }}>15000+</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Questions Bank</p>
        </div>
        <div className="glass-panel hover-card-3d hover-glow-green" style={{ padding: '30px', textAlign: 'center', transition: 'var(--transition-smooth)' }}>
          <h2 className="shimmer-text" style={{ fontSize: '48px', fontWeight: 800 }}>1200+</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>High Achievers</p>
        </div>
        <div className="glass-panel hover-card-3d hover-glow-gold" style={{ padding: '30px', textAlign: 'center', transition: 'var(--transition-smooth)' }}>
          <h2 className="shimmer-text" style={{ fontSize: '48px', fontWeight: 800 }}>100%</h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Ghotki Focus</p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="about" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <h2 style={{ fontSize: '32px', textAlign: 'center' }}>Why Sindh Educational Academy?</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          <div className="glass-panel hover-card-3d hover-glow-violet" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'var(--transition-smooth)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video size={32} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '20px' }}>Proxy Video Streaming</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              Intellectual property protected Google Drive video streaming wrapper preventing client-side downloading and IP pooling.
            </p>
          </div>
          <div className="glass-panel hover-card-3d hover-glow-blue" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'var(--transition-smooth)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={32} style={{ color: 'var(--info)' }} />
              <h3 style={{ fontSize: '20px' }}>Exam Engine System</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              State-preserving layout with questions navigation, bookmarks, and automated time-out triggers mimicking real tests.
            </p>
          </div>
          <div className="glass-panel hover-card-3d hover-glow-green" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'var(--transition-smooth)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={32} style={{ color: 'var(--success)' }} />
              <h3 style={{ fontSize: '20px' }}>Secure Billing Ledger</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              Generate fee challan vouchers, upload payment transaction receipts, and await direct approval auditing from academy Clerks.
            </p>
          </div>
        </div>
      </section>

      {/* Our Specialized Faculty Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>Our Specialized Faculty</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Learn from Ghotki's most experienced educators utilizing simple conceptual breakdowns.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          
          <div className="glass-panel hover-card-3d hover-glow-violet" style={{ padding: '35px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', transition: 'var(--transition-smooth)' }}>
            <img src="/assests/biology-instructor.jpg" alt="Prof. Rahmatullah Kalhoro" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--accent)' }} />
            <div>
              <h4 style={{ fontSize: '18px', margin: 0 }}>Prof. Rahmatullah Kalhoro</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Head of Biology</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              Over 12 years of experience preparing Sindh board students for competitive medical entrance exams.
            </p>
          </div>

          <div className="glass-panel hover-card-3d hover-glow-green" style={{ padding: '35px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', transition: 'var(--transition-smooth)' }}>
            <img src="/assests/chemistry-instructor.jpg" alt="Prof. Alam Mughal" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--success)' }} />
            <div>
              <h4 style={{ fontSize: '18px', margin: 0 }}>Prof. Alam Mughal</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chemistry Specialist</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              Ph.D. in Organic Chemistry, focusing on simplified physical and organic concept breakdowns for MDCAT.
            </p>
          </div>

          <div className="glass-panel hover-card-3d hover-glow-blue" style={{ padding: '35px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', transition: 'var(--transition-smooth)' }}>
            <img src="/assests/physics-instructor.jpg" alt="Prof. Irshad Langah" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #3b82f6' }} />
            <div>
              <h4 style={{ fontSize: '18px', margin: 0 }}>Prof. Irshad Langah</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Physics Specialist</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              Expert in numerical short-tricks and analytical equations required to score high marks in ECAT.
            </p>
          </div>

        </div>
      </section>

      {/* Success Stories & Reviews */}
      <section id="reviews" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <h2 style={{ fontSize: '32px', textAlign: 'center' }}>Success Stories from Ghotki</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '-15px' }}>
          Hear from our high achievers who successfully secured admissions in top medical and engineering universities.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {(reviews.length > 0 ? reviews : [
            {
              studentName: 'Dr. Sanaullah Mahar',
              achievement: 'Admitted to PMC (MDCAT Score: 182/200)',
              reviewText: 'SEA was a game-changer for my MDCAT prep. The state-preserving mock tests helped me manage my time perfectly, and the weakness analysis focused my efforts where they mattered most.',
              avatarName: 'student1'
            },
            {
              studentName: 'Engr. Asif Ali Kalwar',
              achievement: 'Admitted to MUET (ECAT Score: 340/400)',
              reviewText: 'The ECAT practice tests were identical to the actual exam layout. The negative marking simulation prepared me mentally to avoid guess-work and score highly in math and physics.',
              avatarName: 'student2'
            },
            {
              studentName: 'Zainab Chachar',
              achievement: 'Admitted to Dow Medical College (DUHS)',
              reviewText: 'Since I live in a rural area, having secure video lecture streaming allowed me to study at my own convenience without travelling. The daily streak kept me highly motivated!',
              avatarName: 'student3'
            }
          ]).map((r, idx) => {
            const avatarColors = {
              student1: '#3b82f6',
              student2: '#10b981',
              student3: '#8b5cf6',
              student4: '#f59e0b',
              student5: '#ec4899'
            };
            const avatarIcons = {
              student1: '👨‍🎓',
              student2: '👩‍🎓',
              student3: '🩺',
              student4: '⚙️',
              student5: '🧠'
            };
            const glowClasses = [
              'hover-glow-blue',
              'hover-glow-green',
              'hover-glow-violet',
              'hover-glow-gold',
              'hover-glow-violet'
            ];
            const avatarColor = avatarColors[r.avatarName] || '#8b5cf6';
            const avatarIcon = avatarIcons[r.avatarName] || '👨‍🎓';
            const glowClass = glowClasses[idx % glowClasses.length];
            return (
              <div key={idx} className={`glass-panel hover-card-3d ${glowClass}`} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'space-between', transition: 'var(--transition-smooth)' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  "{r.reviewText}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                  {/* AI Generated Icon/Pic */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginRight: '12px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                  }}>
                    {avatarIcon}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent)', margin: 0, fontSize: '15px' }}>{r.studentName}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.achievement}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
