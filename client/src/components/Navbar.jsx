import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Flame, LogOut, GraduationCap, Search } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: 'none',
      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
      fontWeight: isActive ? 600 : 500,
      fontSize: '15px',
      position: 'relative',
      padding: '6px 4px',
      transition: 'color 0.3s ease',
      borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent'
    };
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '20px',
      margin: '20px auto',
      width: '90%',
      maxWidth: '1200px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 30px',
      borderRadius: '20px',
      background: 'var(--bg-surface)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid var(--border-color)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      {/* Logo */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: 'var(--text-primary)'
      }}>
        <img src="/assests/sea_logo.png" alt="SEA Logo" style={{ height: '36px', width: '36px', objectFit: 'cover', borderRadius: '50%', border: '1.5px solid var(--accent)' }} />
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '20px',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SEA GHOTKI
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <Link 
          to="/" 
          onClick={() => {
            if (window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }} 
          style={getLinkStyle('/')}
        >
          Home
        </Link>
        <Link to="/about" style={getLinkStyle('/about')}>
          About
        </Link>
        <Link to="/lectures" style={getLinkStyle('/lectures')}>
          Lectures
        </Link>
        <Link to="/search-mcqs" style={getLinkStyle('/search-mcqs')}>
          Search MCQs
        </Link>
        <Link to="/contact" style={getLinkStyle('/contact')}>
          Contact
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" style={{
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '15px'
            }}>
              Dashboard
            </Link>

            {/* Daily Streak Indicator */}
            {user.role === 'student' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                <Flame size={16} fill="#f59e0b" />
                <span>{user.dailyStreak || 0} Day Streak</span>
              </div>
            )}

            <button onClick={handleLogout} className="btn-secondary" style={{
              padding: '8px 16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{
            padding: '8px 20px',
            fontSize: '14px',
            textDecoration: 'none'
          }}>
            Portal Login
          </Link>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          {theme === 'day' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </nav>
  );
};
