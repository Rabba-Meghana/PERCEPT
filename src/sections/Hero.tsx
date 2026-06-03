import React from 'react';

const Hero: React.FC = () => {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      padding: '80px 24px 60px',
    }}>
      {/* Background blobs */}
      <div className="blob blob-blue fa" style={{ width: 420, height: 360, top: '-80px', right: '-60px', opacity: 0.75 }} />
      <div className="blob blob-blush fb" style={{ width: 280, height: 240, bottom: '80px', left: '-40px', opacity: 0.65 }} />
      <div className="blob blob-sage fc" style={{ width: 200, height: 180, top: '40%', left: '8%', opacity: 0.5 }} />
      <div className="blob blob-lav fd" style={{ width: 160, height: 140, bottom: '15%', right: '12%', opacity: 0.55 }} />
      <div className="blob blob-cream" style={{ width: 120, height: 100, top: '25%', right: '25%', opacity: 0.6, animation: 'floatY 10s ease-in-out infinite 4s' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, textAlign: 'center' }}>
        {/* Eyebrow tag */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div className="neu-pill-raised" style={{ padding: '8px 22px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div className="dot d-sage" />
            <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-mid)' }}>
              REVENUE DIAGNOSIS ENGINE
            </span>
            <div className="dot d-blue" />
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ marginBottom: 20, letterSpacing: '-0.02em' }}>
          The pricing agent that knows
          <br />
          <em style={{ color: 'var(--blue-dark)', fontStyle: 'italic' }}>what it doesn't know</em>
        </h1>

        {/* Subheadline */}
        <p style={{ fontSize: '1.05rem', color: 'var(--text-mid)', marginBottom: 40, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Across 2,700+ properties, your current pricing agent outputs a number. PERCEPT tells you whether that number is even the right variable to optimize — and which lever actually moves revenue.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <button className="btn btn-blue" style={{ padding: '13px 32px', fontSize: '0.9rem' }}
            onClick={() => document.getElementById('engine')?.scrollIntoView({ behavior: 'smooth' })}>
            Run a Diagnosis
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button className="btn" style={{ padding: '13px 32px', fontSize: '0.9rem' }}
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
            View Portfolio
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { value: '2,714', label: 'Properties Analyzed', color: 'var(--blue-dark)' },
            { value: '$4.28M', label: 'Annual Leakage Found', color: 'var(--blush-dark)' },
            { value: '91%', label: 'Diagnosis Accuracy', color: 'var(--sage-dark)' },
          ].map((s, i) => (
            <div key={i} className="neu-raised-sm" style={{ padding: '18px 28px', textAlign: 'center', minWidth: 140 }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.07em', color: 'var(--text-light)', marginTop: 6, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating mini cards */}
      <div className="neu-float r-hide" style={{ position: 'absolute', left: '3%', top: '30%', padding: '14px 18px', width: 200, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="dot d-blush" />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-mid)', letterSpacing: '0.06em' }}>PERCEPTION GAP</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
          CTR 84% · Inquiry 6%<br />
          <span style={{ color: 'var(--blush-dark)', fontWeight: 500 }}>Stop dropping the price.</span>
        </div>
      </div>

      <div className="neu-float r-hide" style={{ position: 'absolute', right: '3%', bottom: '28%', padding: '14px 18px', width: 210, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="dot d-lav" />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-mid)', letterSpacing: '0.06em' }}>LATENT DEMAND</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
          Save rate top 3%<br />
          <span style={{ color: '#7A60A8', fontWeight: 500 }}>Raise $150. Demand is ready.</span>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.5, animation: 'floatY 3s ease-in-out infinite' }}>
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--text-light)' }}>SCROLL</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>
    </section>
  );
};

export default Hero;
