import React, { useState, useEffect } from 'react';
import { PORTFOLIO, DIAGNOSIS_META } from '../data/portfolio';

const RevenueRecovery: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const sorted = [...PORTFOLIO].sort((a, b) => b.annualLeakage - a.annualLeakage);
  const maxLeakage = sorted[0].annualLeakage;

  const totalLeakage = PORTFOLIO.reduce((s, p) => s + p.annualLeakage, 0);
  const perceptionLeakage = PORTFOLIO.filter(p => p.diagnosis === 'PERCEPTION').reduce((s, p) => s + p.annualLeakage, 0);
  const priceLeakage = PORTFOLIO.filter(p => p.diagnosis === 'PRICE').reduce((s, p) => s + p.annualLeakage, 0);

  return (
    <section style={{ padding: 'clamp(56px, 8vw, 80px) clamp(16px, 4vw, 24px)', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      <div className="blob blob-blush fa" style={{ width: 280, height: 240, top: 20, left: -60, opacity: 0.4, zIndex: 0 }} />
      <div className="blob blob-lav fd" style={{ width: 220, height: 190, bottom: 40, right: -40, opacity: 0.35, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="neu-pill-raised" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', marginBottom: 18 }}>
            <div className="dot d-blush" />
            <span style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-mid)' }}>REVENUE RECOVERY</span>
          </div>
          <h2 style={{ marginBottom: 12 }}>Every dollar lost has a name</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 520, fontSize: '0.9rem' }}>
            Revenue leakage isn't random. It clusters by diagnosis type. Knowing which type tells you exactly what to fix — and what not to.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24, alignItems: 'start' }}>
          {/* Left: breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { type: 'PERCEPTION' as const, leakage: perceptionLeakage, insight: 'Losing revenue to bad presentation, not bad pricing. Every dollar is recoverable without touching price.' },
              { type: 'PRICE' as const, leakage: priceLeakage, insight: 'Genuine price resistance. Market ceiling is real. Early intervention prevents compounding vacancy cost.' },
              { type: 'AUDIENCE' as const, leakage: 960, insight: 'Distribution mismatch. Correct renters never see the listing. Platform-level fix.' },
              { type: 'LATENT' as const, leakage: 2640, insight: 'Units underpriced relative to latent demand signal. Revenue left on the table by not raising.' },
            ].map((row, i) => {
              const meta = DIAGNOSIS_META[row.type];
              return (
                <div key={i} className={meta.colorClass} style={{ padding: '18px 20px', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className={`tag ${meta.tagClass}`}>
                      <span className={`dot ${meta.dotClass}`} />{meta.label}
                    </span>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.3rem', color: 'var(--text-dark)' }}>
                      ${row.leakage.toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-mid)', lineHeight: 1.55 }}>{row.insight}</p>
                </div>
              );
            })}

            <div className="neu-inset" style={{ padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 8 }}>Sample Portfolio Total</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', color: 'var(--blush-dark)' }}>${totalLeakage.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 4 }}>annual leakage across 15 properties shown</div>
            </div>
          </div>

          {/* Right: horizontal bar chart */}
          <div className="neu-raised-sm" style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 20 }}>Leakage by Property · Annual</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {sorted.map((p, i) => {
                const meta = DIAGNOSIS_META[p.diagnosis];
                const pct = (p.annualLeakage / maxLeakage) * 100;
                const progMap: Record<string, string> = { PERCEPTION: 'pf-blush', PRICE: 'pf-blue', AUDIENCE: 'pf-sage', LATENT: 'pf-lav' };
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`dot ${meta.dotClass}`} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dark)' }}>{p.address.split(',')[0]}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dark)' }}>-${p.annualLeakage.toLocaleString()}</span>
                    </div>
                    <div className="prog-track">
                      <div
                        className={`prog-fill ${progMap[p.diagnosis]}`}
                        style={{ width: animated ? `${pct}%` : '0%', transition: `width ${0.8 + i * 0.06}s ease` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Key insight callout */}
        <div className="neu-raised" style={{ marginTop: 32, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
          <div className="blob blob-blush" style={{ width: 180, height: 150, right: -30, top: -20, opacity: 0.5 }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: 12, fontStyle: 'italic' }}>
              "High CTR. Low inquiry. The diagnosis: bathroom lead photo."
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.65 }}>
              A simulated Denver 2bd with 38 days on market and 3 price drops. PERCEPT diagnosed a perception problem — not price resistance. The pipeline identified the bathroom lead photo as the trust-breaking signal and recommended a photo reorder before any price change.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevenueRecovery;
