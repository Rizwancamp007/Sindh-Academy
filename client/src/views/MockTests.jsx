import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, Award, Calendar, BookOpen, ExternalLink } from 'lucide-react';

export const MockTests = () => {
  const [demoExams, setDemoExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('all'); // 'all', 'mdcat', 'ecat'
  const [selectedSubject, setSelectedSubject] = useState('all'); // 'all', 'biology', 'chemistry', 'physics', 'english', 'mathematics'

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/v1/exams')
      .then(res => res.json())
      .then(data => {
        if (active && data.success) {
          setDemoExams(data.exams);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Filter exams based on search, type (MDCAT/ECAT), and subject
  const filteredExams = demoExams.filter(e => {
    const title = e.title.toLowerCase();
    const desc = (e.description || '').toLowerCase();
    const subject = (e.subject || '').toLowerCase();

    const matchesSearch = title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (selectedExamType === 'mdcat') {
      matchesType = title.includes('mdcat') || title.includes('mcat') || subject === 'biology';
    } else if (selectedExamType === 'ecat') {
      matchesType = title.includes('ecat') || subject === 'mathematics';
    }

    let matchesSubject = true;
    if (selectedSubject !== 'all') {
      matchesSubject = subject === selectedSubject.toLowerCase();
    }

    return matchesSearch && matchesType && matchesSubject;
  });

  const getSubjectColorClass = (subj) => {
    switch (subj?.toLowerCase()) {
      case 'biology': return 'hover-glow-green';
      case 'chemistry': return 'hover-glow-violet';
      case 'physics': return 'hover-glow-blue';
      default: return 'hover-glow-gold';
    }
  };

  const getSubjectIcon = (subj) => {
    switch (subj?.toLowerCase()) {
      case 'biology': return '🧬';
      case 'chemistry': return '🧪';
      case 'physics': return '⚡';
      case 'english': return '📚';
      case 'mathematics': return '🧮';
      default: return '📝';
    }
  };

  return (
    <div className="page-transition" style={{
      width: '90%',
      maxWidth: '1200px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '16px' }}>
          Entrance Mock Assessment Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Practice real-time entry tests designed to match Sindh MDCAT and ECAT standards. Features instant graded feedback.
        </p>
      </header>

      {/* Categories Switchers */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Core Exam Mode Type Selection */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { id: 'all', label: 'All Test Types' },
            { id: 'mdcat', label: 'MDCAT / Medical Entry Prep' },
            { id: 'ecat', label: 'ECAT / Engineering Entry Prep' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => { setSelectedExamType(type.id); setSelectedSubject('all'); }}
              className={selectedExamType === type.id ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '10px' }}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Portion Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setSelectedSubject('all')}
            className={selectedSubject === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
          >
            All Portions
          </button>
          {['biology', 'chemistry', 'physics', 'english', 'mathematics'].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={selectedSubject === subj ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', textTransform: 'capitalize', fontSize: '13px', borderRadius: '8px' }}
            >
              {getSubjectIcon(subj)} {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Toolbar */}
      <section className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ border: 'none', background: 'transparent', padding: '4px 0', margin: 0, outline: 'none', width: '100%', color: 'var(--text-primary)' }}
            placeholder="Search mock exams by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Grid List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))', gap: '30px' }}>
          <div className="skeleton-box" style={{ height: '240px' }} />
          <div className="skeleton-box" style={{ height: '240px' }} />
          <div className="skeleton-box" style={{ height: '240px' }} />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            No mock exams found matching the selected portion or search filters.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {filteredExams.map((e) => {
            const subject = e.subject || 'General';
            return (
              <div
                key={e._id}
                className={`glass-panel hover-card-3d ${getSubjectColorClass(subject)}`}
                style={{
                  padding: '25px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Floating portion tag */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)'
                }}>
                  {getSubjectIcon(subject)} {subject}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: e.isMonthly ? '#3b82f6' : '#10b981',
                    letterSpacing: '0.05em'
                  }}>
                    {e.isMonthly ? '🏆 Monthly Championship' : '⚡ Diagnostic Mock'}
                  </span>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, paddingRight: '60px', color: 'var(--text-primary)' }}>
                    {e.title} {!e.isDemo && '🔒'}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '5px 0 0 0' }}>
                    {e.description || 'Simulate this prep exam with real-time scoring feedback and subject breakdown metrics.'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {e.durationMinutes || e.duration} Mins
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={14} />
                      {e.negativeMarking ? 'Negative Marking Enabled' : 'No Negative Penalty'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  {e.isDemo ? (
                    e.externalDocLink ? (
                      <a
                        href={e.externalDocLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          textDecoration: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          color: '#fff'
                        }}
                      >
                        <ExternalLink size={14} />
                        Open Google Doc Mock
                      </a>
                    ) : (
                      <Link
                        to={`/exam/${e._id}`}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          textDecoration: 'none',
                          background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)',
                          border: 'none',
                          color: '#fff'
                        }}
                      >
                        <BookOpen size={14} />
                        Launch Online Test
                      </Link>
                    )
                  ) : (
                    <Link
                      to="/login"
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)'
                      }}
                    >
                      Unlock Full Mock 🔒
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Warning Alert */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <ShieldAlert style={{ color: '#ef4444', flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Anti-Cheating Policy:</strong> Standard monthly and portion-based mock test explanations are strictly locked until payment validation has been successfully approved by our desk clerk. Unauthorized attempts are logged.
        </p>
      </div>
    </div>
  );
};
