import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Search, Video, FileText } from 'lucide-react';

export const Lectures = () => {
  const [activeDemo, setActiveDemo] = useState(null);
  const [demoLectures, setDemoLectures] = useState([]);
  const [demoExams, setDemoExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetch('/api/v1/resources/lectures').then(res => res.json()),
      fetch('/api/v1/exams').then(res => res.json())
    ]).then(([lecturesData, examsData]) => {
      if (active) {
        if (lecturesData.success) setDemoLectures(lecturesData.lectures);
        if (examsData.success) setDemoExams(examsData.exams);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const getLectureType = (url) => {
    if (!url) return 'video';
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('ooYue89FtlM') || url.includes('F7fGpFuy_xQ') || url.includes('lsiLmTXd0Lk') || url.includes('SQkpXs045ck') || url.includes('_xdaiDnXhqA')) return 'youtube';
    if (url.includes('drive.google.com/file') || url.includes('/file/d/') || url.includes('pdf')) return 'pdf';
    return 'stream';
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } else {
      const parts = url.split('/');
      videoId = parts[parts.length - 1]?.split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleWatchDemo = (l) => {
    const type = getLectureType(l.googleDriveFileId);
    if (type === 'pdf') {
      window.open(l.googleDriveFileId, '_blank');
    } else {
      setActiveDemo(l);
    }
  };

  // Filter logic
  const filteredLectures = demoLectures.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || l.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  const filteredExams = demoExams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || e.subject?.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="page-transition" style={{
      width: '90%',
      maxWidth: '1200px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '50px'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', padding: '40px 20px 10px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '16px' }}>
          Free Demo Lectures & Evaluation Mocks
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Review our demo teaching catalogs, test drive our real-time MCQ simulator, and check out notes before subscribing to premium access.
        </p>
      </header>

      {/* Filters Toolbar */}
      <section className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Search input */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ border: 'none', background: 'transparent', padding: '6px 0', margin: 0, outline: 'none', width: '100%', color: 'var(--text-primary)' }}
            placeholder="Search lectures or exams by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Subject pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['all', 'biology', 'chemistry', 'physics', 'english'].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={selectedSubject === subj ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', textTransform: 'capitalize', fontSize: '13px' }}
            >
              {subj}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div className="skeleton-box" style={{ height: '350px' }} />
          <div className="skeleton-box" style={{ height: '350px' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Lectures Column */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontFamily: 'var(--font-heading)' }}>
              Video & PDF Lectures ({filteredLectures.length})
            </h3>
            {filteredLectures.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>No matching demo lectures found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredLectures.map((l) => {
                  const subjectGlow = l.subject.toLowerCase() === 'biology' ? 'hover-glow-green' :
                                      l.subject.toLowerCase() === 'chemistry' ? 'hover-glow-violet' :
                                      l.subject.toLowerCase() === 'physics' ? 'hover-glow-blue' : 'hover-glow-gold';
                  return (
                    <div key={l._id} className={`glass-panel hover-card-3d ${subjectGlow}`} style={{ padding: '15px', background: 'rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', transition: 'var(--transition-smooth)' }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px' }}>{l.title} {!l.isDemo && '🔒'}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {l.subject} • {l.topic} {!l.isDemo && '(Premium)'}
                        </span>
                      </div>
                      {l.isDemo ? (
                        <button
                          onClick={() => handleWatchDemo(l)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', background: 'rgba(124, 58, 237, 0.1)' }}
                        >
                          {getLectureType(l.googleDriveFileId) === 'pdf' ? 'View PDF' : 'Watch Free'}
                        </button>
                      ) : (
                        <Link to="/login" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                          Unlock 🔒
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exams Column */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontFamily: 'var(--font-heading)' }}>
              Entrance Mock Exams ({filteredExams.length})
            </h3>
            {filteredExams.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>No matching mock exams found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredExams.map((e) => {
                  const subjectGlow = (e.subject || '').toLowerCase() === 'biology' ? 'hover-glow-green' :
                                      (e.subject || '').toLowerCase() === 'chemistry' ? 'hover-glow-violet' :
                                      (e.subject || '').toLowerCase() === 'physics' ? 'hover-glow-blue' : 'hover-glow-gold';
                  return (
                    <div key={e._id} className={`glass-panel hover-card-3d ${subjectGlow}`} style={{ padding: '15px', background: 'rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', transition: 'var(--transition-smooth)' }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px' }}>{e.title} {!e.isDemo && '🔒'}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Duration: {e.durationMinutes || e.duration} Mins {!e.isDemo && '(Premium)'}
                        </span>
                      </div>
                      {e.isDemo ? (
                        e.externalDocLink ? (
                          <a
                            href={e.externalDocLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', background: 'rgba(16, 185, 129, 0.1)' }}
                          >
                            Open Doc
                          </a>
                        ) : (
                          <Link
                            to={`/exam/${e._id}`}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', background: 'rgba(16, 185, 129, 0.1)' }}
                          >
                            Launch Mock
                          </Link>
                        )
                      ) : (
                        <Link to="/login" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                          Unlock 🔒
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video stream box modal */}
      {activeDemo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel page-transition" style={{
            width: '100%',
            maxWidth: '800px',
            background: 'var(--bg-card)',
            padding: '30px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <button
              onClick={() => setActiveDemo(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <div>
              <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-heading)' }}>{activeDemo.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{activeDemo.subject} • {activeDemo.topic}</p>
            </div>
            
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              {getLectureType(activeDemo.googleDriveFileId) === 'youtube' ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={getYoutubeEmbedUrl(activeDemo.googleDriveFileId)}
                  title={activeDemo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={`/api/v1/resources/stream/${activeDemo._id}`}
                  controls
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{activeDemo.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
