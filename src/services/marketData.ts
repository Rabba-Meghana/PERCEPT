// ─────────────────────────────────────────────────────────────────
// PERCEPT Market Data Service — Groq-powered real-feeling listings
// Each pull generates fresh, varied, realistic data via LLM
// ─────────────────────────────────────────────────────────────────

const GROQ_API   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function getGroqKey(): string {
  const injected = (window as any).__PK__ || '';
  if (injected) {
    if (typeof localStorage !== 'undefined') localStorage.setItem('percept_groq_key', injected);
    return injected;
  }
  if (typeof localStorage !== 'undefined') return localStorage.getItem('percept_groq_key') || '';
  return '';
}

// Real property photos from Unsplash (free, no key, reliable CDN)
const PHOTO_POOLS = {
  living_room: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80',
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
    'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=600&q=80',
    'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=600&q=80',
  ],
  bedroom: [
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
  ],
  bathroom: [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317702519?w=600&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
  ],
  exterior: [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    'https://images.unsplash.com/photo-1582407947304-fd86f28f3f4c?w=600&q=80',
  ],
  other: [
    'https://images.unsplash.com/photo-1527359443443-84a48aec73d2?w=600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  ],
};

export interface RealListing {
  id: string;
  address: string;
  neighborhood: string;
  beds: number;
  baths: number;
  sqft: number;
  listedPrice: number;
  estimatedFMV: number;
  daysOnMarket: number;
  priceDropCount: number;
  priceDropTotal: number;
  photoCount: number;
  leadPhotoType: 'bathroom' | 'bedroom' | 'living_room' | 'kitchen' | 'exterior' | 'other';
  photos: string[];
  description: string;
  amenities: string[];
  ctr: number;
  inquiryRate: number;
  saveRate: number;
  tourConversion: number;
  avgTimeOnListing: number;
  demandVelocity: number;
  vacancyRisk: number;
  nearbyComps: number;
  medianCompPrice: number;
  source: string;
}

export interface MarketSummary {
  zipCode: string;
  cityNeighborhood: string;
  medianRent: number;
  avgDaysOnMarket: number;
  activeListings: number;
  demandTrend: 'hot' | 'neutral' | 'cooling' | 'cold';
  vacancyRate: number;
  listings: RealListing[];
  fetchedAt: string;
}

// ─── MARKET PROFILES ─────────────────────────────────────────────
const MARKET_PROFILES: Record<string, { name: string; baseRent: number; hotness: number }> = {
  '80205': { name: 'Five Points / RiNo, Denver CO',  baseRent: 1950, hotness: 0.82 },
  '80203': { name: 'Capitol Hill, Denver CO',         baseRent: 1780, hotness: 0.74 },
  '80206': { name: 'Congress Park, Denver CO',        baseRent: 2200, hotness: 0.79 },
  '80209': { name: 'Washington Park, Denver CO',      baseRent: 2480, hotness: 0.85 },
  '80212': { name: 'Sloan Lake / Edgewater, Denver CO', baseRent: 2050, hotness: 0.78 },
  '80218': { name: 'Cheesman Park, Denver CO',        baseRent: 1860, hotness: 0.71 },
  '80219': { name: 'Barnum / Harvey Park, Denver CO', baseRent: 1420, hotness: 0.60 },
  '80220': { name: 'Montclair / Hale, Denver CO',     baseRent: 2100, hotness: 0.77 },
};

function getProfile(zip: string) {
  return MARKET_PROFILES[zip] || { name: `Denver CO ${zip}`, baseRent: 1900, hotness: 0.72 };
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min: number, max: number): number { return Math.round(min + Math.random() * (max - min)); }
function rndF(min: number, max: number, decimals = 2): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

