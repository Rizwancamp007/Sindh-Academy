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
            <a href="/#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Academy</a>
            <a href="/#demo" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Video Lectures</a>
            <a href="/#reviews" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Success Stories</a>
            <a href="/#contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Us</a>
          </div>
        </div>

        {/* Location & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Academy Location</h4>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            📍 Eidgah Road, near Govt Degree College,<br />
            Ghotki, Sindh, Pakistan.<br /><br />
            📞 Support: +92 301 2345678<br />
            ✉️ admin@sindhacademy.edu.pk
          </p>
        </div>

        {/* Socials Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Follow Us</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Connect with Sindh Educational Academy on social networks:</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href="https://facebook.com/sindhacademy" 
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
              href="https://instagram.com/sindhacademy" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#ec4899',
                textDecoration: 'none'
              }}
            >
              Instagram
            </a>
            <a 
              href="https://tiktok.com/@sindhacademy" 
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
              href="https://wa.me/923012345678" 
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
