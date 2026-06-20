import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Flame, LogOut, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
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
      padding: '8px 4px',
      transition: 'color 0.3s ease',
      borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent'
    };
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="glass-panel nav-container">
      {/* Logo */}
      <Link to="/" onClick={closeMobileMenu} style={{
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

      {/* Desktop Nav Links */}
      <div className="nav-links">
        <Link 
          to="/" 
          onClick={() => {
            closeMobileMenu();
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
        <Link to="/mock-tests" style={getLinkStyle('/mock-tests')}>
          Mock Tests
        </Link>
        <Link to="/search-mcqs" style={getLinkStyle('/search-mcqs')}>
          Search MCQs
        </Link>
        <Link to="/contact" style={getLinkStyle('/contact')}>
          Contact
        </Link>

        {user && (
          <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
            Dashboard
          </Link>
        )}

        {/* Daily Streak Indicator */}
        {user && user.role === 'student' && (
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

        {user ? (
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
        >
          {theme === 'day' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Right control buttons for mobile (Theme + Menu toggle) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Mobile Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="nav-mobile-theme-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'day' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Hamburger menu button */}
        <button onClick={toggleMobileMenu} className="nav-toggle-btn" aria-label="Toggle navigation menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Links Dropdown */}
      <div className={`nav-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link 
          to="/" 
          onClick={() => {
            closeMobileMenu();
            if (window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }} 
          style={getLinkStyle('/')}
        >
          Home
        </Link>
        <Link to="/about" onClick={closeMobileMenu} style={getLinkStyle('/about')}>
          About
        </Link>
        <Link to="/lectures" onClick={closeMobileMenu} style={getLinkStyle('/lectures')}>
          Lectures
        </Link>
        <Link to="/mock-tests" onClick={closeMobileMenu} style={getLinkStyle('/mock-tests')}>
          Mock Tests
        </Link>
        <Link to="/search-mcqs" onClick={closeMobileMenu} style={getLinkStyle('/search-mcqs')}>
          Search MCQs
        </Link>
        <Link to="/contact" onClick={closeMobileMenu} style={getLinkStyle('/contact')}>
          Contact
        </Link>

        {user && (
          <Link to="/dashboard" onClick={closeMobileMenu} style={getLinkStyle('/dashboard')}>
            Dashboard
          </Link>
        )}

        {/* Daily Streak Indicator */}
        {user && user.role === 'student' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '14px',
            alignSelf: 'flex-start'
          }}>
            <Flame size={16} fill="#f59e0b" />
            <span>{user.dailyStreak || 0} Day Streak</span>
          </div>
        )}

        {user ? (
          <button onClick={handleLogout} className="btn-secondary" style={{
            padding: '8px 16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            alignSelf: 'flex-start',
            marginTop: '10px'
          }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        ) : (
          <Link to="/login" onClick={closeMobileMenu} className="btn-primary" style={{
            padding: '8px 20px',
            fontSize: '14px',
            textDecoration: 'none',
            textAlign: 'center',
            width: '100%',
            marginTop: '10px'
          }}>
            Portal Login
          </Link>
        )}
      </div>
    </nav>
  );
};
