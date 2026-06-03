import React, { useState, useEffect } from 'react';

interface Signal {
  name: string; source: string; freshness: number;
  lastUpdated: string; status: 'live' | 'stale' | 'degraded';
  records: string; impact: string;
}

const SIGNALS: Signal[] = [
  { name: 'MLS Comp Feed', source: 'CoreLogic API v3', freshness: 97, lastUpdated: '4 min ago', status: 'live', records: '12,440 comps', impact: 'Comp pricing · Demand velocity' },
  { name: 'Demand Velocity Index', source: 'Internal clickstream', freshness: 100, lastUpdated: 'Live', status: 'live', records: '2.1M events/day', impact: 'Demand score · Timing engine' },
  { name: 'Behavioral Exhaust', source: 'Platform event bus', freshness: 100, lastUpdated: 'Live', status: 'live', records: '847K interactions', impact: 'Perception gap · Audience signal' },
  { name: 'Vacancy Risk Model', source: 'Internal ML pipeline', freshness: 88, lastUpdated: '2 hrs ago', status: 'live', records: '2,714 units scored', impact: 'Urgency weighting · Threshold' },
  { name: 'Neighborhood Sentiment', source: 'Public records + NLP', freshness: 61, lastUpdated: '18 hrs ago', status: 'degraded', records: '340 zip codes', impact: 'Context signal · Weak weight' },
  { name: 'Legacy Comp Cache', source: 'Internal DB (stale)', freshness: 23, lastUpdated: '3 days ago', status: 'stale', records: '8,200 records', impact: 'EXCLUDED from active diagnosis' },
];

const statusConfig = {
  live: { dot: 'd-sage', label: 'Live', tagCls: 't-sage' },
  degraded: { dot: 'd-amber', label: 'Degraded', tagCls: 't-amber' },
  stale: { dot: 'd-blush', label: 'Stale · Excluded', tagCls: 't-blush' },
};

const SignalHealth: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const liveCount = SIGNALS.filter(s => s.status === 'live').length;
  const avgFreshness = Math.round(SIGNALS.filter(s => s.status !== 'stale').reduce((a, s) => a + s.freshness, 0) / SIGNALS.filter(s => s.status !== 'stale').length);

  return (
    <section style={{ padding: 'clamp(56px, 8vw, 80px) clamp(16px, 4vw, 24px)', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      <div className="blob blob-cream fa" style={{ width: 300, height: 260, top: -40, right: -50, opacity: 0.6, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="neu-pill-raised" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', marginBottom: 18 }}>
            <div className="dot d-sage" style={{ animation: `glow 2s ease-in-out infinite` }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-mid)' }}>SIGNAL HEALTH · LIVE</span>
          </div>
          <h2 style={{ marginBottom: 12 }}>Data provenance, not just data</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 520, fontSize: '0.9rem' }}>
            Every diagnosis carries a provenance receipt — which signals fed it, how fresh they were, and what was excluded. The LLM is epistemically honest for the first time.
          </p>
        </div>

        {/* Health summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Live Signals', val: `${liveCount}/${SIGNALS.length}`, color: 'var(--sage-dark)', cls: 'cc-sage' },
            { label: 'Avg Signal Freshness', val: `${avgFreshness}%`, color: 'var(--blue-dark)', cls: 'cc-blue' },
            { label: 'Stale Signals Excluded', val: '1', color: 'var(--blush-dark)', cls: 'cc-blush' },
          ].map((m, i) => (
            <div key={i} className={m.cls} style={{ padding: '18px 20px', borderRadius: 'var(--r-md)' }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.8rem', color: m.color, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.07em', color: 'var(--text-mid)', marginTop: 6, textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Signal table */}
        <div className="neu-raised-sm" style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SIGNALS.map((signal, i) => {
              const sc = statusConfig[signal.status];
              const progCls = signal.status === 'live' ? 'pf-sage' : signal.status === 'degraded' ? 'pf-lav' : 'pf-blush';

              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  gap: 16, alignItems: 'center', padding: '14px 18px',
                  background: signal.status === 'stale' ? 'rgba(200,160,152,0.08)' : 'transparent',
                  borderRadius: 'var(--r-md)',
                  opacity: signal.status === 'stale' ? 0.6 : 1,
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div className={`dot ${sc.dot}`} style={signal.status === 'live' ? { animation: `glow ${1.5 + i * 0.3}s ease-in-out infinite` } : undefined} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{signal.name}</span>
                      <span className={`tag ${sc.tagCls}`} style={{ fontSize: '0.65rem' }}>{sc.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{signal.source}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>·</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{signal.records}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>·</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontStyle: 'italic' }}>{signal.impact}</span>
                    </div>
                  </div>

                  <div style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.67rem', color: 'var(--text-light)' }}>Freshness</span>
                      <span style={{ fontSize: '0.67rem', fontWeight: 600, color: 'var(--text-dark)' }}>{signal.freshness}%</span>
                    </div>
                    <div className="prog-track">
                      <div className={`prog-fill ${progCls}`} style={{ width: `${signal.freshness}%` }} />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 90 }}>
                    <div style={{ fontSize: '0.67rem', color: 'var(--text-light)', marginBottom: 2 }}>Last updated</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-dark)' }}>{signal.lastUpdated}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Provenance receipt example */}
        <div className="neu-inset" style={{ marginTop: 24, padding: '22px 26px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 14 }}>Sample Provenance Receipt · Unit P001</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.8, background: 'rgba(255,255,255,0.3)', padding: '16px 20px', borderRadius: 'var(--r-md)' }}>
            <span style={{ color: 'var(--sage-dark)' }}>✓</span> MLS Comp Feed · freshness 97% · 12,440 comps · <span style={{ color: 'var(--sage-dark)' }}>INCLUDED</span><br />
            <span style={{ color: 'var(--sage-dark)' }}>✓</span> Demand Velocity Index · freshness 100% · live · <span style={{ color: 'var(--sage-dark)' }}>INCLUDED</span><br />
            <span style={{ color: 'var(--sage-dark)' }}>✓</span> Behavioral Exhaust · freshness 100% · live · <span style={{ color: 'var(--sage-dark)' }}>INCLUDED</span><br />
            <span style={{ color: '#C8A840' }}>⚠</span> Neighborhood Sentiment · freshness 61% · 18h old · <span style={{ color: '#C8A840' }}>WEIGHTED 0.3×</span><br />
            <span style={{ color: 'var(--blush-dark)' }}>✗</span> Legacy Comp Cache · freshness 23% · 3 days old · <span style={{ color: 'var(--blush-dark)' }}>EXCLUDED</span><br />
            <br />
            <span style={{ color: 'var(--blue-dark)', fontWeight: 600 }}>Diagnosis confidence: 91%</span> · 4 of 5 signals fresh · 1 excluded · 1 downweighted
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignalHealth;
