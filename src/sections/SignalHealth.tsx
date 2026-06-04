import React, { useState, useEffect } from 'react';

interface Signal {
  name: string; source: string; freshness: number;
  lastUpdated: string; status: 'live' | 'stale' | 'degraded';
  records: string; impact: string;
}

const SIGNALS: Signal[] = [
  { name: 'Market Profile Engine', source: 'Synthetic · Denver zip profiles', freshness: 100, lastUpdated: 'Per request', status: 'live', records: '8 zip codes', impact: 'Base rent · Demand trend · Vacancy rate' },
  { name: 'Listing Generator', source: 'LLM-generated · Groq llama3-70b', freshness: 100, lastUpdated: 'Live', status: 'live', records: '8 listings per zip', impact: 'Price · DOM · Behavioral signals' },
  { name: 'Behavioral Signal Model', source: 'Synthetic · Realistic distributions', freshness: 100, lastUpdated: 'Per listing', status: 'live', records: 'CTR · Inquiry · Save · Tour', impact: 'Perception gap · Audience signal' },
  { name: 'Ingest Node', source: 'LangGraph pipeline · Node 1', freshness: 100, lastUpdated: 'Live stream', status: 'live', records: 'Structured signal brief', impact: 'Anomaly detection · FMV gap' },
  { name: 'Behavioral Node', source: 'LangGraph pipeline · Node 2', freshness: 100, lastUpdated: 'Live stream', status: 'live', records: 'Failure mode analysis', impact: 'Differential diagnosis' },
  { name: 'Diagnosis Node', source: 'LangGraph pipeline · Node 3', freshness: 100, lastUpdated: 'Live stream', status: 'live', records: 'Root cause + action plan', impact: 'Classification · Revenue impact' },
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
          <h2 style={{ marginBottom: 12 }}>How the pipeline works</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 520, fontSize: '0.9rem' }}>
            Listings are LLM-generated against real Denver market profiles. The three-node reasoning pipeline — Ingest, Behavioral Analysis, Diagnosis — is real and runs live. Each node streams token by token and feeds its output to the next.
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
          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 14 }}>Sample Pipeline Receipt · Unit P001</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.8, background: 'rgba(255,255,255,0.3)', padding: '16px 20px', borderRadius: 'var(--r-md)' }}>
            <span style={{ color: 'var(--sage-dark)' }}>✓</span> Listing data · LLM-generated · Denver 80205 market profile · <span style={{ color: 'var(--sage-dark)' }}>SYNTHETIC</span><br />
            <span style={{ color: 'var(--sage-dark)' }}>✓</span> Ingest Node · Groq llama3-70b · separate API call · <span style={{ color: 'var(--sage-dark)' }}>STREAMED</span><br />
            <span style={{ color: 'var(--sage-dark)' }}>✓</span> Behavioral Node · receives Ingest output · separate API call · <span style={{ color: 'var(--sage-dark)' }}>STREAMED</span><br />
            <span style={{ color: 'var(--sage-dark)' }}>✓</span> Diagnosis Node · receives Behavioral output · separate API call · <span style={{ color: 'var(--sage-dark)' }}>STREAMED</span><br />
            <br />
            <span style={{ color: 'var(--blue-dark)', fontWeight: 600 }}>3 sequential nodes · 3 separate LLM calls · live token streaming</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignalHealth;
