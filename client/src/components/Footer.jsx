import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(12px)',
      padding: '50px 30px 30px 30px',
      color: 'var(--text-secondary)',
      marginTop: '100px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        paddingBottom: '40px',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'left'
      }}>
        {/* Intro */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '20px',
            background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SEA GHOTKI
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            Ghotki's premier educational portal specializing in comprehensive MDCAT and ECAT preparatory assessments, protected video streaming, and state-preserving exam engines.
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Quick Navigation</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
            <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Academy</Link>
            <Link to="/lectures" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Video Lectures</Link>
            <Link to="/mock-tests" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Mock Assessments</Link>
            <Link to="/search-mcqs" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Search MCQs</Link>
            <Link to="/contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Us</Link>
          </div>
        </div>

        {/* Location & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Academy Location</h4>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            📍 Sindh Public School Near National Bank Devri Road Ghotki,<br />
            Ghotki, Sindh, Pakistan.<br /><br />
            📞 Support: +92 300 9314064<br />
            ✉️ seaghotki01@gmail.com
          </p>
        </div>

        {/* Socials Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Follow Us</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Connect with Sindh Educational Academy on social networks:</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="https://web.facebook.com/sindhedu.ghotki/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                textDecoration: 'none'
              }}
            >
              Facebook
            </a>

            <a
              href="https://www.tiktok.com/@sindh.educational"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
            >
              TikTok
            </a>
            <a
              href="https://wa.me/923009314064"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                textDecoration: 'none'
              }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        paddingTop: '30px',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        © {new Date().getFullYear()} Sindh Educational Academy (SEA), Ghotki. All Rights Reserved. Protected Content Streaming Ledger.
      </div>
    </footer>
  );
};
