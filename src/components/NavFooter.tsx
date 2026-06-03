import React, { useState, useEffect } from 'react';

export const Nav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Portfolio', id: 'portfolio' },
    { label: 'Engine', id: 'engine' },
    { label: 'Revenue', id: 'revenue' },
    { label: 'Signals', id: 'signals' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: (scrolled || menuOpen) ? 'rgba(237,230,220,0.92)' : 'transparent',
        backdropFilter: (scrolled || menuOpen) ? 'blur(20px)' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 20px rgba(175,160,138,0.2)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(145deg, #BACED8, #7AAABE)',
            borderRadius: '10px',
            boxShadow: '3px 3px 8px rgba(100,155,178,0.4), -2px -2px 6px rgba(255,252,248,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', color: 'var(--text-dark)', letterSpacing: '0.02em' }}>PERCEPT</span>
        </div>

        {/* Desktop Nav links */}
        <div className="percept-nav-links" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {navLinks.map(link => (
            <button key={link.id} className="btn btn-sm"
              style={{ fontSize: '0.78rem', padding: '7px 16px' }}
              onClick={() => scrollTo(link.id)}>
              {link.label}
            </button>
          ))}
          <button className="btn btn-blue btn-sm" onClick={() => scrollTo('engine')}>
            Run Diagnosis
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="percept-nav-mobile-btn"
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'none', // shown via CSS on mobile
            background: 'var(--neu-bg)',
            border: 'none',
            borderRadius: 10,
            padding: '8px 10px',
            cursor: 'pointer',
            boxShadow: '3px 3px 8px var(--neu-sd), -2px -2px 6px var(--neu-sl)',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <div style={{ width: 18, height: 2, borderRadius: 2, background: menuOpen ? 'transparent' : 'var(--text-dark)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
          <div style={{ width: 18, height: 2, borderRadius: 2, background: 'var(--text-dark)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg)' : 'none', marginTop: menuOpen ? -6 : 0 }} />
          {!menuOpen && <div style={{ width: 18, height: 2, borderRadius: 2, background: 'var(--text-dark)' }} />}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
          background: 'rgba(237,230,220,0.97)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(200,188,172,0.3)',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 10,
          boxShadow: '0 8px 24px rgba(175,160,138,0.25)',
        }}>
          {navLinks.map(link => (
            <button key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'var(--neu-bg)', border: 'none', borderRadius: 14,
                padding: '13px 18px', textAlign: 'left', cursor: 'pointer',
                fontFamily: 'var(--f-main)', fontSize: '0.9rem', fontWeight: 500,
                color: 'var(--text-dark)',
                boxShadow: '3px 3px 8px var(--neu-sd), -2px -2px 6px var(--neu-sl)',
              }}>
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('engine')}
            className="btn btn-blue"
            style={{ width: '100%', justifyContent: 'center', padding: '13px 18px', fontSize: '0.9rem' }}>
            Run Diagnosis
          </button>
        </div>
      )}
    </>
  );
};

export const Footer: React.FC = () => (
  <footer style={{ padding: '48px 20px', maxWidth: 1100, margin: '0 auto', borderTop: '1px solid rgba(200,188,172,0.3)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
      <div>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: 6 }}>PERCEPT</div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', maxWidth: 320, lineHeight: 1.6 }}>
          Revenue diagnosis engine for property portfolios. Built by Meghana Rabba.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div className="neu-pill-raised" style={{ padding: '8px 18px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-mid)' }}>Groq llama3-70b · LangGraph · React</span>
        </div>
        <a href="https://github.com/Rabba-Meghana/PERCEPT" target="_blank" rel="noreferrer" className="btn btn-sm" style={{ textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </footer>
);