function assignPhotos(leadType: RealListing['leadPhotoType'], photoCount: number): string[] {
  const pool = [...(PHOTO_POOLS[leadType] || PHOTO_POOLS.other)];
  const others = Object.entries(PHOTO_POOLS)
    .filter(([k]) => k !== leadType)
    .flatMap(([, v]) => v);
  const shuffled = others.sort(() => Math.random() - 0.5);
  const all = [...pool, ...shuffled];
  return all.slice(0, Math.min(photoCount, all.length, 6));
}

// ─── GROQ-POWERED LISTING GENERATION ─────────────────────────────
async function generateListingsViaGroq(
  zipCode: string,
  profile: { name: string; baseRent: number; hotness: number }
): Promise<Partial<RealListing>[]> {
  const apiKey = getGroqKey();

  const timestamp = Date.now(); // ensures uniqueness each call
  const prompt = `Generate 8 realistic rental property listings for ${profile.name} (zip ${zipCode}).
Context: median rent ~$${profile.baseRent}/mo, market hotness ${Math.round(profile.hotness * 100)}%, timestamp ${timestamp}.

Each listing should reflect REAL market conditions for this neighborhood. Include a realistic mix:
- 2 listings with high CTR but low inquiry rate (perception/photo problem)
- 1 listing with price above FMV and slow DOM (price resistance)
- 1 listing with high save rate and underpriced (latent demand)
- 4 listings with varied healthy/mixed signals

Return ONLY a valid JSON array of 8 objects. No markdown, no explanation:
[{
  "address": "1234 Market St, Unit 4B, Denver CO 80205",
  "neighborhood": "RiNo",
  "beds": 2,
  "baths": 1,
  "sqft": 850,
  "listedPrice": 1950,
  "estimatedFMV": 1980,
  "daysOnMarket": 22,
  "priceDropCount": 1,
  "priceDropTotal": 75,
  "photoCount": 11,
  "leadPhotoType": "bathroom",
  "description": "Bright 2BR with exposed brick and updated kitchen. Steps from top-rated restaurants and the light rail.",
  "amenities": ["In-unit laundry", "Rooftop deck", "Bike storage"],
  "ctr": 0.71,
  "inquiryRate": 0.12,
  "saveRate": 0.22,
  "tourConversion": 0.19,
  "avgTimeOnListing": 4.2,
  "demandVelocity": 0.61,
  "vacancyRisk": 0.68,
  "nearbyComps": 14,
  "medianCompPrice": 1960
}]

Rules:
- Vary bed counts: mix of 1/2/3 beds realistic for ${profile.name}
- Prices must vary ±15% around $${profile.baseRent} base
- leadPhotoType must be one of: bathroom, bedroom, living_room, kitchen, exterior, other
- Listings with bathroom lead should have high CTR (0.60–0.78) + low inquiryRate (0.08–0.18)
- daysOnMarket: hot market = 5–18d, slow listings = 25–55d
- All numbers must be realistic and internally consistent
- addresses must look real for Denver`;

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2400,
      temperature: 0.85,
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '[]';
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in response');
  return JSON.parse(match[0]);
}

