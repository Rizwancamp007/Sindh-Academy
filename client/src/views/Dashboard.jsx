import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Video, BookOpen, AlertCircle, FileText, CheckCircle, Upload, Plus,
  Shield, UserCheck, Activity, Award, Flame, Search, PlayCircle
} from 'lucide-react';
const ChangePasswordModal = ({ isOpen, onClose, authFetch }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMsg('New passwords do not match.');
      return;
    }

    // Password Complexity Rules enforce
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setIsError(true);
      setMsg('Password must be at least 8 characters, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).');
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch('/api/v1/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsError(false);
        setMsg('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setIsError(true);
        setMsg(data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMsg('Error communicating with authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
      zIndex: 99999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--bg-card)',
        padding: '30px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <button
          onClick={onClose}
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
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', margin: 0 }}>Update Secure Password</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>Modify your authorization access credentials.</p>
        </div>

        {msg && (
          <p style={{
            fontSize: '13px',
            color: isError ? 'var(--danger)' : 'var(--success)',
            background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            margin: 0
          }}>
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label style={{ fontSize: '12px' }}>Current Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '12px' }}>New Secure Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '12px' }}>Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }} className="skeleton-box">
      <h3 style={{ fontFamily: 'var(--font-heading)' }}>Redirecting to secure workspace...</h3>
    </div>
  );
};

export const StudentDashboardView = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [isPassOpen, setIsPassOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'student') return null;

  return (
    <div className="page-transition" style={{ width: '90%', maxWidth: '1200px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>Student Prep Workspace</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome, <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{user.name}</span> ({user.email})</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setIsPassOpen(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Change Password</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' }}>
            <Award size={18} />
            <span>{user.isPaid ? 'Premium Enrolled' : 'Coaching Trial'}</span>
          </div>
        </div>
      </header>
      <StudentDashboard user={user} authFetch={authFetch} />
      <ChangePasswordModal isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} authFetch={authFetch} />
    </div>
  );
};

export const ClerkDashboardView = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [isPassOpen, setIsPassOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'clerk') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'clerk') return null;

  return (
    <div className="page-transition" style={{ width: '90%', maxWidth: '1200px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>Clerk Verification Desk</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Operator: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--warning)' }}>{user.name}</span></p>
        </div>
        <button onClick={() => setIsPassOpen(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Change Password</button>
      </header>
      <ClerkDashboard authFetch={authFetch} />
      <ChangePasswordModal isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} authFetch={authFetch} />
    </div>
  );
};

export const TeacherDashboardView = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [isPassOpen, setIsPassOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'teacher') return null;

  return (
    <div className="page-transition" style={{ width: '90%', maxWidth: '1200px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>Teacher Content Portal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Faculty: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--accent)' }}>{user.name}</span></p>
        </div>
        <button onClick={() => setIsPassOpen(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Change Password</button>
      </header>
      <TeacherDashboard authFetch={authFetch} />
      <ChangePasswordModal isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} authFetch={authFetch} />
    </div>
  );
};

export const AdminDashboardView = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [isPassOpen, setIsPassOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="page-transition" style={{ width: '90%', maxWidth: '1200px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>Admin Operations Hub</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Operator: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--accent)' }}>{user.name}</span></p>
        </div>
        <button onClick={() => setIsPassOpen(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Change Password</button>
      </header>
      <AdminDashboard authFetch={authFetch} />
      <ChangePasswordModal isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} authFetch={authFetch} />
    </div>
  );
};

/* ==========================================================================
   1. STUDENT DASHBOARD
   ========================================================================== */
