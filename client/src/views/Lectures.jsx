import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Video, FileText, Play, ExternalLink } from 'lucide-react';

export const Lectures = () => {
  const [activeDemo, setActiveDemo] = useState(null);
  const [demoLectures, setDemoLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activeTypeTab, setActiveTypeTab] = useState('video'); // 'video' or 'pdf'

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/v1/resources/lectures')
      .then(res => res.json())
      .then(data => {
        if (active && data.success) {
          setDemoLectures(data.lectures);
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

  const getLectureType = (url) => {
    if (!url) return 'video';
    const cleanUrl = url.toLowerCase();
    if (
      cleanUrl.includes('youtube.com') ||
      cleanUrl.includes('youtu.be') ||
      cleanUrl.includes('ooyue89ftlm') ||
      cleanUrl.includes('f7fgpfuy_xq') ||
      cleanUrl.includes('lsiimtxd0lk') ||
      cleanUrl.includes('sqkpxs045ck') ||
      cleanUrl.includes('_xdaidnxhqa')
    ) {
      return 'youtube';
    }
    if (cleanUrl.includes('drive.google.com/file') || cleanUrl.includes('/file/d/') || cleanUrl.includes('pdf')) {
      return 'pdf';
    }
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

  // Base filtering by Type (Video vs PDF)
  const typeFiltered = demoLectures.filter(l => {
    const type = getLectureType(l.googleDriveFileId);
    if (activeTypeTab === 'pdf') {
      return type === 'pdf';
    } else {
      return type !== 'pdf';
    }
  });

  // Filtering by search and subject
  const filteredLectures = typeFiltered.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || l.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  // Grouping subjects for segmented rendering
  const subjectsList = ['biology', 'chemistry', 'physics', 'english', 'mathematics'];
  
  const getSubjectColorClass = (subj) => {
    switch (subj.toLowerCase()) {
      case 'biology': return 'hover-glow-green';
      case 'chemistry': return 'hover-glow-violet';
      case 'physics': return 'hover-glow-blue';
      default: return 'hover-glow-gold';
    }
  };

  const getSubjectLabel = (subj) => {
    switch (subj.toLowerCase()) {
      case 'biology': return '🧬 Biology';
      case 'chemistry': return '🧪 Chemistry';
      case 'physics': return '⚡ Physics';
      case 'english': return '📚 English';
      case 'mathematics': return '🧮 Mathematics';
      default: return subj;
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
          Academic Video Lectures & PDF Resources
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Structured concept walkthroughs and downloadable mock prep files categorized by subject and topic.
        </p>
      </header>

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button
          onClick={() => { setActiveTypeTab('video'); setSelectedSubject('all'); }}
          className={activeTypeTab === 'video' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '12px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
        >
          <Video size={18} />
          Video Lectures
        </button>
        <button
          onClick={() => { setActiveTypeTab('pdf'); setSelectedSubject('all'); }}
          className={activeTypeTab === 'pdf' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '12px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
        >
          <FileText size={18} />
          PDF Material & Notes
        </button>
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
            placeholder={`Search ${activeTypeTab === 'video' ? 'videos' : 'PDFs'} by topic or title...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Subject Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedSubject('all')}
            className={selectedSubject === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
          >
            All
          </button>
          {subjectsList.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={selectedSubject === subj ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', textTransform: 'capitalize', fontSize: '13px', borderRadius: '8px' }}
            >
              {subj}
            </button>
          ))}
        </div>
      </section>

      {/* Content Section */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <div className="skeleton-box" style={{ height: '200px' }} />
          <div className="skeleton-box" style={{ height: '200px' }} />
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="glass-panel" style={{ padding: '50px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            No {activeTypeTab === 'video' ? 'video lectures' : 'PDF files'} found matching your selection.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {subjectsList.map((subj) => {
            // If filtering by specific subject, hide other subjects
            if (selectedSubject !== 'all' && selectedSubject !== subj) return null;

            // Get items for this subject
            const subjectItems = filteredLectures.filter(l => l.subject.toLowerCase() === subj.toLowerCase());
            if (subjectItems.length === 0) return null;

            return (
              <div key={subj} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  borderBottom: '2px solid var(--border-color)',
                  paddingBottom: '10px',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {getSubjectLabel(subj)}
                  <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: '12px', fontWeight: 500 }}>
                    {subjectItems.length} {activeTypeTab === 'video' ? 'Videos' : 'PDFs'}
                  </span>
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {subjectItems.map((l) => (
                    <div
                      key={l._id}
                      className={`glass-panel hover-card-3d ${getSubjectColorClass(l.subject)}`}
                      style={{
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '15px',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                          {l.title} {!l.isDemo && '🔒'}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
                          Topic: {l.topic} {!l.isDemo && '(Premium Only)'}
                        </span>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '10px 0 0 0', lineHeight: 1.5 }}>
                          {l.description || 'No description provided.'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {l.isDemo ? (
                          <button
                            onClick={() => handleWatchDemo(l)}
                            className="btn-secondary"
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: activeTypeTab === 'pdf' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                              borderColor: activeTypeTab === 'pdf' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(124, 58, 237, 0.3)'
                            }}
                          >
                            {activeTypeTab === 'pdf' ? (
                              <>
                                <ExternalLink size={14} />
                                View PDF Document
                              </>
                            ) : (
                              <>
                                <Play size={14} fill="currentColor" />
                                Stream Video Lesson
                              </>
                            )}
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="btn-secondary"
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              borderColor: 'var(--accent)',
                              color: 'var(--accent)',
                              textDecoration: 'none'
                            }}
                          >
                            Unlock Premium 🔒
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