// ─── FALLBACK: fast random listings (no API needed) ───────────────
function buildFallbackListings(zip: string): RealListing[] {
  const profile = getProfile(zip);
  const streetNames = ['Colfax Ave', 'Blake St', 'Larimer St', 'Market St', 'Champa St', 'Broadway', 'York St', 'Race St', 'Pearl St', 'Logan St'];
  const neighborhoods = profile.name.split(',')[0].split('/').map(n => n.trim());
  const leadTypes: RealListing['leadPhotoType'][] = ['bathroom', 'living_room', 'kitchen', 'bedroom', 'exterior', 'bathroom', 'living_room', 'bedroom'];
  const amenityPool = ['In-unit laundry', 'Rooftop deck', 'Bike storage', 'Dog park', 'Gym', 'Covered parking', 'EV charging', 'Concierge', 'Pool', 'Storage unit'];

  return Array.from({ length: 8 }, (_, i) => {
    const beds = [1, 1, 2, 2, 2, 3, 1, 2][i];
    const baths = beds === 1 ? 1 : beds === 3 ? 2 : rnd(1, 2);
    const sqft = beds * rnd(380, 480) + rnd(80, 180);
    const base = profile.baseRent + (beds - 1.5) * 320 + rnd(-200, 280);
    const fmv = base + rnd(-120, 120);
    const leadType = leadTypes[i];
    const isBathLead = leadType === 'bathroom';

    return {
      id: `fallback-${zip}-${i}-${Date.now()}`,
      address: `${rnd(1200, 4800)} ${pick(streetNames)}, Unit ${rnd(1, 5)}${String.fromCharCode(65 + rnd(0, 5))}, Denver CO ${zip}`,
      neighborhood: pick(neighborhoods),
      beds,
      baths,
      sqft,
      listedPrice: Math.round(base / 5) * 5,
      estimatedFMV: Math.round(fmv / 5) * 5,
      daysOnMarket: rnd(isBathLead ? 18 : 5, isBathLead ? 52 : 28),
      priceDropCount: rnd(0, isBathLead ? 2 : 0),
      priceDropTotal: rnd(0, 150),
      photoCount: rnd(7, 18),
      leadPhotoType: leadType,
      photos: assignPhotos(leadType, rnd(3, 6)),
      description: `${beds}BR/${baths}BA in ${pick(neighborhoods)}. ${pick(['Newly renovated kitchen.', 'Original hardwood floors.', 'City views from private balcony.', 'Updated appliances throughout.'])} ${pick(['Walking distance to light rail.', 'Steps from restaurants and bars.', 'Quiet residential street.', 'Near Cheesman Park.'])}`,
      amenities: amenityPool.sort(() => Math.random() - 0.5).slice(0, rnd(2, 5)),
      ctr: isBathLead ? rndF(0.60, 0.78) : rndF(0.32, 0.68),
      inquiryRate: isBathLead ? rndF(0.07, 0.17) : rndF(0.18, 0.48),
      saveRate: rndF(0.10, 0.34),
      tourConversion: rndF(0.12, 0.44),
      avgTimeOnListing: rndF(1.5, 8.5),
      demandVelocity: rndF(0.40, 0.92),
      vacancyRisk: rndF(0.18, 0.78),
      nearbyComps: rnd(6, 22),
      medianCompPrice: Math.round(fmv / 10) * 10,
      source: 'generated',
    };
  });
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────
export async function fetchMarketData(zipCode: string): Promise<MarketSummary> {
  const profile = getProfile(zipCode);
  let listings: RealListing[];

  try {
    // Try Groq-generated listings first (fresh, varied every call)
    const raw = await generateListingsViaGroq(zipCode, profile);
    listings = raw.map((l, i) => {
      const leadType = (l.leadPhotoType as RealListing['leadPhotoType']) || 'living_room';
      return {
        id: `groq-${zipCode}-${i}-${Date.now()}`,
        address: l.address || `${1000 + i * 100} Market St, Unit ${i + 1}A, Denver CO ${zipCode}`,
        neighborhood: l.neighborhood || profile.name.split(',')[0],
        beds: l.beds || 2,
        baths: l.baths || 1,
        sqft: l.sqft || 900,
        listedPrice: l.listedPrice || profile.baseRent,
        estimatedFMV: l.estimatedFMV || profile.baseRent,
        daysOnMarket: l.daysOnMarket || 14,
        priceDropCount: l.priceDropCount || 0,
        priceDropTotal: l.priceDropTotal || 0,
        photoCount: l.photoCount || 10,
        leadPhotoType: leadType,
        photos: assignPhotos(leadType, Math.min(l.photoCount || 6, 6)),
        description: l.description || '',
        amenities: l.amenities || [],
        ctr: l.ctr || 0.45,
        inquiryRate: l.inquiryRate || 0.25,
        saveRate: l.saveRate || 0.18,
        tourConversion: l.tourConversion || 0.28,
        avgTimeOnListing: l.avgTimeOnListing || 3.5,
        demandVelocity: l.demandVelocity || 0.65,
        vacancyRisk: l.vacancyRisk || 0.35,
        nearbyComps: l.nearbyComps || 12,
        medianCompPrice: l.medianCompPrice || profile.baseRent,
        source: 'groq-generated',
      } as RealListing;
    });
  } catch {
    // Fallback to local random generation if Groq fails
    listings = buildFallbackListings(zipCode);
  }

  const avgDom = Math.round(listings.reduce((s, l) => s + l.daysOnMarket, 0) / listings.length);
  const medianRent = Math.round(listings.reduce((s, l) => s + l.listedPrice, 0) / listings.length);
  const h = profile.hotness;

  return {
    zipCode,
    cityNeighborhood: profile.name,
    medianRent,
    avgDaysOnMarket: avgDom,
    activeListings: listings.length + rnd(4, 10),
    demandTrend: h > 0.78 ? 'hot' : h > 0.65 ? 'neutral' : h > 0.55 ? 'cooling' : 'cold',
    vacancyRate: parseFloat(((1 - h) * 8).toFixed(1)),
    listings,
    fetchedAt: new Date().toISOString(),
  };
}

// ─── STRING BUILDERS ─────────────────────────────────────────────
export function buildPropertyString(l: RealListing): string {
  return [
    `${l.beds}bd/${l.baths}ba, ${l.sqft} sqft at ${l.address}`,
    `Listed $${l.listedPrice.toLocaleString()}/mo | Est FMV $${l.estimatedFMV.toLocaleString()}/mo`,
    `${l.daysOnMarket} days on market`,
    l.priceDropCount > 0 ? `${l.priceDropCount} price drop(s), -$${l.priceDropTotal.toLocaleString()} total` : 'No price drops yet',
    l.description ? `Listing copy: "${l.description}"` : '',
    l.amenities.length ? `Amenities: ${l.amenities.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

export function buildBehavioralString(l: RealListing): string {
  const ctrPct = Math.round(l.ctr * 100);
  const inqPct = Math.round(l.inquiryRate * 100);
  const gap = ctrPct - inqPct;
  const leadNote = l.leadPhotoType === 'bathroom'
    ? '⚠ Lead photo is bathroom — suppresses inquiry rate 30-40% vs living room lead'
    : `Lead photo: ${l.leadPhotoType.replace(/_/g, ' ')}`;

  return [
    `CTR: ${ctrPct}% | Inquiry rate: ${inqPct}% | Gap: ${gap}pp`,
    `Save rate: ${Math.round(l.saveRate * 100)}% | Tour conversion: ${Math.round(l.tourConversion * 100)}%`,
    `Avg time on listing: ${l.avgTimeOnListing} min | Photos: ${l.photoCount}`,
    leadNote,
    l.priceDropCount > 0 ? `${l.priceDropCount} price drop(s) already attempted` : 'No price changes yet',
    `Demand velocity: ${l.demandVelocity}/1.0 | Vacancy risk: ${l.vacancyRisk}/1.0`,
  ].join('\n');
}

export function buildMarketString(l: RealListing, market: MarketSummary): string {
  const diff = ((l.listedPrice - l.estimatedFMV) / l.estimatedFMV * 100).toFixed(1);
  const vsStr = Number(diff) > 0 ? `${diff}% ABOVE` : `${Math.abs(Number(diff))}% BELOW`;
  return [
    `Market: ${market.cityNeighborhood} | Zip ${market.zipCode}`,
    `Median zip rent: $${market.medianRent.toLocaleString()}/mo | This unit: ${vsStr} estimated FMV`,
    `Market avg DOM: ${market.avgDaysOnMarket}d | This unit: ${l.daysOnMarket}d`,
    `Demand trend: ${market.demandTrend.toUpperCase()} | Vacancy rate: ${market.vacancyRate}%`,
    `Nearby comps: ${l.nearbyComps} | Median comp price: $${l.medianCompPrice.toLocaleString()}/mo`,
  ].join('\n');
}
