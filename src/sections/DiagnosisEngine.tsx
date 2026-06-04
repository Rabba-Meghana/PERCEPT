import React, { useState, useRef, useEffect } from 'react';
import { runDiagnosis, DiagnosisResult } from '../engine/diagnosisGraph';
import {
  fetchMarketData, buildPropertyString, buildBehavioralString,
  buildMarketString, RealListing, MarketSummary
} from '../services/marketData';

type NodeStatus = 'idle' | 'running' | 'done';

const DENVER_ZIPS = ['80205', '80203', '80206', '80209', '80212', '80218', '80219', '80220'];

// ─── DIAGNOSIS CONFIG ────────────────────────────────────────────
const DIAG_CONFIG = {
  PERCEPTION: {
    label: 'Perception Problem',
    icon: '👁',
    color: '#9888B8',
    bg: 'rgba(152,136,184,0.08)',
    border: 'rgba(152,136,184,0.22)',
    accent: '#7B6FA8',
    tagBg: 'rgba(152,136,184,0.15)',
    gradient: 'linear-gradient(145deg, rgba(152,136,184,0.12), rgba(152,136,184,0.04))',
  },
  PRICE: {
    label: 'Price Resistance',
    icon: '💲',
    color: '#C88080',
    bg: 'rgba(200,128,128,0.08)',
    border: 'rgba(200,128,128,0.22)',
    accent: '#B06060',
    tagBg: 'rgba(200,128,128,0.15)',
    gradient: 'linear-gradient(145deg, rgba(200,128,128,0.12), rgba(200,128,128,0.04))',
  },
  AUDIENCE: {
    label: 'Audience Mismatch',
    icon: '🎯',
    color: '#D4A870',
    bg: 'rgba(212,168,112,0.08)',
    border: 'rgba(212,168,112,0.22)',
    accent: '#B88A50',
    tagBg: 'rgba(212,168,112,0.15)',
    gradient: 'linear-gradient(145deg, rgba(212,168,112,0.12), rgba(212,168,112,0.04))',
  },
  LATENT: {
    label: 'Latent Demand',
    icon: '⏳',
    color: '#7AAA88',
    bg: 'rgba(122,170,136,0.08)',
    border: 'rgba(122,170,136,0.22)',
    accent: '#5A8A68',
    tagBg: 'rgba(122,170,136,0.15)',
    gradient: 'linear-gradient(145deg, rgba(122,170,136,0.12), rgba(122,170,136,0.04))',
  },
};

const URGENCY_CONFIG = {
  CRITICAL: { color: '#C86060', label: 'CRITICAL', bg: 'rgba(200,96,96,0.12)' },
  HIGH:     { color: '#C88080', label: 'HIGH',     bg: 'rgba(200,128,128,0.10)' },
  MEDIUM:   { color: '#D4A870', label: 'MEDIUM',   bg: 'rgba(212,168,112,0.10)' },
  WATCH:    { color: '#7AAABE', label: 'WATCH',    bg: 'rgba(122,170,190,0.10)' },
};

// ─── NODE STEP COMPONENT ─────────────────────────────────────────
const NodeStep: React.FC<{
  number: number; label: string; sublabel: string;
  status: NodeStatus; content: string; color: string; isLast?: boolean;
}> = ({ number, label, sublabel, status, content, isLast, color }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && status === 'running') ref.current.scrollTop = ref.current.scrollHeight;
  }, [content, status]);

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: status === 'done' ? `linear-gradient(145deg, ${color}CC, ${color})` : status === 'running' ? `${color}55` : 'var(--neu-bg)',
          boxShadow: status === 'running'
            ? `0 0 0 4px ${color}22, 0 0 16px ${color}44, 4px 4px 12px var(--neu-sd), -3px -3px 9px var(--neu-sl)`
            : status === 'done'
            ? `3px 3px 8px ${color}55, -2px -2px 6px rgba(255,252,248,0.9)`
            : '4px 4px 12px var(--neu-sd), -3px -3px 9px var(--neu-sl)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.35s',
          position: 'relative',
        }}>
          {status === 'running' && (
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px solid ${color}44`, animation: 'ripple 1.2s ease-out infinite' }} />
          )}
          {status === 'done'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            : status === 'running'
            ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, animation: 'glow 0.9s ease-in-out infinite' }} />
            : <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-light)' }}>{number}</span>
          }
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 18, background: status === 'done' ? `linear-gradient(${color}, ${color}22)` : 'var(--sand-dark)', opacity: status === 'done' ? 0.5 : 0.25, marginTop: 4, borderRadius: 2 }} />}
      </div>

      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: content ? 10 : 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)' }}>{label}</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontStyle: 'italic' }}>{sublabel}</span>
          {status === 'running' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', fontWeight: 600, color: color, background: `${color}15`, padding: '2px 9px', borderRadius: 100, letterSpacing: '0.05em' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, animation: 'glow 0.7s ease-in-out infinite' }} />
              STREAMING
            </span>
          )}
          {status === 'done' && (
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#7AAA88', background: 'rgba(122,170,136,0.12)', padding: '2px 9px', borderRadius: 100, letterSpacing: '0.05em' }}>
              ✓ COMPLETE
            </span>
          )}
        </div>
        {(content || status === 'running') && (
          <div className="neu-inset" ref={ref} style={{ padding: '12px 16px', maxHeight: 120, overflowY: 'auto' }}>
            <p style={{ fontSize: '0.77rem', color: 'var(--text-mid)', lineHeight: 1.65, margin: 0 }}>
              {content}
              {status === 'running' && (
                <span style={{ display: 'inline-block', width: 2, height: '0.9em', background: color, marginLeft: 2, animation: 'glow 0.7s ease-in-out infinite', verticalAlign: 'text-bottom', borderRadius: 1 }} />
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SIGNAL METER ─────────────────────────────────────────────────
const SignalMeter: React.FC<{ label: string; value: number; benchmark?: number; color: string }> = ({ label, value, benchmark, color }) => {
  const pct = Math.round(value * 100);
  const isAbove = benchmark ? value > benchmark : value > 0.5;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {benchmark && (
            <span style={{ fontSize: '0.62rem', color: 'var(--text-light)' }}>avg {Math.round(benchmark * 100)}%</span>
          )}
          <span style={{ fontSize: '0.73rem', fontWeight: 700, color: isAbove ? '#7AAA88' : '#C88080' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 100, background: 'var(--sand-dark)', overflow: 'visible', position: 'relative', opacity: 0.85 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 100, transition: 'width 0.8s ease' }} />
        {benchmark && (
          <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${Math.round(benchmark * 100)}%`, width: 2, background: 'var(--text-light)', borderRadius: 1, opacity: 0.5 }} />
        )}
      </div>
    </div>
  );
};

