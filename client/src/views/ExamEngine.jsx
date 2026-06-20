import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Clock, Flag, Check, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';

export const ExamEngine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [flagged, setFlagged] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(null); // in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Results view state
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const timerRef = useRef(null);

  // Load Exam
  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/api/v1/exams/mocks/${id}`);
        const data = await res.json();
        
        if (data.success) {
          setExam(data.exam);
          setQuestions(data.exam.questions);
          setTimeRemaining(data.exam.duration * 60);

          // Restore state from LocalStorage to ensure state preservation on page reload
          const cachedAnswers = localStorage.getItem(`sea-exam-ans-${id}`);
          if (cachedAnswers) {
            setAnswers(JSON.parse(cachedAnswers));
          }

          const cachedFlagged = localStorage.getItem(`sea-exam-flag-${id}`);
          if (cachedFlagged) {
            setFlagged(new Set(JSON.parse(cachedFlagged)));
          }

          const cachedTime = localStorage.getItem(`sea-exam-time-${id}`);
          if (cachedTime) {
            const parsedTime = parseInt(cachedTime, 10);
            if (parsedTime > 0) setTimeRemaining(parsedTime);
          }
        } else {
          setError(data.message || 'Failed to load exam data.');
        }
      } catch (err) {
        console.error(err);
        setError('Network error loading test.');
      }
      setLoading(false);
    };

    fetchExam();
  }, [id]);

  // Sync state to LocalStorage on modifications
  useEffect(() => {
    if (exam) {
      localStorage.setItem(`sea-exam-ans-${id}`, JSON.stringify(answers));
    }
  }, [answers, exam, id]);

  useEffect(() => {
    if (exam) {
      localStorage.setItem(`sea-exam-flag-${id}`, JSON.stringify(Array.from(flagged)));
    }
  }, [flagged, exam, id]);

  // Countdown timer loop
  useEffect(() => {
    if (timeRemaining === null || submitted) return;

    if (timeRemaining <= 0) {
      // Auto-Submit on time expiry
      handleExamSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const nextTime = prev - 1;
        // Save time to cache
        localStorage.setItem(`sea-exam-time-${id}`, nextTime.toString());
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeRemaining, submitted]);

  const handleSelectOption = (questionId, optionIndex) => {
    const letter = String.fromCharCode(65 + optionIndex); // 0 -> A, 1 -> B, 2 -> C, 3 -> D
    setAnswers((prev) => ({
      ...prev,
      [questionId]: letter
    }));
  };

  const handleToggleFlag = (questionId) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleExamSubmit = async () => {
    clearInterval(timerRef.current);
    setLoading(true);

    try {
      const res = await authFetch('/api/v1/exams/mocks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: id,
          answers: answers, // Sends Map object matching database type
          flaggedQuestions: Array.from(flagged)
        })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        setSubmitted(true);
        // Clear local caches
        localStorage.removeItem(`sea-exam-ans-${id}`);
        localStorage.removeItem(`sea-exam-flag-${id}`);
        localStorage.removeItem(`sea-exam-time-${id}`);
      } else {
        setError(data.message || 'Submission error.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection dropped. Failed to submit test.');
    }
    setLoading(false);
  };

  // Timer formatter
  const formatTime = (sec) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hours > 0 ? hours + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !submitted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <h3>Processing test sheets and state trackers...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '500px', margin: '100px auto', textAlign: 'center' }} className="glass-panel">
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
        <h3>Exam Error</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '15px 0' }}>{error}</p>
        <button onClick={() => navigate(user ? '/dashboard' : '/')} className="btn-primary">
          {user ? 'Return to Dashboard' : 'Return to Home Page'}
        </button>
      </div>
    );
  }

  /* ==========================================================================
     RESULTS SHEET VIEW
     ========================================================================== */
  if (submitted && results) {
    return (
      <div style={{ width: '90%', maxWidth: '900px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Check size={48} style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.15)', padding: '10px', borderRadius: '50%' }} />
          <div>
            <h2>Mock Assessment Completed!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Graded result details generated instantly.</p>
          </div>
          <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent)' }}>{results.score}</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Score (Marks)</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>{results.totalQuestions}</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Questions</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--success)' }}>
                {Math.round((results.score / (results.totalQuestions * (exam?.negativeMarking ? 4 : 1))) * 100)}%
              </span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Accuracy</p>
            </div>
          </div>
          {exam?.negativeMarking && (
            <p style={{ fontSize: '13px', color: 'var(--warning)', fontStyle: 'italic' }}>
              Note: ECAT negative marking applied (+4 for correct, -1 for incorrect, 0 for blank).
            </p>
          )}
          <button onClick={() => navigate(user ? '/dashboard' : '/')} className="btn-primary" style={{ marginTop: '15px' }}>
            {user ? 'Return to Dashboard' : 'Return to Home Page'}
          </button>
        </div>

        {/* Detailed Solutions Key List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3>Answer Explanation Keys</h3>
          {results.gradedAnswers.map((item, idx) => (
            <div key={idx} className="glass-panel" style={{
              padding: '24px',
              borderLeft: `5px solid ${item.isCorrect ? 'var(--success)' : 'var(--danger)'}`,
              background: item.isCorrect ? 'rgba(16,185,129,0.02)' : 'rgba(239,68,68,0.02)'
            }}>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>Q{idx + 1}. {questions[idx]?.questionText}</p>
              
              <ul style={{ listStyleType: 'none', margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {questions[idx]?.options.map((opt, oIdx) => {
                  const optionLetter = String.fromCharCode(65 + oIdx); // 'A', 'B', 'C', 'D'
                  let border = '1px solid var(--border-color)';
                  let bg = 'transparent';
                  let color = 'var(--text-primary)';

                  if (optionLetter === item.correctOptionIndex) {
                    border = '1px solid var(--success)';
                    bg = 'rgba(16, 185, 129, 0.1)';
                    color = 'var(--success)';
                  } else if (optionLetter === item.selectedOptionIndex && !item.isCorrect) {
                    border = '1px solid var(--danger)';
                    bg = 'rgba(239, 68, 68, 0.1)';
                    color = 'var(--danger)';
                  }

                  return (
                    <li key={oIdx} style={{
                      padding: '10px 15px',
                      borderRadius: '8px',
                      border,
                      background: bg,
                      color,
                      fontSize: '14px',
                      fontWeight: optionLetter === item.correctOptionIndex ? 'bold' : 'normal'
                    }}>
                      {opt} {optionLetter === item.correctOptionIndex && '✓ (Correct)'} {optionLetter === item.selectedOptionIndex && optionLetter !== item.correctOptionIndex && '✗ (Your choice)'}
                    </li>
                  );
                })}
              </ul>
              
              {item.explanation && (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '10px',
                  marginTop: '10px'
                }}>
                  <strong>Logical Solution:</strong> {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ==========================================================================
     ACTIVE MOCK EXAM ENGINE VIEW
     ========================================================================== */
  const activeQ = questions[currentIdx];

  return (
    <div style={{ width: '90%', maxWidth: '1200px', margin: '20px auto', display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
      
      {/* Center Panel: Active MCQ Question Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header toolbar */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => navigate(user ? '/dashboard' : '/')}>
              <ArrowLeft size={16} />
              <span>{user ? 'Quit Test' : 'Quit & Exit'}</span>
            </button>
            <h4>{exam?.title}</h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold' }}>
            <Clock size={18} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* MCQ content card */}
        {activeQ && (
          <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ background: 'var(--border-color)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {activeQ.subject} • {activeQ.topic}
                </span>
                <h3 style={{ fontSize: '20px', marginTop: '12px', fontWeight: 600 }}>
                  Question {currentIdx + 1} of {questions.length}
                </h3>
              </div>
              
              {/* Flag Bookmark Toggle */}
              <button
                onClick={() => handleToggleFlag(activeQ._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: flagged.has(activeQ._id) ? 'var(--warning)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                <Flag size={18} fill={flagged.has(activeQ._id) ? 'var(--warning)' : 'none'} />
                <span>{flagged.has(activeQ._id) ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {activeQ.questionText}
            </p>

            {/* Premium 3D option cards grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {activeQ.options.map((opt, oIdx) => {
                const optionLetter = String.fromCharCode(65 + oIdx); // 'A', 'B', 'C', 'D'
                const isSelected = answers[activeQ._id] === optionLetter;
                return (
                  <div
                    key={oIdx}
                    onClick={() => handleSelectOption(activeQ._id, oIdx)}
                    className="glass-panel hover-card-3d"
                    style={{
                      padding: '18px 24px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--accent-glow)' : 'var(--bg-card)',
                      transition: 'var(--transition-smooth)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '2px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border-color)',
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--text-secondary)'
                    }}>
                      {optionLetter}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Stepper controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button
                className="btn-secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((p) => p - 1)}
                style={{ opacity: currentIdx === 0 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              
              {currentIdx === questions.length - 1 ? (
                <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={handleExamSubmit}>
                  Submit Mock Exam
                </button>
              ) : (
                <button className="btn-primary" onClick={() => setCurrentIdx((p) => p + 1)}>
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Question Blocks Navigation Sidebar Palette */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
        <h3>MCQ Palette</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          Colors: Grey (Unvisited), Green (Answered), Orange (Flagged). Click to jump.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {questions.map((q, idx) => {
            const isAnswered = answers[q._id] !== undefined;
            const isFlagged = flagged.has(q._id);
            const isActive = idx === currentIdx;

            let bg = 'rgba(255,255,255,0.06)';
            let border = '1px solid var(--border-color)';
            let color = 'var(--text-secondary)';

            if (isAnswered) {
              bg = 'rgba(16, 185, 129, 0.2)';
              border = '1px solid var(--success)';
              color = 'var(--success)';
            }
            if (isFlagged) {
              bg = 'rgba(245, 158, 11, 0.2)';
              border = '1px solid var(--warning)';
              color = 'var(--warning)';
            }
            if (isActive) {
              border = '2px solid var(--accent)';
              color = 'var(--accent)';
            }

            return (
              <button
                key={q._id}
                onClick={() => setCurrentIdx(idx)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  background: bg,
                  border,
                  color,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
