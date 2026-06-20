import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, HelpCircle } from 'lucide-react';

export const Contact = () => {
  const [msgSent, setMsgSent] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How do I generate a fee challan and verify my enrollment?",
      a: "Log into your account, select either Matric/Inter Coaching or MDCAT/ECAT plan, and click 'Generate Fee Challan'. You can download the PDF containing Allied Bank details. Once paid, input your Transaction Hash ID, upload a screenshot proof of payment on your dashboard, and await Clerk audit validation."
    },
    {
      q: "Can I access lectures and mocks on multiple devices?",
      a: "Yes, our MERN application supports responsive cross-platform layout. However, to prevent credentials sharing and copying, sessions are monitored, and password complexity/session controls are enforced."
    },
    {
      q: "How does the study login streak work?",
      a: "The study streak tracks consecutive days you log in and interact with preparatory material. Completing daily reviews increments your daily activity streak progress, rewarded with a glowing study streak progress badge."
    },
    {
      q: "Are the mock test patterns matched to real entry exams?",
      a: "Absolutely. Our Exam Engine implements strict exam timers, bookmark indices, and negative marking formulas. For instance, ECAT grading assigns +4 for correct and -1 for incorrect answers."
    }
  ];

  const handleSend = (e) => {
    e.preventDefault();
    setMsgSent(true);
    e.target.reset();
    setTimeout(() => setMsgSent(false), 5000);
  };

  return (
    <div className="page-transition" style={{
      width: '90%',
      maxWidth: '1200px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '60px'
    }}>
      {/* Page Header */}
      <header style={{ textAlign: 'center', padding: '40px 20px 10px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '16px' }}>
          Contact Our Ghotki Desk
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
          Have general inquiries, billing validation questions, or feedback? Get in touch with our administrative and technical support office.
        </p>
      </header>

      {/* Narrative grid section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Contact info list card */}
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Helpdesk Contacts</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
            Reach out via phone, email, or WhatsApp. Clerks are online daily from 9:00 AM to 6:00 PM to review pending payment receipts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent)' }}><MapPin size={24} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>Physical Campus</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>SEA, Sindh Public School Near National Bank Devri Road Ghotki, Sindh</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent)' }}><Phone size={24} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>Telephone Helpline</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>+92 300 9314064</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent)' }}><Mail size={24} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>Email Support</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>seaghotki01@gmail.com</span>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/923009314064"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              padding: '12px 24px',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 'bold',
              borderRadius: '10px'
            }}
          >
            <MessageCircle size={18} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Support Mail form card */}
        <form onSubmit={handleSend} className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Send Email Inquiry</h2>
          
          {msgSent && (
            <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
              Your message was delivered successfully. Support staff will reply to your registered email address.
            </div>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required className="form-input" placeholder="e.g. khan" />
          </div>

          <div className="form-group">
            <label>Registered Email Address</label>
            <input type="email" required className="form-input" placeholder="e.g. khan@email.com" />
          </div>

          <div className="form-group">
            <label>Message Content</label>
            <textarea required className="form-input" style={{ minHeight: '120px' }} placeholder="Specify your questions regarding prep course access..." />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
        </form>
      </section>

      {/* Accordion FAQ section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: activeFaq === idx ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--accent)' }} />
                  {f.q}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeFaq === idx ? '−' : '+'}</span>
              </div>
              {activeFaq === idx && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginTop: '15px', paddingLeft: '28px', margin: '15px 0 0 0' }}>
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