// ─── RESULT CARD ──────────────────────────────────────────────────
const DiagnosisResultCard: React.FC<{ result: DiagnosisResult; listing: RealListing | null }> = ({ result, listing }) => {
  const cfg = DIAG_CONFIG[result.diagnosisType] || DIAG_CONFIG.PERCEPTION;
  const urg = URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.HIGH;

  return (
    <div style={{ animation: 'fadeUp 0.5s ease', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Verdict Header ── */}
      <div style={{
        padding: '22px 24px',
        background: cfg.gradient,
        borderRadius: 'var(--r-lg)',
        border: `1.5px solid ${cfg.border}`,
        boxShadow: `0 4px 20px ${cfg.color}18`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `linear-gradient(145deg, ${cfg.color}33, ${cfg.color}18)`,
              border: `1.5px solid ${cfg.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
              boxShadow: `3px 3px 10px ${cfg.color}22`,
              flexShrink: 0,
            }}>{cfg.icon}</div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: cfg.color, textTransform: 'uppercase', marginBottom: 3 }}>ROOT CAUSE DIAGNOSIS</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>{cfg.label}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ padding: '5px 14px', background: urg.bg, borderRadius: 100, border: `1px solid ${urg.color}33` }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.09em', color: urg.color }}>{urg.label} URGENCY</span>
            </div>
            <div style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.45)', borderRadius: 100, boxShadow: '2px 2px 6px var(--neu-sd),-1px -1px 4px var(--neu-sl)' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dark)' }}>{result.confidence}% confidence</span>
            </div>
          </div>
        </div>

        {/* Primary signal callout */}
        <div style={{ padding: '11px 16px', background: `${cfg.color}14`, borderRadius: 'var(--r-md)', borderLeft: `3px solid ${cfg.color}`, marginBottom: 14 }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', color: cfg.color, textTransform: 'uppercase', marginBottom: 4 }}>PRIMARY SIGNAL DETECTED</div>
          <p style={{ fontSize: '0.80rem', fontWeight: 500, color: 'var(--text-dark)', lineHeight: 1.55, margin: 0 }}>{result.primarySignal}</p>
        </div>

        <p style={{ fontSize: '0.83rem', color: 'var(--text-mid)', lineHeight: 1.68, margin: 0 }}>{result.reasoning}</p>
      </div>

      {/* ── Action Plan ── */}
      <div style={{
        padding: '20px 22px',
        background: 'var(--neu-bg)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '5px 5px 14px var(--neu-sd), -4px -4px 10px var(--neu-sl)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase' }}>Prescribed Action Plan</span>
          <div style={{ marginLeft: 'auto', fontSize: '0.70rem', fontWeight: 600, color: result.holdPrice ? '#7AAA88' : '#C88080',
            padding: '3px 10px', borderRadius: 100,
            background: result.holdPrice ? 'rgba(122,170,136,0.12)' : 'rgba(200,128,128,0.12)',
            border: `1px solid ${result.holdPrice ? 'rgba(122,170,136,0.25)' : 'rgba(200,128,128,0.25)'}`,
          }}>
            {result.holdPrice ? '🔒 HOLD PRICE' : '↓ PRICE ADJUSTMENT'}
          </div>
        </div>

        {/* Immediate action */}
        <div style={{ padding: '12px 16px', background: `${cfg.color}0C`, borderRadius: 'var(--r-md)', marginBottom: 14, border: `1px solid ${cfg.border}` }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: cfg.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>→ DO NOW</div>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.55, margin: 0 }}>{result.action}</p>
        </div>

        {/* Step-by-step */}
        {result.actionSteps && result.actionSteps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {result.actionSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(145deg, ${cfg.color}44, ${cfg.color}22)`,
                  border: `1px solid ${cfg.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                }}>
                  <span style={{ fontSize: '0.60rem', fontWeight: 800, color: cfg.accent }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-mid)', lineHeight: 1.55, margin: 0, paddingTop: 2 }}>{step}</p>
              </div>
            ))}
          </div>
        )}

        {/* Expected outcome */}
        {result.expectedOutcome && (
          <div style={{ padding: '10px 14px', background: 'rgba(122,170,136,0.08)', borderRadius: 'var(--r-md)', border: '1px solid rgba(122,170,136,0.2)' }}>
            <div style={{ fontSize: '0.61rem', fontWeight: 700, color: '#5A8A68', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>↑ Expected Outcome</div>
            <p style={{ fontSize: '0.77rem', color: 'var(--text-dark)', lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{result.expectedOutcome}</p>
          </div>
        )}
      </div>

      {/* ── Revenue Impact ── */}
      <div style={{
        padding: '18px 22px',
        background: 'linear-gradient(145deg, rgba(58,53,48,0.06), rgba(58,53,48,0.02))',
        borderRadius: 'var(--r-lg)',
        border: '1.5px solid rgba(58,53,48,0.10)',
        boxShadow: '4px 4px 12px var(--neu-sd), -3px -3px 8px var(--neu-sl)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-mid)' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase' }}>Revenue Impact Analysis</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{result.revenueImpact}</p>
      </div>

      {/* ── Signal breakdown if listing available ── */}
      {listing && (
        <div style={{ padding: '18px 22px', background: 'var(--neu-bg)', borderRadius: 'var(--r-lg)', boxShadow: '5px 5px 14px var(--neu-sd), -4px -4px 10px var(--neu-sl)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 14 }}>Signal Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0 20px' }}>
            <SignalMeter label="Click-Through Rate" value={listing.ctr} benchmark={0.45} color={cfg.color} />
            <SignalMeter label="Inquiry Rate" value={listing.inquiryRate} benchmark={0.28} color={cfg.color} />
            <SignalMeter label="Save Rate" value={listing.saveRate} benchmark={0.18} color={cfg.color} />
            <SignalMeter label="Tour Conversion" value={listing.tourConversion} benchmark={0.32} color={cfg.color} />
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-dark)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { k: 'Days on Market', v: `${listing.daysOnMarket}d`, flag: listing.daysOnMarket > 25 },
              { k: 'vs FMV', v: `${listing.listedPrice > listing.estimatedFMV ? '+' : ''}${((listing.listedPrice - listing.estimatedFMV) / listing.estimatedFMV * 100).toFixed(1)}%`, flag: Math.abs(listing.listedPrice - listing.estimatedFMV) / listing.estimatedFMV > 0.06 },
              { k: 'Price Drops', v: listing.priceDropCount > 0 ? `${listing.priceDropCount} drops` : 'None', flag: listing.priceDropCount > 1 },
              { k: 'Lead Photo', v: listing.leadPhotoType.replace(/_/g, ' '), flag: listing.leadPhotoType === 'bathroom' },
            ].map(item => (
              <div key={item.k} style={{ padding: '5px 12px', background: item.flag ? 'rgba(200,128,128,0.10)' : 'rgba(255,255,255,0.45)', borderRadius: 100, border: item.flag ? '1px solid rgba(200,128,128,0.22)' : '1px solid transparent', boxShadow: item.flag ? 'none' : '2px 2px 5px var(--neu-sd)' }}>
                <span style={{ fontSize: '0.61rem', color: 'var(--text-light)' }}>{item.k} </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: item.flag ? '#C88080' : 'var(--text-dark)' }}>{item.v}</span>
                {item.flag && <span style={{ marginLeft: 4, fontSize: '0.62rem' }}>⚠</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PRE-BADGE ───────────────────────────────────────────────────
function getPreBadge(l: RealListing) {
  const highCtrLowInq = l.ctr > 0.58 && l.inquiryRate < 0.18;
  const priceIssue    = l.listedPrice > l.estimatedFMV * 1.07 && l.daysOnMarket > 18;
  const latent        = l.saveRate > 0.26 && l.listedPrice < l.estimatedFMV * 0.97;
  if (highCtrLowInq) return DIAG_CONFIG.PERCEPTION;
  if (priceIssue)    return DIAG_CONFIG.PRICE;
  if (latent)        return DIAG_CONFIG.LATENT;
  return { label: 'Healthy', icon: '✓', color: '#7AAABE', bg: 'rgba(122,170,190,0.06)', border: 'rgba(122,170,190,0.18)', accent: '#5A8A9E', tagBg: 'rgba(122,170,190,0.12)', gradient: '' };
}

// ─── LISTING CARD ─────────────────────────────────────────────────
const ListingCard: React.FC<{ l: RealListing; isSelected: boolean; onClick: () => void }> = ({ l, isSelected, onClick }) => {
  const badge = getPreBadge(l);
  const priceDiff = ((l.listedPrice - l.estimatedFMV) / l.estimatedFMV * 100).toFixed(1);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const validPhotos = l.photos?.filter((_, i) => !imgErrors[i]) || [];

  return (
    <button onClick={onClick} style={{
      background: isSelected ? badge.bg : 'var(--neu-bg)',
      border: `1.5px solid ${isSelected ? badge.color + '44' : 'transparent'}`,
      borderRadius: 'var(--r-md)', padding: 0, textAlign: 'left', cursor: 'pointer',
      boxShadow: isSelected
        ? `inset 3px 3px 8px var(--neu-id), inset -2px -2px 6px var(--neu-il), 0 0 0 1px ${badge.color}22`
        : '4px 4px 12px var(--neu-sd), -3px -3px 9px var(--neu-sl)',
      transition: 'all 0.22s', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Photo area ── */}
      <div style={{ position: 'relative', height: 88, overflow: 'hidden', background: `linear-gradient(135deg, ${badge.color}22, ${badge.color}0A)`, flexShrink: 0 }}>
        {validPhotos.length > 0 ? (
          <div style={{ display: 'flex', height: '100%', gap: 2 }}>
            {/* Main photo */}
            <div style={{ flex: 2, overflow: 'hidden', position: 'relative' }}>
              <img
                src={validPhotos[0]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={() => setImgErrors(e => ({ ...e, 0: true }))}
              />
              {l.leadPhotoType === 'bathroom' && (
                <div style={{ position: 'absolute', bottom: 4, left: 6, padding: '2px 7px', background: 'rgba(200,128,128,0.88)', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                  <span style={{ fontSize: '0.56rem', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>⚠ BATHROOM LEAD</span>
                </div>
              )}
            </div>
            {/* Side photos */}
            {validPhotos.length > 1 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {validPhotos.slice(1, 3).map((url, pi) => (
                  <div key={pi} style={{ flex: 1, overflow: 'hidden' }}>
                    <img
                      src={url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={() => setImgErrors(e => ({ ...e, [pi + 1]: true }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <div style={{ fontSize: '1.4rem', opacity: 0.6 }}>🏠</div>
            <span style={{ fontSize: '0.58rem', color: badge.color, fontWeight: 600, letterSpacing: '0.06em' }}>
              {l.photoCount} PHOTOS · {l.leadPhotoType.replace(/_/g, ' ').toUpperCase()} LEAD
            </span>
          </div>
        )}

        {/* Photo count badge */}
        {validPhotos.length > 0 && (
          <div style={{ position: 'absolute', top: 6, right: 6, padding: '2px 7px', background: 'rgba(0,0,0,0.45)', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>📷 {l.photoCount}</span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div style={{ padding: '11px 13px', flex: 1 }}>
        {/* Price row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>
              ${l.listedPrice.toLocaleString()}<span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-light)' }}>/mo</span>
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-mid)', marginTop: 2 }}>
              {l.beds}bd / {l.baths}ba · {l.sqft.toLocaleString()} sqft
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ fontSize: '0.60rem', fontWeight: 800, color: badge.color, background: badge.tagBg, padding: '2px 8px', borderRadius: 100 }}>{badge.label.toUpperCase()}</span>
            <span style={{ fontSize: '0.62rem', color: Number(priceDiff) > 5 ? '#C88080' : Number(priceDiff) < -5 ? '#7AAA88' : 'var(--text-light)', fontWeight: 600 }}>
              {Number(priceDiff) >= 0 ? '+' : ''}{priceDiff}% FMV
            </span>
          </div>
        </div>

        {/* Address */}
        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginBottom: 9, lineHeight: 1.35 }}>
          {l.address.split(',')[0]}
        </div>

        {/* Signal bars — compact 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: 8 }}>
          {[
            { k: 'CTR',     v: l.ctr,            hi: 0.55 },
            { k: 'Inquiry', v: l.inquiryRate,     hi: 0.28 },
            { k: 'Saves',   v: l.saveRate,        hi: 0.20 },
            { k: 'Tours',   v: l.tourConversion,  hi: 0.30 },
          ].map(sig => (
            <div key={sig.k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-light)' }}>{sig.k}</span>
                <span style={{ fontSize: '0.60rem', fontWeight: 700, color: sig.v > sig.hi ? '#7AAA88' : sig.v < sig.hi * 0.55 ? '#C88080' : 'var(--text-mid)' }}>{Math.round(sig.v * 100)}%</span>
              </div>
              <div style={{ height: 3, borderRadius: 100, background: 'var(--sand-dark)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(sig.v * 100)}%`, height: '100%', background: sig.v > sig.hi ? '#7AAA88' : sig.v < sig.hi * 0.55 ? '#C88080' : '#A8C4D4', borderRadius: 100 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer meta */}
        <div style={{ display: 'flex', gap: 8, fontSize: '0.61rem', color: 'var(--text-light)', flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid var(--sand-dark)', opacity: 0.85 }}>
          <span>{l.daysOnMarket}d on market</span>
          {l.priceDropCount > 0 && <span style={{ color: '#C88080', fontWeight: 600 }}>↓{l.priceDropCount} price drops</span>}
        </div>
      </div>
    </button>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────
const DiagnosisEngine: React.FC = () => {
  // API key — persisted in localStorage so it survives page refresh
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('percept_groq_key') || '';
  });
  const saveKey = (k: string) => { setApiKey(k); localStorage.setItem('percept_groq_key', k); };

  const [zipCode, setZipCode]       = useState('80205');
  const [marketData, setMarketData] = useState<MarketSummary | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [selectedListing, setSelectedListing] = useState<RealListing | null>(null);
  const [propertyInput, setPropertyInput]   = useState('');
  const [behavioralInput, setBehavioralInput] = useState('');
  const [marketInput, setMarketInput]     = useState('');
  const [nodeStatus,  setNodeStatus]  = useState<Record<string, NodeStatus>>({ ingest: 'idle', behavioral: 'idle', diagnosis: 'idle' });
  const [nodeContent, setNodeContent] = useState({ ingest: '', behavioral: '', diagnosis: '' });
  const [result,  setResult]  = useState<DiagnosisResult | null>(null);
  const [running, setRunning] = useState(false);
  const [diagError, setDiagError] = useState('');

  const resetPipeline = () => {
    setNodeStatus({ ingest: 'idle', behavioral: 'idle', diagnosis: 'idle' });
    setNodeContent({ ingest: '', behavioral: '', diagnosis: '' });
    setResult(null);
    setDiagError('');
  };

  const fetchZip = async () => {
    if (!zipCode.match(/^\d{5}$/)) { setMarketError('Enter a 5-digit zip code'); return; }
    setMarketError(''); setLoadingMarket(true); setMarketData(null);
    setSelectedListing(null); setPropertyInput(''); setBehavioralInput(''); setMarketInput('');
    resetPipeline();
    try {
      const data = await fetchMarketData(zipCode);
      setMarketData(data);
    } catch (e: any) {
      setMarketError(`Could not load market data. Check your Groq key in .env`);
    } finally { setLoadingMarket(false); }
  };

  const selectListing = (l: RealListing) => {
    setSelectedListing(l); resetPipeline();
    if (marketData) {
      const pStr = buildPropertyString(l);
      const bStr = buildBehavioralString(l);
      const mStr = buildMarketString(l, marketData);
      setPropertyInput(pStr);
      setBehavioralInput(bStr);
      setMarketInput(mStr);
      // Auto-run diagnosis immediately
      setTimeout(() => runAnalysisWithData(pStr, bStr, mStr), 80);
    }
  };

  const runAnalysisWithData = async (pInput: string, bInput: string, mInput: string) => {
    if (!pInput.trim()) return;
    setRunning(true); setResult(null); setDiagError('');
    setNodeStatus({ ingest: 'running', behavioral: 'idle', diagnosis: 'idle' });
    setNodeContent({ ingest: '', behavioral: '', diagnosis: '' });
    try {
      const res = await runDiagnosis(
        pInput, bInput, mInput,
        (node) => {
          if (node === 'Behavioral') setNodeStatus(s => ({ ...s, ingest: 'done', behavioral: 'running' }));
          if (node === 'Diagnosis')  setNodeStatus(s => ({ ...s, behavioral: 'done', diagnosis: 'running' }));
        },
        (token, node) => {
          const k = node === 'Ingest' ? 'ingest' : node === 'Behavioral' ? 'behavioral' : 'diagnosis';
          if (k === 'diagnosis') {
            // Show accumulating JSON tokens as a live "thinking" indicator — count chars received
            setNodeContent(c => {
              const current = c.diagnosis;
              const len = current.replace(/[^{}",:]/g, '').length;
              const phases = ['Parsing behavioral signals...', 'Running differential diagnosis...', 'Classifying root cause...', 'Computing confidence score...', 'Building action plan...'];
              return { ...c, diagnosis: phases[Math.min(Math.floor(len / 8), phases.length - 1)] };
            });
          } else {
            setNodeContent(c => ({ ...c, [k]: c[k as keyof typeof c] + token }));
          }
        }
      );
      setNodeStatus({ ingest: 'done', behavioral: 'done', diagnosis: 'done' });
      setNodeContent(c => ({ ...c, diagnosis: res.primarySignal || 'Root cause classified.' }));
      setResult(res);
    } catch (err: any) {
      setNodeStatus({ ingest: 'idle', behavioral: 'idle', diagnosis: 'idle' });
      setDiagError(err?.message || String(err));
    } finally { setRunning(false); }
  };

  const runAnalysis = () => runAnalysisWithData(propertyInput, behavioralInput, marketInput);

  return (
    <section id="engine" style={{ padding: 'clamp(56px, 8vw, 80px) clamp(16px, 4vw, 24px)', maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
      <div className="blob blob-blue fb"   style={{ width: 340, height: 280, bottom: 80,  left: -70,  opacity: 0.35, zIndex: 0 }} />
      <div className="blob blob-blush fc"  style={{ width: 200, height: 170, top: 120,   right: -20, opacity: 0.33, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Key Banner ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            background: apiKey ? 'rgba(122,170,136,0.09)' : 'rgba(212,168,112,0.13)',
            borderRadius: 'var(--r-lg)',
            border: `1.5px solid ${apiKey ? 'rgba(122,170,136,0.28)' : 'rgba(212,168,112,0.38)'}`,
            boxShadow: '4px 4px 12px var(--neu-sd), -3px -3px 9px var(--neu-sl)',
            flexWrap: 'wrap' as const,
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: apiKey ? 'linear-gradient(145deg,#90C898,#6AAA78)' : 'linear-gradient(145deg,#E8C870,#D4A840)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: apiKey ? '3px 3px 8px rgba(100,160,110,0.35)' : '3px 3px 8px rgba(180,140,50,0.35)',
            }}>
              <span style={{ fontSize: '0.9rem' }}>{apiKey ? '✓' : '⚡'}</span>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: apiKey ? '#3A6A48' : '#8A6820', marginBottom: 5 }}>
                {apiKey ? 'Groq API active — paste a new key below to replace' : 'Groq API Key Required — free at console.groq.com'}
              </div>
              <input
                className="input-neu"
                type="password"
                value={apiKey}
                onChange={e => saveKey(e.target.value.trim())}
                onPaste={e => {
                  const v = e.clipboardData.getData('text').trim();
                  if (v) { saveKey(v); e.preventDefault(); }
                }}
                placeholder="Paste your gsk_... key here"
                style={{ width: '100%', fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-dark)' }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {apiKey && (
              <button onClick={() => saveKey('')} style={{ background: 'rgba(200,128,128,0.10)', border: '1px solid rgba(200,128,128,0.22)', borderRadius: 8, cursor: 'pointer', fontSize: '0.68rem', color: '#C08080', padding: '6px 14px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>Clear</button>
            )}
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 44 }}>
          <div className="neu-pill-raised" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', marginBottom: 18 }}>
            <div className="dot d-blue" />
            <span style={{ fontSize: '0.70rem', fontWeight: 600, letterSpacing: '0.09em', color: 'var(--text-mid)' }}>DIAGNOSIS ENGINE · LANGGRAPH · LIVE STREAMING</span>
          </div>
          <h2 style={{ marginBottom: 12 }}>Real market data. Live reasoning.</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 580, fontSize: '0.90rem', lineHeight: 1.65 }}>
            Three steps: load a market → pick a property → watch all 3 pipeline nodes stream token-by-token. Listings are LLM-generated against real Denver market profiles. The diagnosis pipeline is real — three separate calls, each reasoning over the previous node's output.
          </p>
        </div>

        {/* ══ STEP 1 ══ */}
        <div className="neu-raised-sm" style={{ padding: '22px 24px', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(145deg,#BACED8,#7AAABE)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 8px rgba(100,155,178,0.4)', flexShrink: 0 }}>
              <span style={{ fontSize: '0.73rem', fontWeight: 800, color: 'white' }}>1</span>
            </div>
            <div>
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-dark)' }}>Load Market</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: 8 }}>generate synthetic listings for any Denver zip</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Zip Code</label>
              <input className="input-neu" value={zipCode} onChange={e => setZipCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchZip()} placeholder="80205" style={{ width: 120 }} />
            </div>
            <button className="btn btn-blue" onClick={fetchZip} disabled={loadingMarket}>
              {loadingMarket
                ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} /> Loading...</>
                : <>Pull Listings <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
            {marketError && <span style={{ fontSize: '0.76rem', color: '#C88080' }}>{marketError}</span>}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DENVER_ZIPS.map(z => (
              <button key={z} className="btn btn-sm"
                style={{ fontSize: '0.67rem', padding: '5px 12px', boxShadow: zipCode === z ? 'inset 3px 3px 8px var(--neu-id),inset -2px -2px 6px var(--neu-il)' : undefined }}
                onClick={() => setZipCode(z)}>{z}</button>
            ))}
          </div>

          {marketData && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--sand-dark)' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Market', value: marketData.cityNeighborhood },
                  { label: 'Median Rent', value: `$${marketData.medianRent.toLocaleString()}` },
                  { label: 'Avg DOM', value: `${marketData.avgDaysOnMarket}d` },
                  { label: 'Demand', value: marketData.demandTrend.toUpperCase() },
                  { label: 'Vacancy', value: `${marketData.vacancyRate}%` },
                  { label: 'Active', value: `${marketData.activeListings} listings` },
                ].map(s => (
                  <div key={s.label} className="neu-pill-raised" style={{ padding: '5px 14px' }}>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-light)' }}>{s.label} </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ STEP 2 ══ */}
        {marketData && (
          <div className="neu-raised-sm" style={{ padding: '22px 24px', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(145deg,#BACEC0,#7AAA88)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 8px rgba(100,160,120,0.4)', flexShrink: 0 }}>
                <span style={{ fontSize: '0.73rem', fontWeight: 800, color: 'white' }}>2</span>
              </div>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-dark)' }}>Select a Property</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: 8 }}>{marketData.listings.length} listings in {marketData.zipCode}</span>
              </div>
            </div>
            <div className="listing-grid-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
              {marketData.listings.map(l => (
                <ListingCard key={l.id} l={l} isSelected={selectedListing?.id === l.id} onClick={() => selectListing(l)} />
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 3 ══ */}
        {selectedListing && (
          <div className="neu-raised-sm" style={{ padding: '22px 24px' }}>
            <div className="step3-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26, flexWrap: 'wrap' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(145deg,#D8D0E8,#9888B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 8px rgba(152,136,184,0.4)', flexShrink: 0 }}>
                <span style={{ fontSize: '0.73rem', fontWeight: 800, color: 'white' }}>3</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-dark)' }}>Run Diagnosis</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: 8 }}>LangGraph · 3 nodes · live stream</span>
              </div>
              <button className="btn btn-blue" style={{ padding: '11px 28px', fontSize: '0.88rem', fontWeight: 600 }}
                onClick={runAnalysis} disabled={running || !propertyInput.trim()}>
                {running
                  ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} /> Diagnosing...</>
                  : <>Run Diagnosis <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                }
              </button>
            </div>

            {diagError && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(200,128,128,0.10)', borderRadius: 'var(--r-md)', border: '1px solid rgba(200,128,128,0.22)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#C88080', marginBottom: 4 }}>⚠ Diagnosis Error</div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-mid)', margin: 0 }}>{diagError}</p>
              </div>
            )}

            {/* ── TWO COLUMN LAYOUT ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, alignItems: "start" }}>

              {/* ══ LEFT: VISUAL SIGNAL PANEL ══ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Property identity card */}
                <div style={{ padding: '16px 18px', background: 'linear-gradient(145deg,rgba(122,170,190,0.10),rgba(122,170,190,0.04))', borderRadius: 'var(--r-lg)', border: '1px solid rgba(122,170,190,0.20)', boxShadow: '4px 4px 10px var(--neu-sd), -3px -3px 8px var(--neu-sl)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#7AAABE', textTransform: 'uppercase', marginBottom: 4 }}>Selected Unit</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>${selectedListing.listedPrice.toLocaleString()}<span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-light)' }}>/mo</span></div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-mid)', marginTop: 3 }}>{selectedListing.beds}bd · {selectedListing.baths}ba · {selectedListing.sqft.toLocaleString()} sqft</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', marginBottom: 3 }}>{selectedListing.daysOnMarket}d on market</div>
                      {selectedListing.priceDropCount > 0 && <div style={{ fontSize: '0.62rem', color: '#C88080', fontWeight: 600 }}>↓ {selectedListing.priceDropCount} price drop{selectedListing.priceDropCount > 1 ? 's' : ''}</div>}
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', marginTop: 3 }}>{selectedListing.neighborhood}</div>
                    </div>
                  </div>
                  {/* FMV gap bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>vs Estimated FMV</span>
                      <span style={{ fontSize: '0.70rem', fontWeight: 700, color: Math.abs(selectedListing.listedPrice - selectedListing.estimatedFMV) / selectedListing.estimatedFMV > 0.06 ? '#C88080' : '#7AAA88' }}>
                        {selectedListing.listedPrice >= selectedListing.estimatedFMV ? '+' : ''}{((selectedListing.listedPrice - selectedListing.estimatedFMV) / selectedListing.estimatedFMV * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 100, background: 'var(--sand-dark)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: `${Math.min(Math.abs(selectedListing.listedPrice - selectedListing.estimatedFMV) / selectedListing.estimatedFMV * 300, 50)}%`, background: selectedListing.listedPrice >= selectedListing.estimatedFMV ? 'linear-gradient(90deg,#D4A870,#C88060)' : 'linear-gradient(90deg,#7AAABE,#7AAA88)', borderRadius: 100 }} />
                      <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 2, background: 'var(--text-mid)', opacity: 0.3 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-light)' }}>Below FMV</span>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-light)' }}>FMV</span>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-light)' }}>Above FMV</span>
                    </div>
                  </div>
                </div>

                {/* Signal heatmap */}
                <div style={{ padding: '16px 18px', background: 'var(--neu-bg)', borderRadius: 'var(--r-lg)', boxShadow: '5px 5px 14px var(--neu-sd), -4px -4px 10px var(--neu-sl)' }}>
                  <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.09em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 14 }}>Behavioral Signal Heatmap</div>
                  {[
                    { label: 'Click-Through Rate', val: selectedListing.ctr, bench: 0.45, key: 'ctr' },
                    { label: 'Inquiry Rate',       val: selectedListing.inquiryRate, bench: 0.28, key: 'inq' },
                    { label: 'Save Rate',          val: selectedListing.saveRate, bench: 0.18, key: 'save' },
                    { label: 'Tour Conversion',    val: selectedListing.tourConversion, bench: 0.32, key: 'tour' },
                    { label: 'Demand Velocity',    val: selectedListing.demandVelocity, bench: 0.65, key: 'vel' },
                    { label: 'Vacancy Risk',       val: 1 - selectedListing.vacancyRisk, bench: 0.5, key: 'vac' },
                  ].map(sig => {
                    const pct = Math.round(sig.val * 100);
                    const benchPct = Math.round(sig.bench * 100);
                    const ratio = sig.val / sig.bench;
                    const heat = ratio > 1.3 ? '#7AAA88' : ratio > 0.85 ? '#A8C4B0' : ratio > 0.6 ? '#D4A870' : '#C88080';
                    const heatBg = ratio > 1.3 ? 'rgba(122,170,136,0.12)' : ratio > 0.85 ? 'rgba(168,196,176,0.10)' : ratio > 0.6 ? 'rgba(212,168,112,0.12)' : 'rgba(200,128,128,0.10)';
                    return (
                      <div key={sig.key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-mid)', fontWeight: 500 }}>{sig.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.60rem', color: 'var(--text-light)' }}>avg {benchPct}%</span>
                            <div style={{ padding: '1px 8px', borderRadius: 100, background: heatBg, border: `1px solid ${heat}44` }}>
                              <span style={{ fontSize: '0.66rem', fontWeight: 700, color: heat }}>{pct}%</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ height: 8, borderRadius: 100, background: 'var(--sand-dark)', position: 'relative', overflow: 'visible' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${heat}66,${heat})`, borderRadius: 100, transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)', maxWidth: '100%' }} />
                          <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${benchPct}%`, width: 2, background: 'var(--text-mid)', borderRadius: 1, opacity: 0.35 }} />
                        </div>
                      </div>
                    );
                  })}
                  {/* Lead photo flag */}
                  {selectedListing.leadPhotoType === 'bathroom' && (
                    <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(200,128,128,0.10)', borderRadius: 'var(--r-md)', border: '1px solid rgba(200,128,128,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.85rem' }}>⚠️</span>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#C88080' }}>BATHROOM LEAD PHOTO DETECTED</div>
                        <div style={{ fontSize: '0.60rem', color: 'var(--text-light)' }}>Suppresses inquiry rate 30–40% vs living room lead</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTR vs Inquiry gap gauge */}
                <div style={{ padding: '16px 18px', background: 'var(--neu-bg)', borderRadius: 'var(--r-lg)', boxShadow: '5px 5px 14px var(--neu-sd), -4px -4px 10px var(--neu-sl)' }}>
                  <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.09em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 14 }}>Perception Gap Analysis</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    {/* CTR circle */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <svg viewBox="0 0 80 80" width="80" height="80" style={{ display: 'block', margin: '0 auto' }}>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="var(--sand-dark)" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#7AAABE" strokeWidth="8"
                          strokeDasharray={`${Math.round(selectedListing.ctr * 201)} 201`}
                          strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
                        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-dark)">{Math.round(selectedListing.ctr * 100)}%</text>
                      </svg>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>CTR</div>
                    </div>
                    {/* Gap arrow */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ fontSize: '0.70rem', fontWeight: 800, color: Math.round((selectedListing.ctr - selectedListing.inquiryRate) * 100) > 20 ? '#C88080' : '#7AAA88' }}>
                        {Math.round((selectedListing.ctr - selectedListing.inquiryRate) * 100)}pp gap
                      </div>
                      <svg width="32" height="12" viewBox="0 0 32 12"><path d="M0 6h28M22 1l6 5-6 5" stroke={Math.round((selectedListing.ctr - selectedListing.inquiryRate) * 100) > 20 ? '#C88080' : '#7AAA88'} strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-light)', textAlign: 'center', maxWidth: 60 }}>
                        {Math.round((selectedListing.ctr - selectedListing.inquiryRate) * 100) > 20 ? 'Trust break' : 'Healthy'}
                      </div>
                    </div>
                    {/* Inquiry circle */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <svg viewBox="0 0 80 80" width="80" height="80" style={{ display: 'block', margin: '0 auto' }}>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="var(--sand-dark)" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#9888B8" strokeWidth="8"
                          strokeDasharray={`${Math.round(selectedListing.inquiryRate * 201)} 201`}
                          strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
                        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-dark)">{Math.round(selectedListing.inquiryRate * 100)}%</text>
                      </svg>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>Inquiry Rate</div>
                    </div>
                  </div>
                  {/* Market comp sparkline — real prices from loaded listings */}
                  <div style={{ paddingTop: 12, borderTop: '1px solid var(--sand-dark)' }}>
                    <div style={{ fontSize: '0.61rem', color: 'var(--text-light)', marginBottom: 8, fontWeight: 600 }}>COMP PRICE POSITION</div>
                    {(() => {
                      const comps = marketData ? [...marketData.listings].sort((a, b) => a.listedPrice - b.listedPrice) : [];
                      const allPrices = comps.map(c => c.listedPrice);
                      const minP = Math.min(...allPrices, selectedListing.listedPrice);
                      const maxP = Math.max(...allPrices, selectedListing.listedPrice);
                      const range = maxP - minP || 1;
                      const bars = comps.length > 0 ? comps : [{ listedPrice: selectedListing.listedPrice, id: selectedListing.id }];
                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44 }}>
                          {bars.map((c: any, i: number) => {
                            const isThis = c.id === selectedListing.id || c.listedPrice === selectedListing.listedPrice;
                            const h = Math.max(6, Math.round(((c.listedPrice - minP) / range) * 36) + 8);
                            return (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <div style={{ width: '100%', height: h, borderRadius: '4px 4px 2px 2px', background: isThis ? 'linear-gradient(180deg,#7AAABE,#5A8AA0)' : 'var(--sand-dark)', transition: 'height 0.7s ease', boxShadow: isThis ? '0 2px 8px rgba(122,170,190,0.4)' : 'none', opacity: isThis ? 1 : 0.65 }} />
                                {isThis && <div style={{ fontSize: '0.50rem', color: '#7AAABE', fontWeight: 700, whiteSpace: 'nowrap' }}>THIS</div>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: '0.56rem', color: 'var(--text-light)' }}>Lowest rent</span>
                      <span style={{ fontSize: '0.56rem', color: 'var(--text-light)' }}>Highest rent</span>
                    </div>
                  </div>
                </div>

                {/* Market comps table — appears after diagnosis */}
                {result && marketData && (
                  <div style={{ padding: '16px 18px', background: 'var(--neu-bg)', borderRadius: 'var(--r-lg)', boxShadow: '5px 5px 14px var(--neu-sd), -4px -4px 10px var(--neu-sl)' }}>
                    <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.09em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 14 }}>Market Comp Table</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {[...marketData.listings]
                        .sort((a, b) => a.listedPrice - b.listedPrice)
                        .map((l, i) => {
                          const isThis = l.id === selectedListing?.id;
                          const domFlag = l.daysOnMarket > marketData.avgDaysOnMarket * 1.4;
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                              borderRadius: 'var(--r-md)',
                              background: isThis ? 'rgba(122,170,190,0.12)' : 'transparent',
                              border: isThis ? '1px solid rgba(122,170,190,0.28)' : '1px solid transparent',
                            }}>
                              <div style={{ fontSize: '0.60rem', color: 'var(--text-light)', width: 16, fontWeight: isThis ? 700 : 400 }}>{i + 1}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.67rem', fontWeight: isThis ? 700 : 500, color: isThis ? '#5A8AA0' : 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {l.address.split(',')[0]}
                                  {isThis && <span style={{ marginLeft: 5, fontSize: '0.55rem', fontWeight: 700, color: '#7AAABE', background: 'rgba(122,170,190,0.18)', padding: '1px 5px', borderRadius: 4 }}>THIS</span>}
                                </div>
                                <div style={{ fontSize: '0.59rem', color: 'var(--text-light)', marginTop: 1 }}>{l.beds}bd/{l.baths}ba · {l.sqft}sf</div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dark)' }}>${l.listedPrice.toLocaleString()}</div>
                                <div style={{ fontSize: '0.59rem', color: domFlag ? '#C88080' : 'var(--text-light)', fontWeight: domFlag ? 600 : 400 }}>{l.daysOnMarket}d{domFlag ? ' ⚠' : ''}</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--sand-dark)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.60rem', color: 'var(--text-light)' }}>Market median</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dark)' }}>${marketData.medianRent.toLocaleString()}/mo</span>
                    </div>
                  </div>
                )}

                {/* Revenue recovery calc — appears after diagnosis */}
                {result && selectedListing && (
                  <div style={{ padding: '16px 18px', background: 'linear-gradient(145deg,rgba(122,170,136,0.10),rgba(122,170,136,0.03))', borderRadius: 'var(--r-lg)', border: '1px solid rgba(122,170,136,0.22)', boxShadow: '4px 4px 10px var(--neu-sd), -3px -3px 8px var(--neu-sl)' }}>
                    <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.09em', color: '#5A8A68', textTransform: 'uppercase', marginBottom: 14 }}>Revenue Recovery Estimate</div>
                    {(() => {
                      const vacancyDaysAtCurrent = selectedListing.daysOnMarket;
                      const dailyCost = Math.round(selectedListing.listedPrice / 30);
                      const estResolveDays = result.diagnosisType === 'PERCEPTION' ? 9 : result.diagnosisType === 'LATENT' ? 7 : result.diagnosisType === 'AUDIENCE' ? 12 : 5;
                      const daysSaved = Math.max(0, vacancyDaysAtCurrent - estResolveDays);
                      const recoverable = daysSaved * dailyCost;
                      const annualized = result.diagnosisType === 'LATENT'
                        ? Math.round((selectedListing.estimatedFMV - selectedListing.listedPrice) * 12)
                        : recoverable * 4; // rough annualize
                      const rows = [
                        { label: 'Days on market', value: `${vacancyDaysAtCurrent}d`, flag: vacancyDaysAtCurrent > 20 },
                        { label: 'Daily vacancy cost', value: `$${dailyCost}`, flag: false },
                        { label: 'Est. resolution time', value: `${estResolveDays}d post-fix`, flag: false },
                        { label: 'Recoverable days', value: `${daysSaved}d`, flag: daysSaved > 0 },
                        { label: 'Immediate recovery', value: `$${recoverable.toLocaleString()}`, flag: recoverable > 500 },
                      ];
                      return (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                            {rows.map(r => (
                              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.67rem', color: 'var(--text-light)' }}>{r.label}</span>
                                <span style={{ fontSize: '0.71rem', fontWeight: 700, color: r.flag ? '#5A8A68' : 'var(--text-dark)' }}>{r.value}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ padding: '10px 14px', background: 'rgba(122,170,136,0.14)', borderRadius: 'var(--r-md)', border: '1px solid rgba(122,170,136,0.28)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.60rem', fontWeight: 700, letterSpacing: '0.08em', color: '#5A8A68', marginBottom: 4 }}>ANNUALIZED LEAKAGE IF IGNORED</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3A6A48' }}>${Math.abs(annualized).toLocaleString()}</div>
                            <div style={{ fontSize: '0.60rem', color: '#5A8A68', marginTop: 2 }}>recoverable with correct {result.diagnosisType === 'PERCEPTION' ? 'presentation fix' : result.diagnosisType === 'LATENT' ? 'price adjustment' : result.diagnosisType === 'AUDIENCE' ? 'targeting fix' : 'price reduction'}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

              </div>

              {/* ══ RIGHT: PIPELINE + VERDICT ══ */}
              <div className="diag-right-first" style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

                {/* Pipeline */}
                <div style={{ padding: '18px 20px', background: 'var(--neu-bg)', borderRadius: 'var(--r-lg)', boxShadow: '5px 5px 14px var(--neu-sd), -4px -4px 10px var(--neu-sl)' }}>
                  <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.09em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 18 }}>LangGraph Pipeline — Live</div>
                  <NodeStep number={1} label="Ingest Node"     sublabel="parse & structure signals"    status={nodeStatus.ingest}     content={nodeContent.ingest}     color="#7AAABE" />
                  <NodeStep number={2} label="Behavioral Node" sublabel="identify conversion failure"  status={nodeStatus.behavioral} content={nodeContent.behavioral} color="#7AAA88" />
                  <NodeStep number={3} label="Diagnosis Node"  sublabel="classify root cause & action" status={nodeStatus.diagnosis}  content={nodeContent.diagnosis}  color="#9888B8" isLast />
                </div>

                {/* Verdict */}
                {result && <DiagnosisResultCard result={result} listing={selectedListing} />}

                {/* Idle state */}
                {!result && !running && (
                  <div style={{ padding: '32px 24px', borderRadius: 'var(--r-lg)', border: '1.5px dashed var(--sand-dark)', textAlign: 'center', opacity: 0.55 }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>🧠</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', lineHeight: 1.6 }}>Diagnosis runs automatically on selection<br/>or hit Run Diagnosis to re-run</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!marketData && !loadingMarket && (
          <div style={{ textAlign: 'center', padding: '48px 0', opacity: 0.45 }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>📍</div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-light)' }}>Enter a Denver zip above and click Pull Listings to begin</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DiagnosisEngine;
