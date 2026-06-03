import React, { useState } from 'react';
import { PORTFOLIO, DIAGNOSIS_META, Property, PORTFOLIO_STATS } from '../data/portfolio';

const DiagnosisBadge: React.FC<{ type: Property['diagnosis'] }> = ({ type }) => {
  const meta = DIAGNOSIS_META[type];
  return (
    <span className={`tag ${meta.tagClass}`}>
      <span className={`dot ${meta.dotClass}`} />
      {meta.short}
    </span>
  );
};

const PropertyCard: React.FC<{ property: Property; onClick: () => void }> = ({ property, onClick }) => (
  <div
    className="neu-raised-sm"
    onClick={onClick}
    style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
  >
    {/* Accent stripe */}
    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: DIAGNOSIS_META[property.diagnosis].color, borderRadius: '22px 0 0 22px' }} />

    <div style={{ paddingLeft: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2 }}>{property.address}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{property.beds}bd · {property.baths}ba · {property.sqft.toLocaleString()}sqft</div>
        </div>
        <DiagnosisBadge type={property.diagnosis} />
      </div>

      <div className="divider" style={{ marginBottom: 10 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontFamily: 'var(--f-display)', color: 'var(--text-dark)' }}>${property.listedPrice.toLocaleString()}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{property.daysOnMarket}d on market</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--blush-dark)', fontWeight: 600 }}>-${property.annualLeakage.toLocaleString()}/yr</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>leakage</div>
        </div>
      </div>

      {/* Behavior bars */}
      <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
        {[
          { val: property.clickThroughRate, cls: 'pf-blue', label: 'CTR' },
          { val: property.inquiryRate, cls: 'pf-sage', label: 'INQ' },
          { val: property.saveRate, cls: 'pf-lav', label: 'SAVE' },
        ].map((b, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-light)', marginBottom: 3, textAlign: 'center' }}>{b.label}</div>
            <div className="prog-track">
              <div className={`prog-fill ${b.cls}`} style={{ width: `${b.val}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PropertyDrawer: React.FC<{ property: Property; onClose: () => void }> = ({ property, onClose }) => {
  const meta = DIAGNOSIS_META[property.diagnosis];
  const gap = property.clickThroughRate - property.inquiryRate;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(58,53,48,0.35)', backdropFilter: 'blur(8px)',
      padding: '20px',
    }} onClick={onClose}>
      <div
        className="neu-card"
        style={{ width: '100%', maxWidth: 680, maxHeight: '85vh', overflow: 'auto', padding: '32px', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className="btn btn-sm" onClick={onClose} style={{ position: 'absolute', top: 20, right: 20 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          Close
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <DiagnosisBadge type={property.diagnosis} />
          <h2 style={{ marginTop: 12, fontSize: '1.6rem' }}>{property.address}</h2>
          <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: 4 }}>
            {property.beds}bd · {property.baths}ba · {property.sqft.toLocaleString()} sqft · {property.city}, CO {property.zip}
          </div>
        </div>

        {/* Prices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Listed Price', val: `$${property.listedPrice.toLocaleString()}`, color: 'var(--text-dark)' },
            { label: 'PERCEPT Recommendation', val: `$${property.aiRecommendedPrice.toLocaleString()}`, color: property.aiRecommendedPrice > property.listedPrice ? 'var(--sage-dark)' : 'var(--blush-dark)' },
            { label: 'Annual Leakage', val: `-$${property.annualLeakage.toLocaleString()}`, color: 'var(--blush-dark)' },
          ].map((m, i) => (
            <div key={i} className="neu-inset" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.07em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.4rem', color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* Behavioral exhaust */}
        <div className="neu-inset" style={{ padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 16 }}>Behavioral Exhaust</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Click-Through Rate', val: property.clickThroughRate, cls: 'pf-blue', max: 100 },
              { label: 'Inquiry Rate', val: property.inquiryRate, cls: 'pf-sage', max: 100 },
              { label: 'Tour Conversion', val: property.tourConversionRate, cls: 'pf-blush', max: 100 },
              { label: 'Save Rate', val: property.saveRate, cls: 'pf-lav', max: 100 },
              { label: 'Avg. Time on Listing', val: property.avgTimeOnListing, cls: 'pf-blue', max: 300, suffix: 's' },
              { label: 'Price Drop Count', val: property.priceDropCount, cls: 'pf-blush', max: 5 },
            ].map((b, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-mid)' }}>{b.label}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dark)' }}>{b.val}{b.suffix || '%'}</span>
                </div>
                <div className="prog-track">
                  <div className={`prog-fill ${b.cls}`} style={{ width: `${Math.min(100, (b.val / b.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Perception gap indicator */}
          {gap > 30 && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'linear-gradient(135deg, var(--blush-light), var(--blush))', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="dot d-blush" />
              <span style={{ fontSize: '0.75rem', color: 'var(--blush-dark)', fontWeight: 500 }}>
                Perception gap detected: {gap}-percentile spread between CTR and inquiry rate
              </span>
            </div>
          )}
        </div>

        {/* PERCEPT Diagnosis */}
        <div className={meta.colorClass} style={{ padding: '20px', marginBottom: 20, borderRadius: 'var(--r-lg)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: DIAGNOSIS_META[property.diagnosis].color, textTransform: 'uppercase', marginBottom: 12, filter: 'brightness(0.7)' }}>
            PERCEPT Diagnosis · {property.confidence}% Confidence
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--text-dark)', marginBottom: 14 }}>{property.behaviorInsight}</p>
          <div className="divider" />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-mid)', textTransform: 'uppercase', marginBottom: 8 }}>Recommended Action</div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--text-dark)', fontWeight: 500 }}>{property.actionRecommendation}</p>
          </div>
        </div>

        {/* Signal health */}
        <div className="neu-inset" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 12 }}>Signal Health</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { k: 'Comps in radius', v: `${property.signals.compsInRadius} units` },
              { k: 'Avg comp price', v: `$${property.signals.avgCompPrice.toLocaleString()}` },
              { k: 'Demand velocity', v: `${property.signals.demandVelocity > 0 ? '+' : ''}${property.signals.demandVelocity}%` },
              { k: 'Data freshness', v: `${property.signals.dataFreshness}%` },
            ].map((s, i) => (
              <div key={i} className="neu-pill-raised" style={{ padding: '6px 14px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{s.k}: </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dark)' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Portfolio: React.FC = () => {
  const [selected, setSelected] = useState<Property | null>(null);
  const [filter, setFilter] = useState<Property['diagnosis'] | 'ALL'>('ALL');

  const filtered = filter === 'ALL' ? PORTFOLIO : PORTFOLIO.filter(p => p.diagnosis === filter);

  const counts = {
    ALL: PORTFOLIO.length,
    PERCEPTION: PORTFOLIO.filter(p => p.diagnosis === 'PERCEPTION').length,
    PRICE: PORTFOLIO.filter(p => p.diagnosis === 'PRICE').length,
    AUDIENCE: PORTFOLIO.filter(p => p.diagnosis === 'AUDIENCE').length,
    LATENT: PORTFOLIO.filter(p => p.diagnosis === 'LATENT').length,
  };

  return (
    <section id="portfolio" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      {/* Background blobs */}
      <div className="blob blob-sage fa" style={{ width: 300, height: 260, top: 40, right: -60, opacity: 0.4, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <div style={{ marginBottom: 40 }}>
          <div className="neu-pill-raised" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', marginBottom: 18 }}>
            <div className="dot d-sage" />
            <span style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-mid)' }}>PORTFOLIO INTELLIGENCE</span>
          </div>
          <h2 style={{ marginBottom: 12 }}>Revenue diagnosis across your portfolio</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 520, fontSize: '0.9rem' }}>
            Every underperforming unit classified by root cause — not just flagged by price delta.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Perception Problems', val: PORTFOLIO_STATS.perceptionProblems, cls: 'cc-blush', dot: 'd-blush' },
            { label: 'Price Resistance', val: PORTFOLIO_STATS.priceProblems, cls: 'cc-blue', dot: 'd-blue' },
            { label: 'Audience Mismatch', val: PORTFOLIO_STATS.audienceProblems, cls: 'cc-sage', dot: 'd-sage' },
            { label: 'Latent Demand', val: PORTFOLIO_STATS.latentDemand, cls: 'cc-lav', dot: 'd-lav' },
          ].map((s, i) => (
            <div key={i} className={s.cls} style={{ padding: '16px 18px', borderRadius: 'var(--r-md)' }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', color: 'var(--text-dark)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.06em', color: 'var(--text-mid)', marginTop: 6, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['ALL', 'PERCEPTION', 'PRICE', 'AUDIENCE', 'LATENT'] as const).map(f => (
            <button
              key={f}
              className="btn btn-sm"
              style={{
                boxShadow: filter === f
                  ? 'inset 3px 3px 8px var(--neu-id), inset -2px -2px 6px var(--neu-il)'
                  : undefined,
                color: filter === f ? 'var(--text-dark)' : 'var(--text-mid)',
              }}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? `All (${counts.ALL})` : `${DIAGNOSIS_META[f].short} (${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Property grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} />
          ))}
        </div>

        {/* Total leakage callout */}
        <div className="neu-raised" style={{ marginTop: 32, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 6 }}>Total Annual Leakage Identified</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '2.4rem', color: 'var(--blush-dark)' }}>$4,280,000</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 6 }}>Recoverable with Correct Diagnosis</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '2.4rem', color: 'var(--sage-dark)' }}>$3,840,000</div>
          </div>
        </div>
      </div>

      {selected && <PropertyDrawer property={selected} onClose={() => setSelected(null)} />}
    </section>
  );
};

export default Portfolio;
