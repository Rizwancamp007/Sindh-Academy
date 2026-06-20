import React, { useState } from 'react';
import { Search, Info, AlertTriangle, HelpCircle } from 'lucide-react';

export const SearchMcqs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let url = `/api/v1/exams/search-mcq?q=${encodeURIComponent(searchQuery)}`;
      if (subjectFilter !== 'All') {
        url += `&subject=${encodeURIComponent(subjectFilter)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setSearchResults(data.questions);
        setSearched(true);
      } else {
        setErrorMsg(data.message || 'Failed to retrieve questions.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{
      width: '90%',
      maxWidth: '900px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      {/* Header section */}
      <header style={{ textAlign: 'center', padding: '40px 10px 10px' }}>
        <h1 className="shimmer-text" style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '12px' }}>
          Interactive MCQ Question Bank
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Search our global repository of MDCAT and ECAT preparatory questions. Check concept answers and details dynamically.
        </p>
      </header>

      {/* Search controller container */}
      <section className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '280px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                SEARCH KEYWORDS
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mitochondria, Genetics, Newton, Force, Kinetic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                SUBJECT FILTER
              </label>
              <select 
                className="form-input" 
                value={subjectFilter} 
                onChange={(e) => setSubjectFilter(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="All">All Subjects</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Searching Repository...' : 'Query Question Bank'}
          </button>
        </form>
      </section>

      {/* Information Tip block */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        padding: '15px',
        borderRadius: '12px',
        fontSize: '13px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <Info size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          <strong>Note on Locked Keys:</strong> Questions linked to monthly mock exams will show as <strong>Locked 🔒</strong> to prevent cheating. To unlock key explanations, sign up for a premium account, pay the voucher, and attempt the corresponding Mock Exam!
        </p>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <AlertTriangle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results grid */}
      {searched && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '60px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Query Results ({searchResults.length} matches)
          </h3>
          
          {searchResults.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
              <p>No matches found in the Sindh Educational Academy bank for your query.</p>
              <small>Try using general keyword terms like "Mitochondria", "Kinetics", or change your subject filter.</small>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {searchResults.map((q, qidx) => (
                <div 
                  key={q._id} 
                  className="glass-panel hover-card-3d hover-glow-violet" 
                  style={{ 
                    padding: '25px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '15px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      background: 'rgba(124, 58, 237, 0.15)', 
                      color: 'var(--accent)', 
                      padding: '4px 10px', 
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {q.subject} • {q.topic || 'General'}
                    </span>
                    {q.isLocked && (
                      <span style={{ 
                        fontSize: '11px', 
                        background: 'rgba(245, 158, 11, 0.15)', 
                        color: '#f59e0b', 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        fontWeight: 'bold'
                      }}>
                        🔒 Exam Locked
                      </span>
                    )}
                  </div>

                  <p style={{ fontWeight: 600, fontSize: '16px', lineHeight: 1.5, margin: 0 }}>
                    Q{qidx + 1}: {q.questionText}
                  </p>

                  <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', margin: '5px 0' }}>
                    {q.options.map((opt, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      const isCorrect = !q.isLocked && optionLetter === q.correctOption;
                      return (
                        <li 
                          key={idx} 
                          style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                            border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                            color: isCorrect ? 'var(--success)' : 'var(--text-secondary)',
                            fontWeight: isCorrect ? 'bold' : 'normal',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{optionLetter}) {opt}</span>
                          {isCorrect && <span style={{ fontSize: '11px', color: 'var(--success)' }}>Correct Answer ✓</span>}
                        </li>
                      );
                    })}
                  </ul>

                  {q.isLocked ? (
                    <div style={{ 
                      background: 'rgba(245, 158, 11, 0.05)', 
                      border: '1.5px dashed rgba(245, 158, 11, 0.2)', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      color: '#f59e0b', 
                      fontStyle: 'italic' 
                    }}>
                      Answer keys and explanation files are locked. Complete payment slip validation and attempt this mock exam to unlock solutions.
                    </div>
                  ) : (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.02)', 
                      padding: '12px 15px', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5
                    }}>
                      <strong>Explanation Breakdown:</strong> {q.explanation || 'No step-by-step reasoning has been uploaded yet for this question.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