const StudentDashboard = ({ user, authFetch }) => {
  const navigate = useNavigate();
  const [challan, setChallan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('mdcat/ecat');
  const [receiptFile, setReceiptFile] = useState(null);
  const [txId, setTxId] = useState('');
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });
  const [lectures, setLectures] = useState([]);
  const [exams, setExams] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [subTab, setSubTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const getLectureType = (fileId) => {
    if (!fileId) return 'standard';
    if (fileId.startsWith('http') && (fileId.includes('drive.google.com/file') || fileId.includes('.pdf') || fileId.includes('drive.google.com/open') || fileId.includes('/view'))) {
      return 'pdf';
    }
    if (fileId.length === 11 || fileId.includes('youtu') || fileId.includes('youtube')) {
      return 'youtube';
    }
    return 'standard';
  };

  const getYouTubeEmbedUrl = (fileId) => {
    if (!fileId) return '';
    let videoId = fileId;
    if (fileId.includes('youtu.be/')) {
      videoId = fileId.split('youtu.be/')[1].split('?')[0];
    } else if (fileId.includes('youtube.com/watch')) {
      const parts = fileId.split('?')[1] || '';
      const params = new URLSearchParams(parts);
      videoId = params.get('v') || fileId;
    } else if (fileId.includes('youtube.com/embed/')) {
      videoId = fileId.split('youtube.com/embed/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getRecommendedLectures = () => {
    if (!user || !user.weakTopics || user.weakTopics.length === 0 || lectures.length === 0) return [];
    const weakSubjects = user.weakTopics.map(wt => wt.subject?.toLowerCase());
    const weakTopics = user.weakTopics.map(wt => wt.topic?.toLowerCase());
    return lectures.filter(l => 
      weakSubjects.includes(l.subject?.toLowerCase()) || 
      weakTopics.includes(l.topic?.toLowerCase())
    ).slice(0, 3);
  };

  const loadData = async () => {
    try {
      const challanRes = await authFetch('/api/v1/billing/my-challan');
      const challanData = await challanRes.json();
      if (challanData.success) setChallan(challanData.challan);

      const lecturesRes = await authFetch('/api/v1/resources/lectures');
      const lecturesData = await lecturesRes.json();
      if (lecturesData.success) setLectures(lecturesData.lectures);

      const examsRes = await authFetch('/api/v1/exams');
      const examsData = await examsRes.json();
      if (examsData.success) setExams(examsData.exams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
          <div className="skeleton skeleton-block"></div>
        </div>
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '95%' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
          <div className="skeleton skeleton-block"></div>
        </div>
      </div>
    );
  }

  const handleGenerateChallan = async () => {
    try {
      const res = await authFetch('/api/v1/billing/challan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: selectedPlan })
      });
      const data = await res.json();
      if (data.success) {
        setChallan(data.challan);
        setUploadMsg({ type: 'success', text: 'Challan voucher generated successfully.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptFile) return;

    setUploadMsg({ type: '', text: '' });
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    formData.append('transactionId', txId);

    try {
      const res = await authFetch(`/api/v1/billing/challan/upload-receipt/${challan._id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setChallan(data.challan);
        setUploadMsg({ type: 'success', text: 'Receipt uploaded. Waiting for clerk approval.' });
      } else {
        setUploadMsg({ type: 'error', text: data.message || 'Verification check failed.' });
      }
    } catch (err) {
      console.error(err);
      setUploadMsg({ type: 'error', text: 'File upload error.' });
    }
  };

  const videoLectures = lectures.filter(l => getLectureType(l.googleDriveFileId) !== 'pdf');
  const pdfLectures = lectures.filter(l => getLectureType(l.googleDriveFileId) === 'pdf');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
      
      {user.isPaid && (
        <div style={{
          display: 'flex',
          gap: '15px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '15px',
          flexWrap: 'wrap',
          marginBottom: '10px'
        }}>
          <button
            onClick={() => setSubTab('overview')}
            className={subTab === 'overview' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Activity size={16} />
            <span>Overview & Streak</span>
          </button>
          <button
            onClick={() => setSubTab('videos')}
            className={subTab === 'videos' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Video size={16} />
            <span>Lecture Videos ({videoLectures.length})</span>
          </button>
          <button
            onClick={() => setSubTab('notes')}
            className={subTab === 'notes' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BookOpen size={16} />
            <span>Lecture Notes PDFs ({pdfLectures.length})</span>
          </button>
          <button
            onClick={() => setSubTab('mocks')}
            className={subTab === 'mocks' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={16} />
            <span>Mock Tests ({exams.length})</span>
          </button>
        </div>
      )}

      {(!user.isPaid || subTab === 'overview') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                  <Flame size={24} fill="#f59e0b" />
                  <h3 style={{ color: 'var(--text-primary)' }}>Daily Streak</h3>
                </div>
                <span style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
                }}>
                  {user.dailyStreak || 1} Days Active
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                Maintain entry prep consistency to secure top medical & engineering positions!
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} style={{ color: 'var(--accent)' }} />
                  <span>Weak Topics Tracker</span>
                </h4>
                {(!user.weakTopics || user.weakTopics.length === 0) ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No weaknesses logged yet. Complete mock tests to run automated weak diagnostics.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {user.weakTopics.map((t, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{t.topic}</p>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.subject}</span>
                        </div>
                        <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{t.successRate}% Success</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {getRecommendedLectures().length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px' }}>
                    <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <BookOpen size={14} />
                      <span>Recommended Review Material</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {getRecommendedLectures().map((l, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(124, 58, 237, 0.05)',
                          border: '1px solid rgba(124, 58, 237, 0.15)',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{l.title}</p>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{l.subject} • {l.topic}</span>
                          </div>
                          {getLectureType(l.googleDriveFileId) === 'pdf' ? (
                            <a
                              href={!user.isPaid && !l.isDemo ? '#' : l.googleDriveFileId}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                if (!user.isPaid && !l.isDemo) {
                                  e.preventDefault();
                                  alert('Premium Lecture Locked 🔒. Please verify payment to unlock.');
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none' }}
                            >
                              PDF
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                if (!user.isPaid && !l.isDemo) {
                                  alert('Premium Lecture Locked 🔒. Please verify payment to unlock.');
                                } else {
                                  setActiveVideo(l);
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Watch
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3>Fee Challan Voucher</h3>
              {user.isPaid ? (
                <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--success)', fontSize: '18px', marginBottom: '4px' }}>Premium Access Active</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                      Your account fee has been verified. You have full access to all lectures, practice mocks, and chapter exams.
                    </p>
                  </div>
                </div>
              ) : !challan ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Choose a registration category to generate your payment voucher:</p>
                  <div className="form-group">
                    <label>Select Category Plan</label>
                    <select className="form-input" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                      <option value="mdcat/ecat">MDCAT / ECAT Prep (RS. 5,000)</option>
                      <option value="coaching">Matric / Inter Coaching (RS. 4,000)</option>
                    </select>
                  </div>
                  <button onClick={handleGenerateChallan} className="btn-primary" style={{ width: '100%' }}>
                    Generate Fee Challan
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                    <div style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>
                      <CheckCircle size={16} style={{ margin: '0 auto 4px' }} />
                      Generated
                    </div>
                    <div style={{ textAlign: 'center', color: ['uploaded', 'verified'].includes(challan.status) ? 'var(--success)' : 'var(--text-muted)' }}>
                      <Upload size={16} style={{ margin: '0 auto 4px' }} />
                      Proof Sent
                    </div>
                    <div style={{ textAlign: 'center', color: challan.status === 'verified' ? 'var(--success)' : (challan.status === 'rejected' ? 'var(--danger)' : 'var(--text-muted)') }}>
                      <FileText size={16} style={{ margin: '0 auto 4px' }} />
                      {challan.status === 'verified' ? 'Verified' : 'Audit Pending'}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', marginBottom: '6px' }}>Challan: <strong>{challan.challanNumber}</strong></p>
                    <p style={{ fontSize: '14px', marginBottom: '6px' }}>Category: <strong style={{ textTransform: 'uppercase' }}>{challan.planName || 'MDCAT/ECAT'}</strong></p>
                    <p style={{ fontSize: '14px', marginBottom: '6px' }}>Amount: <strong>RS. {challan.amount}</strong></p>
                    <p style={{ fontSize: '14px', marginBottom: '6px' }}>Status: <span style={{
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      color: challan.status === 'verified' ? 'var(--success)' : (challan.status === 'rejected' ? 'var(--danger)' : 'var(--warning)')
                    }}>{challan.status}</span></p>
                  </div>

                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      const studentName = user ? user.name : 'N/A';
                      const studentEmail = user ? user.email : 'N/A';
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>SEA Fee Challan Print - ${challan.challanNumber}</title>
                            <style>
                              body { font-family: 'Outfit', 'Inter', sans-serif; padding: 20px; color: #333; }
                              .challan-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 15px; margin-bottom: 20px; }
                              .logo-text { font-size: 22px; font-weight: bold; color: #7c3aed; }
                              .challan-copy { border: 1.5px dashed #ccc; padding: 25px; margin-bottom: 30px; border-radius: 8px; position: relative; }
                              .copy-tag { position: absolute; top: 10px; right: 15px; background: #eee; padding: 4px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; border-radius: 4px; }
                              .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; font-size: 13px; }
                              .bank-info { background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 12px; margin-top: 15px; border: 1px solid #e2e8f0; }
                              @media print { .no-print { display: none; } }
                            </style>
                          </head>
                          <body>
                            <div class="no-print" style="margin-bottom: 20px; display: flex; gap: 10px;">
                              <button onclick="window.print()" style="background:#7c3aed; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">Print Voucher</button>
                              <button onclick="window.close()" style="background:#e2e8f0; color:#333; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">Close Window</button>
                            </div>
                            
                            ${['Student Copy', 'Bank Copy', 'Academy Copy'].map((copyName) => `
                              <div class="challan-copy">
                                <div class="copy-tag">${copyName}</div>
                                <div class="challan-header">
                                  <div>
                                    <div class="logo-text">SINDH EDUCATIONAL ACADEMY</div>
                                    <span style="font-size:11px; color:#666;">National Highway Road, Ghotki, Sindh</span>
                                  </div>
                                  <div style="text-align:right;">
                                    <strong>Challan: ${challan.challanNumber}</strong><br/>
                                    <span style="font-size:11px;">Issue Date: ${new Date(challan.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                <div class="detail-grid">
                                  <div>
                                    <strong>Student Name:</strong> ${studentName}<br/>
                                    <strong>Email:</strong> ${studentEmail}
                                  </div>
                                  <div>
                                    <strong>Plan Category:</strong> ${(challan.planName || 'mdcat/ecat').toUpperCase()}<br/>
                                    <strong>Payable Fee Amount:</strong> <span style="color:#7c3aed; font-weight:bold;">RS. ${challan.amount}</span>
                                  </div>
                                </div>

                                <div class="bank-info">
                                  <strong>Official Bank Deposit Account:</strong><br/>
                                  Bank: Allied Bank Limited (ABL), Ghotki Branch<br/>
                                  Account Title: Sindh Educational Academy (Private) Limited<br/>
                                  Account Number (IBAN): PK89ALBL0010023456789101
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-top:25px; font-size:11px; color:#666;">
                                  <span>________________________<br/>Depositor Signature</span>
                                  <span>________________________<br/>Bank Officer Stamp</span>
                                </div>
                              </div>
                            `).join('')}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }} 
                    className="btn-secondary" 
                    style={{ 
                      width: '100%', 
                      background: 'rgba(59, 130, 246, 0.12)', 
                      border: '1.5px dashed rgba(59, 130, 246, 0.4)', 
                      color: '#3b82f6',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FileText size={16} />
                    <span>Print / Save Challan PDF</span>
                  </button>

                  {uploadMsg.text && (
                    <p style={{
                      fontSize: '13px',
                      color: uploadMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                      background: uploadMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      padding: '8px',
                      borderRadius: '6px'
                    }}>
                      {uploadMsg.text}
                    </p>
                  )}

                  {challan.status === 'generated' && (
                    <form onSubmit={handleUploadReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="form-group">
                        <label>Transaction ID / Hash</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter EasyPaisa / Bank reference"
                          required
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Receipt File (JPG, PNG, PDF - Max 5MB)</label>
                        <input
                          type="file"
                          required
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files[0])}
                        />
                      </div>
                      <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Submit Receipt Proof
                      </button>
                    </form>
                  )}

                  {challan.status === 'rejected' && (
                    <div>
                      <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '10px' }}>
                        Your receipt proof was rejected by the auditing clerk. Please double check details and submit again.
                      </p>
                      <button onClick={handleGenerateChallan} className="btn-primary" style={{ width: '100%' }}>
                        Re-generate Challan
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {!user.isPaid && (
              <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3>Premium Preparatory Catalog Preview 🔒</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Register, verify, and unlock full access to all lectures and mocks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lectures.slice(0, 3).map(l => (
                    <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                      <span>{l.title}</span>
                      <span style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 'bold' }}>Locked 🔒</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {user.isPaid && subTab === 'videos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {activeVideo && (
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '2px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>Streaming: {activeVideo.title}</h4>
                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setActiveVideo(null)}>
                  Close Player
                </button>
              </div>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#000', width: '100%', aspectRatio: '16/9' }}>
                {getLectureType(activeVideo.googleDriveFileId) === 'youtube' ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(activeVideo.googleDriveFileId)}
                    title={activeVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                ) : (
                  <video
                    src={`/api/v1/resources/stream/${activeVideo._id}`}
                    controls
                    controlsList="nodownload"
                    style={{ width: '100%', height: '100%' }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )}
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>Preparatory Video Lessons</h3>
            {videoLectures.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No video lectures published yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                {videoLectures.map((l) => (
                  <div key={l._id} className="glass-panel hover-card-3d" style={{ padding: '24px', background: 'rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <h4 style={{ fontSize: '17px' }}>{l.title}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '5px' }}>
                        {l.subject} • {l.topic}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', flexGrow: 1 }}>{l.description}</p>
                    <button
                      onClick={() => setActiveVideo(l)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px', alignSelf: 'start', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <PlayCircle size={16} />
                      <span>Watch Stream</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {user.isPaid && subTab === 'notes' && (
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Chapter Notes & PDF Worksheets</h3>
          {pdfLectures.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No lecture notes PDFs uploaded yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
              {pdfLectures.map((l) => (
                <div key={l._id} className="glass-panel hover-card-3d" style={{ padding: '24px', background: 'rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <h4 style={{ fontSize: '17px' }}>{l.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '5px' }}>
                      {l.subject} • {l.topic}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', flexGrow: 1 }}>{l.description}</p>
                  <a
                    href={l.googleDriveFileId}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px', alignSelf: 'start', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <BookOpen size={16} />
                    <span>View PDF Resource</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.isPaid && subTab === 'mocks' && (
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Entry Mock Evaluation Exams</h3>
          {exams.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No mock tests published yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {exams.map((e) => (
                <div key={e._id} className="glass-panel hover-card-3d" style={{ padding: '24px', background: 'rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ fontSize: '18px' }}>{e.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '5px' }}>{e.description}</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-block', marginTop: '8px' }}>
                      Duration: {e.durationMinutes || e.duration} Mins • {e.isMonthly ? 'Monthly Test' : 'Standard Mock'}
                    </span>
                  </div>
                  {e.externalDocLink ? (
                    <a
                      href={e.externalDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                    >
                      <span>Open Mock Doc</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => navigate(`/exam/${e._id}`)}
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '13px' }}
                    >
                      Launch Exam Engine
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReceiptThumbnail = ({ challanId, authFetch, onClick }) => {
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchThumb = async () => {
      try {
        const res = await authFetch(`/api/v1/billing/receipt/${challanId}`);
        if (!res.ok) throw new Error('Not found');
        const blob = await res.blob();
        if (active) {
          setImgUrl(URL.createObjectURL(blob));
          setLoading(false);
        }
      } catch (err) {
        if (active) setLoading(false);
      }
    };
    fetchThumb();
    return () => {
      active = false;
    };
  }, [challanId, authFetch]);

  if (loading) return <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />;
  if (!imgUrl) return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No Slip</span>;

  return (
    <img
      src={imgUrl}
      alt="proof thumb"
      onClick={() => onClick(imgUrl)}
      style={{
        width: '40px',
        height: '40px',
        objectFit: 'cover',
        borderRadius: '6px',
        cursor: 'pointer',
        border: '1px solid var(--border-color)',
        transition: 'var(--transition-smooth)'
      }}
      title="Click to zoom proof"
    />
  );
};

/* ==========================================================================
   2. CLERK DASHBOARD (Payment Verification Queue)
   ========================================================================== */
const ClerkDashboard = ({ authFetch }) => {
  const [challans, setChallans] = useState([]);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState(null);

  // New States for Student Search & Custom Invoice Generation
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState('5000');
  const [invoicePlan, setInvoicePlan] = useState('mdcat/ecat');
  const [invoiceDetails, setInvoiceDetails] = useState('');
  const [invoiceMsg, setInvoiceMsg] = useState({ type: '', text: '' });

  // Reviews States
  const [rightTab, setRightTab] = useState('payments');
  const [reviews, setReviews] = useState([]);
  const [revName, setRevName] = useState('');
  const [revAchievement, setRevAchievement] = useState('');
  const [revText, setRevText] = useState('');
  const [revAvatar, setRevAvatar] = useState('student1');
  const [revMsg, setRevMsg] = useState('');

  const loadChallans = async () => {
    try {
      const res = await authFetch('/api/v1/billing/challans');
      const data = await res.json();
      if (data.success) setChallans(data.challans);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllStudents = async () => {
    try {
      const res = await authFetch('/api/v1/auth/students');
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await authFetch('/api/v1/resources/reviews');
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadChallans();
    loadAllStudents();
    loadReviews();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    setRevMsg('');
    try {
      const res = await authFetch('/api/v1/resources/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: revName,
          achievement: revAchievement,
          reviewText: revText,
          avatarName: revAvatar
        })
      });
      const data = await res.json();
      if (data.success) {
        setRevMsg('Success story successfully published to home page!');
        setRevName('');
        setRevAchievement('');
        setRevText('');
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this success story?')) return;
    try {
      const res = await authFetch(`/api/v1/resources/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      const res = await authFetch(`/api/v1/billing/challan/verify/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        loadChallans();
        setActiveReceiptUrl(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchStudents = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await authFetch(`/api/v1/auth/students?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setInvoiceMsg({ type: '', text: '' });
    try {
      const res = await authFetch('/api/v1/billing/challan/generate-by-clerk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          amount: Number(invoiceAmount),
          planName: invoicePlan,
          details: invoiceDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        setInvoiceMsg({ type: 'success', text: `Voucher successfully generated for ${selectedStudent.name}.` });
        setSelectedStudent(null);
        setInvoiceDetails('');
        setSearchQuery('');
        setStudents([]);
        loadChallans();
      } else {
        setInvoiceMsg({ type: 'error', text: data.message || 'Failed to generate invoice.' });
      }
    } catch (err) {
      console.error(err);
      setInvoiceMsg({ type: 'error', text: 'Server error generating challan.' });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
      
      {/* Left Column: Student Lookup & Desk Invoicing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Search Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Search Student Accounts</h3>
          <form onSubmit={handleSearchStudents} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 15px', display: 'flex', alignItems: 'center' }}>
              <Search size={18} />
            </button>
          </form>

          {students.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {students.map(std => (
                <div key={std._id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{std.name}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{std.email}</span>
                    <span style={{ display: 'inline-block', fontSize: '10px', color: std.isPaid ? 'var(--success)' : 'var(--warning)', fontWeight: 'bold', marginTop: '4px' }}>
                      {std.isPaid ? 'Paid Membership' : 'Unpaid Plan'}
                    </span>
                  </div>
                  {!std.isPaid ? (
                    <button
                      onClick={() => {
                        setSelectedStudent(std);
                        setInvoiceMsg({ type: '', text: '' });
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      Invoice
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--success)' }}>✓ Enrolled</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Invoice Generator Form */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ fontSize: '15px', color: 'var(--accent)', margin: 0 }}>Desk Invoice Generator</h4>
          
          {invoiceMsg.text && (
            <p style={{
              fontSize: '13px',
              color: invoiceMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              background: invoiceMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '8px',
              borderRadius: '6px',
              margin: 0
            }}>
              {invoiceMsg.text}
            </p>
          )}

          <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Selected Student</label>
              {selectedStudent ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px dashed var(--accent)'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>{selectedStudent.name}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedStudent.email}</span>
                  </div>
                  <button type="button" className="btn-secondary" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={() => setSelectedStudent(null)}>Clear</button>
                </div>
              ) : (
                <select
                  className="form-input"
                  required
                  value=""
                  onChange={(e) => {
                    const std = students.find(s => s._id === e.target.value);
                    if (std) setSelectedStudent(std);
                  }}
                >
                  <option value="">-- Choose student or search above --</option>
                  {students.filter(s => !s.isPaid).map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Amount (RS.)</label>
              <input
                type="number"
                className="form-input"
                required
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Plan Category</label>
              <select className="form-input" value={invoicePlan} onChange={(e) => setInvoicePlan(e.target.value)}>
                <option value="mdcat/ecat">MDCAT / ECAT Prep (RS. 5,000)</option>
                <option value="coaching">Matric / Inter Coaching (RS. 4,000)</option>
                <option value="custom">Custom Billing Plan</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Voucher Details / Description</label>
              <textarea
                className="form-input"
                style={{ minHeight: '60px' }}
                placeholder="e.g. Special MDCAT entry test assessment fee..."
                value={invoiceDetails}
                onChange={(e) => setInvoiceDetails(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '13px', padding: '10px 0' }}>
              Issue Voucher Challan
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Tabbed Workspace */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
          <button
            onClick={() => setRightTab('payments')}
            className={rightTab === 'payments' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Payment Verification Queue ({challans.filter(c => c.status === 'uploaded').length})
          </button>
          <button
            onClick={() => setRightTab('reviews')}
            className={rightTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Manage Success Stories
          </button>
        </div>

        {rightTab === 'payments' ? (
          <div>
            <h3>Student Payment Verification Audit Queue</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
              Inspect transaction proof screenshots, verify incoming ledger entries, and approve/reject voucher enrollment.
            </p>

            {challans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>No billing vouchers generated yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      <th style={{ padding: '12px' }}>Challan No</th>
                      <th style={{ padding: '12px' }}>Student</th>
                      <th style={{ padding: '12px' }}>Plan</th>
                      <th style={{ padding: '12px' }}>Amount</th>
                      <th style={{ padding: '12px' }}>Tx ID</th>
                      <th style={{ padding: '12px' }}>Slip</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13px' }}>
                    {challans.map((c) => (
                      <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{c.challanNumber}</td>
                        <td style={{ padding: '12px' }}>
                          {c.studentId ? `${c.studentId.name} (${c.studentId.email})` : 'Removed Student'}
                        </td>
                        <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold' }}>{c.planName || 'mdcat/ecat'}</td>
                        <td style={{ padding: '12px' }}>RS. {c.amount}</td>
                        <td style={{ padding: '12px' }}>{c.transactionId || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          {c.status === 'uploaded' ? (
                            <ReceiptThumbnail
                              challanId={c._id}
                              authFetch={authFetch}
                              onClick={(url) => setActiveReceiptUrl({ url, id: c._id })}
                            />
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontWeight: 'bold',
                            color: c.status === 'verified' ? 'var(--success)' : (c.status === 'rejected' ? 'var(--danger)' : 'var(--warning)')
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {c.status === 'uploaded' && (
                              <button
                                onClick={async () => {
                                  const res = await authFetch(`/api/v1/billing/receipt/${c._id}`);
                                  const blob = await res.blob();
                                  const url = URL.createObjectURL(blob);
                                  setActiveReceiptUrl({ url, id: c._id });
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                View proof
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const printWindow = window.open('', '_blank');
                                const studentName = c.studentId ? c.studentId.name : 'N/A';
                                const studentEmail = c.studentId ? c.studentId.email : 'N/A';
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>SEA Challan Slip - ${c.challanNumber}</title>
                                      <style>
                                        body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; }
                                        .challan-container { border: 2px dashed #000; padding: 20px; max-width: 600px; margin: 0 auto; }
                                        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                                        .logo-txt { font-size: 24px; font-weight: bold; }
                                        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                                        .footer { text-align: center; margin-top: 30px; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="challan-container">
                                        <div class="header">
                                          <div class="logo-txt">SINDH EDUCATIONAL ACADEMY</div>
                                          <div>Ghotki, Sindh - Fee Challan Voucher</div>
                                        </div>
                                        <div class="meta-grid">
                                          <div><strong>Challan No:</strong> ${c.challanNumber}</div>
                                          <div><strong>Date:</strong> ${new Date(c.createdAt).toLocaleDateString()}</div>
                                          <div><strong>Student Name:</strong> ${studentName}</div>
                                          <div><strong>Email:</strong> ${studentEmail}</div>
                                          <div><strong>Plan Category:</strong> ${c.planName ? c.planName.toUpperCase() : 'MDCAT/ECAT'}</div>
                                          <div><strong>Amount Due:</strong> RS. ${c.amount}</div>
                                          <div><strong>Status:</strong> ${c.status.toUpperCase()}</div>
                                        </div>
                                        <div style="margin: 20px 0; font-size: 14px;">
                                          <strong>Description/Details:</strong>
                                          <p>${c.details || 'Sindh Academy general entrance preparatory portal fee.'}</p>
                                        </div>
                                        <div class="footer">
                                          <p>This is a computer generated billing slip verification copy.</p>
                                          <p>Sindh Educational Academy Portal Support Desk</p>
                                        </div>
                                      </div>
                                      <script>
                                        window.onload = function() {
                                          window.print();
                                          window.onafterprint = function() { window.close(); };
                                        }
                                      </script>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                            >
                              Print Slip
                            </button>
                            {c.status === 'verified' && (
                              <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'bold' }}>✓ Verified</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3>Manage Student Success Stories</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
              Add or remove student success reviews displayed dynamically on the public landing page.
            </p>

            {revMsg && (
              <p style={{
                fontSize: '13px',
                color: 'var(--success)',
                background: 'rgba(16,185,129,0.1)',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                {revMsg}
              </p>
            )}

            <form onSubmit={handleAddReview} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px' }}>Student Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g.Khan"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px' }}>Achievement Badge</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Secured admission at GCU Lahore"
                  value={revAchievement}
                  onChange={(e) => setRevAchievement(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px' }}>Review / Story description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '60px' }}
                  required
                  placeholder="Write a brief review on how Sindh Educational Academy helped this student secure admission..."
                  value={revText}
                  onChange={(e) => setRevText(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Select Student Profile Color Badge</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {['student1', 'student2', 'student3', 'student4', 'student5'].map((av) => {
                    const colors = { student1: '#3b82f6', student2: '#10b981', student3: '#8b5cf6', student4: '#f59e0b', student5: '#ec4899' };
                    const isActive = revAvatar === av;
                    return (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setRevAvatar(av)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: colors[av],
                          border: isActive ? '3px solid #fff' : '2px solid transparent',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      />
                    );
                  })}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avatar theme: {revAvatar}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '10px 0', fontSize: '13px' }}>
                Publish Success Story
              </button>
            </form>

            <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h4>Active success reviews ({reviews.length})</h4>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>No success reviews added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.studentName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--accent)', marginLeft: '10px' }}>({r.achievement})</span>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reviewText}</p>
                      </div>
                      <button className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '4px 8px', fontSize: '11px' }} onClick={() => handleDeleteReview(r._id)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pop up Receipt Viewer Box */}
      {activeReceiptUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            background: 'var(--bg-card)',
            padding: '30px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveReceiptUrl(null)}
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
              <h3 style={{ fontSize: '20px' }}>Receipt Transaction Proof</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Audit the submitted slip voucher to verify authenticity.</p>
            </div>
            
            <div style={{ width: '100%', maxHeight: '450px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', padding: '10px' }}>
              <img src={activeReceiptUrl.url} alt="receipt proof" style={{ maxWidth: '100%', maxHeight: '430px', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => {
                  handleVerify(activeReceiptUrl.id, 'rejected');
                  setActiveReceiptUrl(null);
                }}
                className="btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '10px 20px', cursor: 'pointer' }}
              >
                Reject Payment
              </button>
              <button
                onClick={() => {
                  handleVerify(activeReceiptUrl.id, 'verified');
                  setActiveReceiptUrl(null);
                }}
                className="btn-primary"
                style={{ background: 'var(--success)', padding: '10px 20px', cursor: 'pointer' }}
              >
                Approve & Enroll Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   3. TEACHER DASHBOARD (MCQ / Exam Publisher Creator)
   ========================================================================== */
const TeacherDashboard = ({ authFetch }) => {
  const [tab, setTab] = useState('mcq');
  
  // MCQ creator state
  const [qText, setQText] = useState('');
  const [opts, setOpts] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [subject, setSubject] = useState('Biology');
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [msg, setMsg] = useState('');

  // Exam creator state
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [examDuration, setExamDuration] = useState(150);
  const [isDemoExam, setIsDemoExam] = useState(false);
  const [isMonthlyExam, setIsMonthlyExam] = useState(false);
  const [windowOpen, setWindowOpen] = useState('');
  const [windowClose, setWindowClose] = useState('');
  const [negativeMarking, setNegativeMarking] = useState(false);

  // NEW EXAM MAKER STATE FOR QUESTIONS SELECTION
  const [examSubject, setExamSubject] = useState('Biology');
  const [questionSource, setQuestionSource] = useState('random'); // 'random', 'manual', 'file'
  const [randomCount, setRandomCount] = useState(30);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [examFile, setExamFile] = useState(null);
  const [manualSearch, setManualSearch] = useState('');
  const [manualSubjectFilter, setManualSubjectFilter] = useState('all');
  const [isError, setIsError] = useState(false);

  // Document uploader state
  const [docFile, setDocFile] = useState(null);
  const [docSubject, setDocSubject] = useState('Biology');
  const [docTopic, setDocTopic] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examsList, setExamsList] = useState([]);

  // Lecture publisher state
  const [lectTitle, setLectTitle] = useState('');
  const [lectDesc, setLectDesc] = useState('');
  const [lectDriveId, setLectDriveId] = useState('');
  const [lectSubject, setLectSubject] = useState('Biology');
  const [lectTopic, setLectTopic] = useState('');
  const [lectIsDemo, setLectIsDemo] = useState(false);

  // Content list states
  const [lectures, setLectures] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qSearchQuery, setQSearchQuery] = useState('');

  const loadLectures = async () => {
    try {
      const res = await authFetch('/api/v1/resources/lectures');
      const data = await res.json();
      if (data.success) setLectures(data.lectures);
    } catch (e) { console.error(e); }
  };

  const loadExams = async () => {
    try {
      const res = await authFetch('/api/v1/exams');
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
        setExamsList(data.exams);
      }
    } catch (e) { console.error(e); }
  };

  const loadQuestions = async (searchVal = '') => {
    try {
      const res = await authFetch(`/api/v1/exams/questions?q=${encodeURIComponent(searchVal)}`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    } catch (e) { console.error(e); }
  };

  const handleDeleteLecture = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res = await authFetch(`/api/v1/resources/lectures/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg('Lecture deleted successfully.');
        loadLectures();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      const res = await authFetch(`/api/v1/exams/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg('Exam deleted successfully.');
        loadExams();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await authFetch(`/api/v1/exams/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg('Question deleted successfully.');
        loadQuestions(qSearchQuery);
      }
    } catch (e) { console.error(e); }
  };

  // Editing and Preview States
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editLectTitle, setEditLectTitle] = useState('');
  const [editLectDesc, setEditLectDesc] = useState('');
  const [editLectDriveId, setEditLectDriveId] = useState('');
  const [editLectSubject, setEditLectSubject] = useState('Biology');
  const [editLectTopic, setEditLectTopic] = useState('');
  const [editLectIsDemo, setEditLectIsDemo] = useState(false);

  const [editingExamId, setEditingExamId] = useState(null);
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamDesc, setEditExamDesc] = useState('');
  const [editExamDuration, setEditExamDuration] = useState(150);
  const [editExamIsDemo, setEditExamIsDemo] = useState(false);
  const [editExamIsMonthly, setEditExamIsMonthly] = useState(false);
  const [editExamWindowOpen, setEditExamWindowOpen] = useState('');
  const [editExamWindowClose, setEditExamWindowClose] = useState('');
  const [editExamNegativeMarking, setEditExamNegativeMarking] = useState(false);

  const [activePreviewLecture, setActivePreviewLecture] = useState(null);

  const handleUpdateLecture = async (id) => {
    try {
      const res = await authFetch(`/api/v1/resources/lectures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editLectTitle,
          description: editLectDesc,
          googleDriveFileId: editLectDriveId,
          subject: editLectSubject,
          topic: editLectTopic,
          isDemo: editLectIsDemo
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Lecture details updated successfully.');
        setEditingLectureId(null);
        loadLectures();
      } else {
        setMsg(`Failed to update lecture: ${data.message}`);
      }
    } catch (e) {
      console.error(e);
      setMsg('Error updating lecture.');
    }
  };

  const handleUpdateExam = async (id) => {
    try {
      const res = await authFetch(`/api/v1/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editExamTitle,
          subject: editExamDesc,
          durationMinutes: editExamDuration,
          isDemo: editExamIsDemo,
          isMonthly: editExamIsMonthly,
          windowOpen: editExamWindowOpen ? new Date(editExamWindowOpen).toISOString() : undefined,
          windowClose: editExamWindowClose ? new Date(editExamWindowClose).toISOString() : undefined,
          negativeMarking: editExamNegativeMarking
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Exam settings updated successfully.');
        setEditingExamId(null);
        loadExams();
      } else {
        setMsg(`Failed to update exam: ${data.message}`);
      }
    } catch (e) {
      console.error(e);
      setMsg('Error updating exam.');
    }
  };


  useEffect(() => {
    loadLectures();
    loadExams();
    loadQuestions();
  }, [msg]);

  const handleCreateMCQ = async (e) => {
    e.preventDefault();
    setMsg('');

    const letterKeys = ['A', 'B', 'C', 'D'];
    const correctLetter = letterKeys[correctIdx];

    try {
      const res = await authFetch('/api/v1/exams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Direct Question Import',
          questionsData: [{
            questionText: qText,
            options: opts,
            correctOption: correctLetter,
            subject,
            topic,
            explanation
          }]
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg('MCQ Question successfully added to database bank!');
        // Clear fields
        setQText('');
        setOpts(['', '', '', '']);
        setTopic('');
        setExplanation('');
      }
    } catch (err) {
      console.error(err);
      setMsg('Error adding question.');
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);

    try {
      const examPayload = {
        title: examTitle,
        subject: examSubject,
        durationMinutes: examDuration,
        isDemo: isDemoExam,
        isMonthly: isMonthlyExam,
        windowOpen: windowOpen ? new Date(windowOpen).toISOString() : new Date(),
        windowClose: windowClose ? new Date(windowClose).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000),
        negativeMarking
      };

      if (questionSource === 'random') {
        examPayload.randomCount = randomCount;
      } else if (questionSource === 'manual') {
        if (selectedQuestionIds.length === 0) {
          setIsError(true);
          setMsg('Please select at least one question for the exam.');
          return;
        }
        examPayload.questions = selectedQuestionIds;
      }

      const res = await authFetch('/api/v1/exams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examPayload)
      });
      const data = await res.json();

      if (!data.success) {
        setIsError(true);
        setMsg(`Publishing failed: ${data.message}`);
        return;
      }

      if (questionSource === 'file') {
        if (!examFile) {
          setIsError(true);
          setMsg('Please select a .docx file to import questions from.');
          return;
        }

        const formData = new FormData();
        formData.append('document', examFile);
        formData.append('subject', examSubject);
        formData.append('topic', 'General Import');
        formData.append('examId', data.exam._id);

        const uploadRes = await authFetch('/api/v1/exams/upload-test-doc', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          await authFetch(`/api/v1/exams/${data.exam._id}`, { method: 'DELETE' });
          setIsError(true);
          setMsg(`Failed to import questions from file: ${uploadData.message}`);
          return;
        }

        setMsg(`Exam mock "${data.exam.title}" successfully created with ${uploadData.totalParsed} questions parsed from Word document.`);
      } else {
        const qCount = questionSource === 'random' ? randomCount : selectedQuestionIds.length;
        setMsg(`Exam mock "${data.exam.title}" successfully published with ${qCount} questions.`);
      }

      setExamTitle('');
      setExamDuration(150);
      setIsDemoExam(false);
      setIsMonthlyExam(false);
      setWindowOpen('');
      setWindowClose('');
      setNegativeMarking(false);
      setRandomCount(30);
      setSelectedQuestionIds([]);
      setExamFile(null);

      const fileInput = document.getElementById('exam-docx-file');
      if (fileInput) fileInput.value = '';

      loadExams();
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMsg('Error publishing exam mock.');
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docFile) return;
    setMsg('');

    const formData = new FormData();
    formData.append('document', docFile);
    formData.append('subject', docSubject);
    formData.append('topic', docTopic);
    if (selectedExamId) {
      formData.append('examId', selectedExamId);
    }

    try {
      const res = await authFetch('/api/v1/exams/upload-test-doc', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Success! Parsed and added ${data.totalParsed} questions from Word file.`);
        setDocFile(null);
        setDocTopic('');
        setSelectedExamId('');
        document.getElementById('docx-file-input').value = '';
      } else {
        setMsg(`Upload failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMsg('Failed to parse Word document.');
    }
  };

  const handleCreateLecture = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const res = await authFetch('/api/v1/resources/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lectTitle,
          description: lectDesc,
          googleDriveFileId: lectDriveId,
          subject: lectSubject,
          topic: lectTopic,
          isDemo: lectIsDemo
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Lecture video lesson "${data.lecture.title}" successfully published.`);
        setLectTitle('');
        setLectDesc('');
        setLectDriveId('');
        setLectTopic('');
        setLectIsDemo(false);
      } else {
        setMsg(`Failed to publish: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMsg('Failed to publish lecture video resource.');
    }
  };

  const questionsToSelect = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(manualSearch.toLowerCase());
    const matchesSubject = manualSubjectFilter === 'all' || q.subject === manualSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="glass-panel" style={{ padding: '30px' }}>
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('mcq')} className={tab === 'mcq' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Create MCQ Question
        </button>
        <button onClick={() => setTab('exam')} className={tab === 'exam' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Publish Mock Exam
        </button>
        <button onClick={() => setTab('docx')} className={tab === 'docx' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Word Document Parser (.docx)
        </button>
        <button onClick={() => setTab('lecture')} className={tab === 'lecture' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Publish Video Lecture
        </button>
        <button onClick={() => setTab('list-lectures')} className={tab === 'list-lectures' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
          Manage Lectures ({lectures.length})
        </button>
        <button onClick={() => setTab('list-exams')} className={tab === 'list-exams' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
          Manage Exams ({exams.length})
        </button>
        <button onClick={() => setTab('list-mcqs')} className={tab === 'list-mcqs' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
          Manage MCQ Bank ({questions.length})
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
          {msg}
        </div>
      )}

      {tab === 'mcq' && (
        <form onSubmit={handleCreateMCQ} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
          <div className="form-group">
            <label>Question Prompt / Text</label>
            <input type="text" className="form-input" required placeholder="Enter entry test question prompt" value={qText} onChange={(e) => setQText(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Subject</label>
              <select className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            </div>
            <div className="form-group">
              <label>Topic / Chapter</label>
              <input type="text" className="form-input" required placeholder="e.g. Cell Structure, Thermodynamics" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Answer Options</label>
            {opts.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="correctIdx"
                  checked={correctIdx === idx}
                  onChange={() => setCorrectIdx(idx)}
                />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...opts];
                    newOpts[idx] = e.target.value;
                    setOpts(newOpts);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Explanation / Logical Solution</label>
            <textarea className="form-input" style={{ minHeight: '80px' }} placeholder="Provide step-by-step reasoning breakdown" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Add Question to Bank
          </button>
        </form>
      )}

      {tab === 'exam' && (
        <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
          {msg && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: isError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              color: isError ? 'var(--danger)' : 'var(--success)',
              fontSize: '13px'
            }}>
              {msg}
            </div>
          )}

          <div className="form-group">
            <label>Exam Package Title</label>
            <input type="text" required className="form-input" placeholder="e.g. MDCAT Monthly Assessment Phase 1" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Duration Limit (Minutes)</label>
              <input type="number" required className="form-input" value={examDuration} onChange={(e) => setExamDuration(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Exam Subject Category</label>
              <select className="form-input" value={examSubject} onChange={(e) => setExamSubject(e.target.value)}>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="Full Syllabus">Full Syllabus / Combined</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Scheduled Window Open</label>
              <input type="datetime-local" className="form-input" value={windowOpen} onChange={(e) => setWindowOpen(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Scheduled Window Close</label>
              <input type="datetime-local" className="form-input" value={windowClose} onChange={(e) => setWindowClose(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', margin: '5px 0', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={isDemoExam} onChange={(e) => setIsDemoExam(e.target.checked)} />
              <span>Demo / Free Exam (No Voucher Required)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={isMonthlyExam} onChange={(e) => setIsMonthlyExam(e.target.checked)} />
              <span>Monthly Scheduled Exam</span>
            </label>
          </div>

          <div style={{ margin: '5px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--warning)', fontWeight: 600, fontSize: '13px' }}>
              <input type="checkbox" checked={negativeMarking} onChange={(e) => setNegativeMarking(e.target.checked)} />
              <span>Enable ECAT Negative Marking (+4 Correct, -1 Incorrect)</span>
            </label>
          </div>

          {/* Question Selection Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <label style={{ fontWeight: 600, display: 'block', fontSize: '14px' }}>Question Selection Source</label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="radio" name="qSource" checked={questionSource === 'random'} onChange={() => setQuestionSource('random')} />
                <span>Random Selection from Bank</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="radio" name="qSource" checked={questionSource === 'manual'} onChange={() => setQuestionSource('manual')} />
                <span>Select Specific MCQs Manually</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="radio" name="qSource" checked={questionSource === 'file'} onChange={() => setQuestionSource('file')} />
                <span>Parse Questions from Word File (.docx)</span>
              </label>
            </div>

            {/* A. Random MCQs input */}
            {questionSource === 'random' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px' }}>How many random questions to fetch?</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="200"
                  required
                  value={randomCount}
                  onChange={(e) => setRandomCount(Number(e.target.value))}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  Loads {randomCount} random {examSubject} questions from the existing question bank.
                </small>
              </div>
            )}

            {/* B. Manual checklist grid */}
            {questionSource === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search question text..."
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  />
                  <select
                    className="form-input"
                    value={manualSubjectFilter}
                    onChange={(e) => setManualSubjectFilter(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <option value="all">All Subjects</option>
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.15)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {questionsToSelect.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontStyle: 'italic', margin: '10px 0', textAlign: 'center' }}>
                      No matching questions found in bank.
                    </p>
                  ) : (
                    questionsToSelect.map(q => {
                      const isSelected = selectedQuestionIds.includes(q._id);
                      return (
                        <label key={q._id} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          background: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            style={{ marginTop: '2px' }}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedQuestionIds(prev => prev.filter(id => id !== q._id));
                              } else {
                                setSelectedQuestionIds(prev => [...prev, q._id]);
                              }
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 600, color: 'var(--accent)', marginRight: '6px' }}>[{q.subject}]</span>
                            <span style={{ color: 'var(--text-primary)' }}>{q.questionText}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>Showing {questionsToSelect.length} questions</span>
                  <strong style={{ color: 'var(--accent)' }}>{selectedQuestionIds.length} Selected</strong>
                </div>
              </div>
            )}

            {/* C. Direct docx upload dropzone */}
            {questionSource === 'file' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.01)',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <Upload size={24} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {examFile ? examFile.name : 'Select or drag Word Document (.docx)'}
                  </p>
                  <input
                    id="exam-docx-file"
                    type="file"
                    required
                    accept=".docx"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                    onChange={(e) => setExamFile(e.target.files[0])}
                  />
                </div>
                <small style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                  The questions from the file will be parsed and linked directly to this new exam package.
                </small>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Publish Mock Exam
          </button>
        </form>
      )}

      {tab === 'docx' && (
        <form onSubmit={handleUploadDoc} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '15px', borderRadius: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Word Document Format Template Instructions:</strong>
            <p style={{ marginTop: '8px' }}>Use the standardized delimiters. Example structure:</p>
            <pre style={{ marginTop: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', overflowX: 'auto', fontSize: '11px' }}>
{`Q1: What is the powerhouse of the cell?
A) Ribosome
B) Mitochondria
C) Nucleus
D) Lysosome
Answer: B
Explanation: Mitochondria generate ATP.
===
Q2: Next question prompt...`}
            </pre>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Subject</label>
              <select className="form-input" value={docSubject} onChange={(e) => setDocSubject(e.target.value)}>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            </div>
            <div className="form-group">
              <label>Topic / Chapter</label>
              <input type="text" className="form-input" required placeholder="e.g. Mitochondria, Force" value={docTopic} onChange={(e) => setDocTopic(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Link Directly to Exam (Optional)</label>
            <select className="form-input" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
              <option value="">-- Do Not Link (Just Add to Question Bank) --</option>
              {examsList.map((ex) => (
                <option key={ex._id} value={ex._id}>{ex.title} ({ex.subject})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Microsoft Word File (.docx)</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              padding: '25px',
              borderRadius: '12px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <Upload size={32} style={{ color: 'var(--accent)', marginBottom: '10px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                {docFile ? docFile.name : 'Click to browse or drop Word Document here'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Only .docx format is supported
              </p>
              <input
                id="docx-file-input"
                type="file"
                required
                accept=".docx"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                onChange={(e) => setDocFile(e.target.files[0])}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Upload & Parse Word File
          </button>
        </form>
      )}

      {tab === 'lecture' && (
        <form onSubmit={handleCreateLecture} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
          <div className="form-group">
            <label>Lecture Title</label>
            <input type="text" className="form-input" required placeholder="e.g. Thermodynamics and Laws of Energy" value={lectTitle} onChange={(e) => setLectTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description / Details</label>
            <textarea className="form-input" style={{ minHeight: '80px' }} required placeholder="Describe what is covered in this video lesson..." value={lectDesc} onChange={(e) => setLectDesc(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Subject</label>
              <select className="form-input" value={lectSubject} onChange={(e) => setLectSubject(e.target.value)}>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            </div>
            <div className="form-group">
              <label>Topic / Chapter</label>
              <input type="text" className="form-input" required placeholder="e.g. Energy Conservation" value={lectTopic} onChange={(e) => setLectTopic(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Google Drive File ID / Video Filename</label>
            <input type="text" className="form-input" required placeholder="Enter Google Drive ID (e.g. 1A2B3C...) or local filename" value={lectDriveId} onChange={(e) => setLectDriveId(e.target.value)} />
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              For local testing, place a video file named `[FILE_ID].mp4` inside the server's `uploads/lectures/` directory.
            </small>
          </div>

          <div style={{ margin: '10px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={lectIsDemo} onChange={(e) => setLectIsDemo(e.target.checked)} />
              <span>Demo Video (Allow guest users to stream this video for free)</span>
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Publish Video Lecture
          </button>
        </form>
      )}

      {tab === 'list-lectures' && (
        <div>
          <h3>Uploaded Video & PDF Lectures Catalog</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
            Browse, inspect details, and edit/view/remove active lecture or study material assets.
          </p>
          {lectures.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No lectures found in database.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {lectures.map((l) => {
                const getLectType = (url) => {
                  if (!url) return 'video';
                  if (url.includes('drive.google.com/file') || url.includes('/file/d/') || url.includes('pdf') || url.includes('drive.google.com/open') || url.includes('/view')) return 'pdf';
                  if (url.includes('youtube.com') || url.includes('youtu.be') || url.length === 11) return 'youtube';
                  return 'stream';
                };

                if (editingLectureId === l._id) {
                  return (
                    <div key={l._id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.05)' }}>
                      <h4 style={{ color: 'var(--accent)' }}>Edit Lecture Asset</h4>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Title</label>
                        <input type="text" className="form-input" value={editLectTitle} onChange={(e) => setEditLectTitle(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Description</label>
                        <textarea className="form-input" style={{ minHeight: '60px' }} value={editLectDesc} onChange={(e) => setEditLectDesc(e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '12px' }}>Subject</label>
                          <select className="form-input" value={editLectSubject} onChange={(e) => setEditLectSubject(e.target.value)}>
                            <option value="Biology">Biology</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="English">English</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '12px' }}>Topic / Chapter</label>
                          <input type="text" className="form-input" value={editLectTopic} onChange={(e) => setEditLectTopic(e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Google Drive URL / YouTube ID</label>
                        <input type="text" className="form-input" value={editLectDriveId} onChange={(e) => setEditLectDriveId(e.target.value)} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="checkbox" checked={editLectIsDemo} onChange={(e) => setEditLectIsDemo(e.target.checked)} />
                        <span>Demo / Free Lecture</span>
                      </label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={() => handleUpdateLecture(l._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Save Changes</button>
                        <button onClick={() => setEditingLectureId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Cancel</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={l._id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{l.title} {!l.isDemo && '🔒'}</h4>
                      <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{l.description}</p>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {l.subject} • {l.topic} • {l.isDemo ? 'Demo (Free)' : 'Premium Enrolled Only'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const type = getLectType(l.googleDriveFileId);
                          if (type === 'pdf') {
                            window.open(l.googleDriveFileId, '_blank');
                          } else {
                            setActivePreviewLecture(l);
                          }
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                      >
                        {getLectType(l.googleDriveFileId) === 'pdf' ? 'View PDF' : 'Watch'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingLectureId(l._id);
                          setEditLectTitle(l.title);
                          setEditLectDesc(l.description || '');
                          setEditLectDriveId(l.googleDriveFileId);
                          setEditLectSubject(l.subject);
                          setEditLectTopic(l.topic);
                          setEditLectIsDemo(l.isDemo);
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLecture(l._id)}
                        className="btn-secondary"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'list-exams' && (
        <div>
          <h3>Published Evaluation Mock Exams Catalog</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
            Manage exam windows, negative marking configurations, and edit/view/withdraw mock tests.
          </p>
          {exams.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No mock exams found in database.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {exams.map((ex) => {
                if (editingExamId === ex._id) {
                  return (
                    <div key={ex._id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.05)' }}>
                      <h4 style={{ color: 'var(--accent)' }}>Edit Exam Mock Settings</h4>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Title</label>
                        <input type="text" className="form-input" value={editExamTitle} onChange={(e) => setEditExamTitle(e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '12px' }}>Duration (Minutes)</label>
                          <input type="number" className="form-input" value={editExamDuration} onChange={(e) => setEditExamDuration(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '12px' }}>Subject Label</label>
                          <input type="text" className="form-input" value={editExamDesc} onChange={(e) => setEditExamDesc(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '12px' }}>Window Open</label>
                          <input type="datetime-local" className="form-input" value={editExamWindowOpen} onChange={(e) => setEditExamWindowOpen(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '12px' }}>Window Close</label>
                          <input type="datetime-local" className="form-input" value={editExamWindowClose} onChange={(e) => setEditExamWindowClose(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={editExamIsDemo} onChange={(e) => setEditExamIsDemo(e.target.checked)} />
                          <span>Demo / Free Exam</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={editExamIsMonthly} onChange={(e) => setEditExamIsMonthly(e.target.checked)} />
                          <span>Monthly Scheduled</span>
                        </label>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--warning)', fontWeight: 600, fontSize: '13px' }}>
                        <input type="checkbox" checked={editExamNegativeMarking} onChange={(e) => setEditExamNegativeMarking(e.target.checked)} />
                        <span>ECAT Negative Marking (+4, -1)</span>
                      </label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={() => handleUpdateExam(ex._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Save Changes</button>
                        <button onClick={() => setEditingExamId(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Cancel</button>
                      </div>
                    </div>
                  );
                }

                const formatLocalDate = (isoString) => {
                  if (!isoString) return '';
                  const d = new Date(isoString);
                  const pad = (n) => n.toString().padStart(2, '0');
                  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

                return (
                  <div key={ex._id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{ex.title} {!ex.isDemo && '🔒'}</h4>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Subject: {ex.subject} • Duration: {ex.durationMinutes || ex.duration} Mins • Questions count: {ex.questions?.length || 0}
                      </p>
                      {ex.externalDocLink && (
                        <span style={{ fontSize: '11px', color: 'var(--accent)', display: 'block', marginTop: '4px' }}>
                          Linked Doc: {ex.externalDocLink}
                        </span>
                      )}
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Window: {new Date(ex.windowOpen).toLocaleString()} - {new Date(ex.windowClose).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {ex.externalDocLink ? (
                        <a
                          href={ex.externalDocLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                        >
                          View Doc
                        </a>
                      ) : (
                        <Link
                          to={`/exam/${ex._id}`}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                        >
                          View Mock
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setEditingExamId(ex._id);
                          setEditExamTitle(ex.title);
                          setEditExamDesc(ex.subject || '');
                          setEditExamDuration(ex.durationMinutes || ex.duration || 150);
                          setEditExamIsDemo(ex.isDemo);
                          setEditExamIsMonthly(ex.isMonthly);
                          setEditExamWindowOpen(formatLocalDate(ex.windowOpen));
                          setEditExamWindowClose(formatLocalDate(ex.windowClose));
                          setEditExamNegativeMarking(ex.negativeMarking);
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExam(ex._id)}
                        className="btn-secondary"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'list-mcqs' && (
        <div>
          <h3>MCQ Question Bank Explorer</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
            View and delete questions stored in the global entry exam database.
          </p>

          <form onSubmit={(evt) => { evt.preventDefault(); loadQuestions(qSearchQuery); }} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search questions by keyword..."
              value={qSearchQuery}
              onChange={(e) => setQSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 20px' }}>Search</button>
          </form>

          {questions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No matching questions found in bank.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
              {questions.map((q) => (
                <div key={q._id} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '15px',
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: '14px' }}>{q.questionText}</p>
                      <ul style={{ listStyleType: 'circle', paddingLeft: '20px', margin: '8px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {q.options.map((opt, i) => (
                          <li key={i} style={{ fontWeight: String.fromCharCode(65 + i) === q.correctOption ? 'bold' : 'normal', color: String.fromCharCode(65 + i) === q.correctOption ? 'var(--success)' : '' }}>
                            {String.fromCharCode(65 + i)}) {opt} {String.fromCharCode(65 + i) === q.correctOption && '✓'}
                          </li>
                        ))}
                      </ul>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {q.subject} • {q.topic}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="btn-secondary"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '4px 8px', fontSize: '11px', marginLeft: '10px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video stream preview modal */}
      {activePreviewLecture && (
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
          <div className="glass-panel" style={{
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
              onClick={() => setActivePreviewLecture(null)}
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
              <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-heading)' }}>{activePreviewLecture.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{activePreviewLecture.subject} • {activePreviewLecture.topic}</p>
            </div>
            
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              {(() => {
                const url = activePreviewLecture.googleDriveFileId || '';
                const isYouTube = url.includes('youtube.com') || url.includes('youtu.be') || url.length === 11;
                
                if (isYouTube) {
                  let videoId = url;
                  if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                  } else if (url.includes('youtube.com/watch')) {
                    const parts = url.split('?')[1] || '';
                    const params = new URLSearchParams(parts);
                    videoId = params.get('v') || url;
                  } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('youtube.com/embed/')[1].split('?')[0];
                  }
                  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  return (
                    <iframe
                      width="100%"
                      height="100%"
                      src={embedUrl}
                      title={activePreviewLecture.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  );
                } else {
                  return (
                    <video
                      src={`/api/v1/resources/stream/${activePreviewLecture._id}`}
                      controls
                      style={{ width: '100%', height: '100%' }}
                    />
                  );
                }
              })()}
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{activePreviewLecture.description}</p>
          </div>
        </div>
      )}

    </div>
  );
};

/* ==========================================================================
   4. ADMIN DASHBOARD (Audit logs and User CRUD)
   ========================================================================== */
const AdminDashboard = ({ authFetch }) => {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [msg, setMsg] = useState('');
  
  // User edit state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editIsVerified, setEditIsVerified] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState([]);
  const [revName, setRevName] = useState('');
  const [revAchievement, setRevAchievement] = useState('');
  const [revText, setRevText] = useState('');
  const [revAvatar, setRevAvatar] = useState('student1');
  const [revMsg, setRevMsg] = useState('');

  // Logs operator role filter state
  const [operatorFilter, setOperatorFilter] = useState('all');

  const loadAllAdminData = async () => {
    try {
      const statsRes = await authFetch('/api/v1/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const usersRes = await authFetch('/api/v1/admin/users');
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);

      const logsRes = await authFetch('/api/v1/admin/logs');
      const logsData = await logsRes.json();
      if (logsData.success) setLogs(logsData.logs);

      const analyticsRes = await authFetch('/api/v1/admin/analytics/grades');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) setAnalytics(analyticsData.analytics);

      const reviewsRes = await authFetch('/api/v1/resources/reviews');
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) setReviews(reviewsData.reviews);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    setRevMsg('');
    try {
      const res = await authFetch('/api/v1/resources/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: revName,
          achievement: revAchievement,
          reviewText: revText,
          avatarName: revAvatar
        })
      });
      const data = await res.json();
      if (data.success) {
        setRevMsg('Success story successfully published to home page!');
        setRevName('');
        setRevAchievement('');
        setRevText('');
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this success story?')) return;
    try {
      const res = await authFetch(`/api/v1/resources/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUser = async (id) => {
    try {
      const res = await authFetch(`/api/v1/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          isPaid: editIsPaid,
          isVerified: editIsVerified
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg('User details successfully updated.');
        setEditingUserId(null);
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user account?')) return;
    try {
      const res = await authFetch(`/api/v1/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg('User account permanently deleted.');
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Navigation sub-tabs */}
      <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('stats')} className={tab === 'stats' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Overview & Telemetry
        </button>
        <button onClick={() => setTab('users')} className={tab === 'users' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          User Accounts CRUD
        </button>
        <button onClick={() => setTab('analytics')} className={tab === 'analytics' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Mock Grade Analytics
        </button>
        <button onClick={() => setTab('logs')} className={tab === 'logs' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Audit Mutation Logs
        </button>
        <button onClick={() => setTab('reviews')} className={tab === 'reviews' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px' }}>
          Manage Success Stories
        </button>
        <button onClick={() => setTab('resources')} className={tab === 'resources' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent)' }}>
          Academic Content Hub (CRUD)
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '12px', borderRadius: '10px' }}>
          {msg}
        </div>
      )}

      {/* 1. OVERVIEW & TELEMETRY */}
      {tab === 'stats' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Total Students</span>
              <h2 style={{ fontSize: '36px', color: 'var(--accent)', marginTop: '10px' }}>{stats.totalStudents}</h2>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Verified Students</span>
              <h2 style={{ fontSize: '36px', color: 'var(--success)', marginTop: '10px' }}>{stats.verifiedStudents}</h2>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Paid Members</span>
              <h2 style={{ fontSize: '36px', color: '#10b981', marginTop: '10px' }}>{stats.paidStudents}</h2>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Faculty Teachers</span>
              <h2 style={{ fontSize: '36px', color: 'var(--text-primary)', marginTop: '10px' }}>{stats.totalTeachers}</h2>
            </div>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Audit Clerks</span>
              <h2 style={{ fontSize: '36px', color: 'var(--warning)', marginTop: '10px' }}>{stats.totalClerks}</h2>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3>Welcome to Administrative Command Center</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginTop: '10px' }}>
              From this panel, you hold top-level audit controls over Sindh Educational Academy. You can monitor live student registrations, inspect verified payouts, review student test diagnostics across subjects, and read through clerk mutation logs.
            </p>
          </div>
        </div>
      )}

      {/* 2. USER ACCOUNTS CRUD */}
      {tab === 'users' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3>System Accounts Catalog</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Modify authorization groups, grant premium plans manually, or terminate credentials.
          </p>

          <div style={{
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            <strong>💡 Administrative Note on Staff Roles Promotion:</strong>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)' }}>
              Staff accounts (Teachers and Clerks) cannot sign up directly. To create a new Teacher or Clerk account, instruct the user to sign up normally as a student first. Then, locate their account in the list below, click <strong>Edit</strong>, change their Role to <em>teacher</em> or <em>clerk</em>, and click <strong>Save</strong>.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>Name / Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Email Verified</th>
                <th style={{ padding: '12px' }}>Premium Enrolled</th>
                <th style={{ padding: '12px' }}>Streak</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px' }}>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontWeight: 600, display: 'block' }}>{u.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingUserId === u._id ? (
                      <select className="form-input" style={{ padding: '4px', fontSize: '12px' }} value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="clerk">clerk</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{u.role}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingUserId === u._id ? (
                      <input type="checkbox" checked={editIsVerified} onChange={(e) => setEditIsVerified(e.target.checked)} />
                    ) : (
                      <span style={{ color: u.isVerified ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingUserId === u._id ? (
                      <input type="checkbox" checked={editIsPaid} onChange={(e) => setEditIsPaid(e.target.checked)} />
                    ) : (
                      <span style={{ color: u.isPaid ? 'var(--success)' : 'var(--text-muted)' }}>
                        {u.isPaid ? 'Premium ✓' : 'Free Trial'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>{u.dailyStreak || 0} Days</td>
                  <td style={{ padding: '12px' }}>
                    {editingUserId === u._id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleUpdateUser(u._id)} className="btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Save
                        </button>
                        <button onClick={() => setEditingUserId(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => {
                          setEditingUserId(u._id);
                          setEditRole(u.role);
                          setEditIsPaid(u.isPaid);
                          setEditIsVerified(u.isVerified);
                        }} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. MOCK GRADE ANALYTICS */}
      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'start' }}>
          
          {/* SVG Telemetry Chart */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>Global Mock Exam Performance</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Visual indicators showing entry tests performance ratios (low, average, and high scores).
            </p>

            {analytics && analytics.globalStats.totalAttempts > 0 ? (
              <div>
                <svg viewBox="0 0 400 220" style={{ width: '100%', maxHeight: '220px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '15px' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.06)" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="rgba(255,255,255,0.06)" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.06)" />
                  <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.06)" />
                  
                  {/* Bars */}
                  {/* Low Score Bar */}
                  <rect x="70" y={170 - (analytics.globalStats.low * 1.3)} width="50" height={analytics.globalStats.low * 1.3} fill="url(#lowGrad)" rx="4" />
                  <text x="95" y={160 - (analytics.globalStats.low * 1.3)} fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="bold">{analytics.globalStats.low}%</text>
                  <text x="95" y="195" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">Low Score</text>

                  {/* Average Score Bar */}
                  <rect x="175" y={170 - (analytics.globalStats.avg * 1.3)} width="50" height={analytics.globalStats.avg * 1.3} fill="url(#avgGrad)" rx="4" />
                  <text x="200" y={160 - (analytics.globalStats.avg * 1.3)} fill="#3b82f6" fontSize="11" textAnchor="middle" fontWeight="bold">{analytics.globalStats.avg}%</text>
                  <text x="200" y="195" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">Avg Score</text>

                  {/* High Score Bar */}
                  <rect x="280" y={170 - (analytics.globalStats.high * 1.3)} width="50" height={analytics.globalStats.high * 1.3} fill="url(#highGrad)" rx="4" />
                  <text x="305" y={160 - (analytics.globalStats.high * 1.3)} fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">{analytics.globalStats.high}%</text>
                  <text x="305" y="195" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">High Score</text>

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                    <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#064e3b" />
                    </linearGradient>
                  </defs>
                </svg>

                <div style={{ marginTop: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Total Exam Attempts Logged:</span>
                  <strong>{analytics.globalStats.totalAttempts}</strong>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No exam completion analytics compiled yet.</p>
            )}
          </div>

          {/* Subject Wise Comparison table */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3>Subject Diagnostic Comparisons</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Overview of student average scores across specific core testing subjects.
            </p>

            {analytics && analytics.studentSubjectAverages.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <th style={{ padding: '10px 6px' }}>Student</th>
                    <th style={{ padding: '10px 6px' }}>Biology</th>
                    <th style={{ padding: '10px 6px' }}>Physics</th>
                    <th style={{ padding: '10px 6px' }}>Chemistry</th>
                    <th style={{ padding: '10px 6px' }}>English</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px' }}>
                  {analytics.studentSubjectAverages.map(std => (
                    <tr key={std.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 6px' }}>
                        <strong style={{ display: 'block' }}>{std.name}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{std.email}</span>
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 'bold', color: std.averages.Biology === null ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {std.averages.Biology !== null ? `${std.averages.Biology}%` : '-'}
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 'bold', color: std.averages.Physics === null ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {std.averages.Physics !== null ? `${std.averages.Physics}%` : '-'}
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 'bold', color: std.averages.Chemistry === null ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {std.averages.Chemistry !== null ? `${std.averages.Chemistry}%` : '-'}
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 'bold', color: std.averages.English === null ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {std.averages.English !== null ? `${std.averages.English}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comparisons logged.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. AUDIT MUTATION LOGS */}
      {tab === 'logs' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3>Administrative System Mutation Audit Log</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Immutable timeline detailing role modifications, user accounts CRUD, and administrative challan issuances.
          </p>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Filter Logs by Operator Role:</label>
            <select
              className="form-input"
              style={{ maxWidth: '200px', padding: '6px 12px' }}
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
            >
              <option value="all">All Operators</option>
              <option value="teacher">Teachers Only (Teacher Activity)</option>
              <option value="clerk">Clerks Only</option>
              <option value="admin">Admins Only</option>
              <option value="system">System Logs Only</option>
            </select>
          </div>

          {(() => {
            const filteredLogs = logs.filter(log => {
              if (operatorFilter === 'all') return true;
              if (operatorFilter === 'system') return !log.operatorId;
              return log.operatorId && log.operatorId.role === operatorFilter;
            });

            return filteredLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No audit records match the selected role filter.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredLogs.map((log) => (
                  <div key={log._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>[{log.action}]</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ marginTop: '5px' }}>
                      Operator: <strong>{log.operatorId ? `${log.operatorId.name} (${log.operatorId.role})` : 'System'}</strong>
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Target: {log.targetModel} ({log.targetId})
                    </p>
                    {log.changeDelta && (
                      <pre style={{ marginTop: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', overflowX: 'auto', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {JSON.stringify(log.changeDelta, null, 2)}
                      </pre>
                    )}
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>IP Address: {log.ipAddress}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* NEW ACADEMIC CONTENT HUB TAB */}
      {tab === 'resources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.05)' }}>
            <h3 style={{ color: 'var(--accent)', margin: 0 }}>Academic Content Hub (CRUD)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 0 0' }}>
              Create MCQs, parse Word (.docx) test sheets, publish video/PDF lessons, and delete outdated entries from the Sindh Academy database.
            </p>
          </div>
          <TeacherDashboard authFetch={authFetch} />
        </div>
      )}
      {/* 5. SUCCESS STORIES (REVIEWS) */}
      {tab === 'reviews' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
          {/* Create Review Form */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3>Publish Success Story</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
              Create a new student success card featured on the home landing page.
            </p>

            {revMsg && (
              <p style={{
                fontSize: '13px',
                color: 'var(--success)',
                background: 'rgba(16,185,129,0.1)',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                {revMsg}
              </p>
            )}

            <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px' }}>Student Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Khan"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px' }}>Achievement / Score Badge</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Secured admission in CS at GCU Lahore"
                  value={revAchievement}
                  onChange={(e) => setRevAchievement(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px' }}>Success Review description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px' }}
                  required
                  placeholder="Write a brief review on how Sindh Educational Academy helped this student secure admission..."
                  value={revText}
                  onChange={(e) => setRevText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Select Student Profile Color Badge</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {['student1', 'student2', 'student3', 'student4', 'student5'].map((av) => {
                    const colors = { student1: '#3b82f6', student2: '#10b981', student3: '#8b5cf6', student4: '#f59e0b', student5: '#ec4899' };
                    const isActive = revAvatar === av;
                    return (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setRevAvatar(av)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: colors[av],
                          border: isActive ? '3px solid #fff' : '2px solid transparent',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      />
                    );
                  })}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avatar theme: {revAvatar}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '10px 0', fontSize: '13px' }}>
                Publish Success Story
              </button>
            </form>
          </div>

          {/* Active Stories List */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3>Active Success Stories ({reviews.length})</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
              Delete reviews to take them off the public site.
            </p>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>No success reviews added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                {reviews.map(r => (
                  <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.studentName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent)', marginLeft: '10px' }}>({r.achievement})</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reviewText}</p>
                    </div>
                    <button className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDeleteReview(r._id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
