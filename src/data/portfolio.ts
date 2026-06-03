export type DiagnosisType = 'PERCEPTION' | 'PRICE' | 'AUDIENCE' | 'LATENT';

export interface Property {
  id: string;
  address: string;
  city: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  listedPrice: number;
  aiRecommendedPrice: number;
  daysOnMarket: number;
  diagnosis: DiagnosisType;
  confidence: number;
  clickThroughRate: number;
  inquiryRate: number;
  tourConversionRate: number;
  saveRate: number;
  avgTimeOnListing: number; // seconds
  priceDropCount: number;
  leadPhoto: string;
  annualLeakage: number;
  signals: {
    compsInRadius: number;
    avgCompPrice: number;
    demandVelocity: number; // -100 to +100
    vacancyRisk: number; // 0-100
    dataFreshness: number; // 0-100
  };
  behaviorInsight: string;
  actionRecommendation: string;
}

export const PORTFOLIO: Property[] = [
  {
    id: 'P001', address: '2847 Larimer St #4B', city: 'Denver', zip: '80205',
    beds: 2, baths: 1, sqft: 980, listedPrice: 2780, aiRecommendedPrice: 2580,
    daysOnMarket: 38, diagnosis: 'PERCEPTION', confidence: 91,
    clickThroughRate: 84, inquiryRate: 6, tourConversionRate: 44, saveRate: 22,
    avgTimeOnListing: 94, priceDropCount: 3, leadPhoto: 'bathroom',
    annualLeakage: 2400,
    signals: { compsInRadius: 7, avgCompPrice: 2620, demandVelocity: -12, vacancyRisk: 68, dataFreshness: 94 },
    behaviorInsight: 'Click-through in top 11% of portfolio. Inquiry rate in bottom 9%. Gap of 78 percentile points means renters are interested but something breaks trust before contact.',
    actionRecommendation: 'Lead photo is the bathroom. 847 similar behavioral patterns show units switching to living room leads convert 2.3× faster at same price. Reorder photos before next price change.'
  },
  {
    id: 'P002', address: '1192 Capitol Hill Ave #2A', city: 'Denver', zip: '80203',
    beds: 1, baths: 1, sqft: 650, listedPrice: 1890, aiRecommendedPrice: 1990,
    daysOnMarket: 8, diagnosis: 'LATENT', confidence: 87,
    clickThroughRate: 62, inquiryRate: 48, tourConversionRate: 71, saveRate: 38,
    avgTimeOnListing: 187, priceDropCount: 0, leadPhoto: 'living_room',
    annualLeakage: 1200,
    signals: { compsInRadius: 4, avgCompPrice: 1960, demandVelocity: 28, vacancyRisk: 18, dataFreshness: 98 },
    behaviorInsight: 'Save rate 38% — top 4% of portfolio. Time on listing 187s vs 89s average. Renters are studying this unit, not bouncing. Demand is crystallizing.',
    actionRecommendation: 'Unit is underpriced by $100. Raise to $1,990. Conversion probability holds at 71% based on comp absorption patterns. Do not drop — you will leave $1,200/yr on the table.'
  },
  {
    id: 'P003', address: '4401 Tennyson St #1C', city: 'Denver', zip: '80212',
    beds: 3, baths: 2, sqft: 1420, listedPrice: 3200, aiRecommendedPrice: 2950,
    daysOnMarket: 22, diagnosis: 'PRICE', confidence: 88,
    clickThroughRate: 41, inquiryRate: 31, tourConversionRate: 28, saveRate: 11,
    avgTimeOnListing: 62, priceDropCount: 1, leadPhoto: 'exterior',
    annualLeakage: 3000,
    signals: { compsInRadius: 12, avgCompPrice: 2940, demandVelocity: -31, vacancyRisk: 74, dataFreshness: 91 },
    behaviorInsight: 'Low engagement across all metrics. 12 comps entered within 0.4mi at avg $2,940. Demand velocity -31%. This is a genuine price resistance signal.',
    actionRecommendation: 'Drop to $2,950. Market ceiling here is real. 8 of 12 comparable units leased within 11 days at sub-$3,000. Time-cost of vacancy at current rate exceeds discount loss.'
  },
  {
    id: 'P004', address: '788 South Broadway #5F', city: 'Denver', zip: '80209',
    beds: 2, baths: 2, sqft: 1100, listedPrice: 2600, aiRecommendedPrice: 2600,
    daysOnMarket: 14, diagnosis: 'AUDIENCE', confidence: 82,
    clickThroughRate: 28, inquiryRate: 21, tourConversionRate: 35, saveRate: 9,
    avgTimeOnListing: 48, priceDropCount: 0, leadPhoto: 'kitchen',
    annualLeakage: 1800,
    signals: { compsInRadius: 5, avgCompPrice: 2580, demandVelocity: 8, vacancyRisk: 44, dataFreshness: 96 },
    behaviorInsight: 'Price is correct. Demand velocity positive. But 74% of click traffic is coming from users whose median budget filter ceiling is $2,400. Wrong audience finding this listing.',
    actionRecommendation: 'Do not touch price. Change platform category tags from "budget-friendly" to "modern finishes." Renter profile mismatch is the issue — budget-seekers are clicking and self-selecting out.'
  },
  {
    id: 'P005', address: '3310 Zuni St #B', city: 'Denver', zip: '80211',
    beds: 1, baths: 1, sqft: 720, listedPrice: 1750, aiRecommendedPrice: 1820,
    daysOnMarket: 5, diagnosis: 'LATENT', confidence: 79,
    clickThroughRate: 58, inquiryRate: 44, tourConversionRate: 62, saveRate: 31,
    avgTimeOnListing: 142, priceDropCount: 0, leadPhoto: 'living_room',
    annualLeakage: 840,
    signals: { compsInRadius: 3, avgCompPrice: 1800, demandVelocity: 22, vacancyRisk: 15, dataFreshness: 99 },
    behaviorInsight: 'Early-stage listing with strong engagement signals. Save rate 31% in first 5 days is a top-8% signal. Comps averaging $50 above list.',
    actionRecommendation: 'Raise to $1,820 now. Comparable absorption within 7 days at $1,800-1,840. Early demand signal is strong — don\'t anchor renters at a lower price unnecessarily.'
  },
  {
    id: 'P006', address: '5521 Montview Blvd #3', city: 'Denver', zip: '80207',
    beds: 2, baths: 1, sqft: 890, listedPrice: 2200, aiRecommendedPrice: 2050,
    daysOnMarket: 41, diagnosis: 'PRICE', confidence: 93,
    clickThroughRate: 38, inquiryRate: 27, tourConversionRate: 19, saveRate: 8,
    avgTimeOnListing: 55, priceDropCount: 2, leadPhoto: 'bedroom',
    annualLeakage: 1800,
    signals: { compsInRadius: 9, avgCompPrice: 2060, demandVelocity: -28, vacancyRisk: 81, dataFreshness: 88 },
    behaviorInsight: 'Uniform low engagement. No behavioral anomalies. Comps at $2,060 absorbing cleanly. This is straightforward price resistance.',
    actionRecommendation: 'Reduce to $2,050. Each additional day at $2,200 costs $73 in lost revenue. Two price drops already signal to the market that negotiation is possible — clean reset needed.'
  },
  {
    id: 'P007', address: '910 17th St #12D', city: 'Denver', zip: '80202',
    beds: 1, baths: 1, sqft: 610, listedPrice: 2100, aiRecommendedPrice: 2100,
    daysOnMarket: 12, diagnosis: 'PERCEPTION', confidence: 85,
    clickThroughRate: 71, inquiryRate: 8, tourConversionRate: 55, saveRate: 18,
    avgTimeOnListing: 78, priceDropCount: 0, leadPhoto: 'bathroom',
    annualLeakage: 1440,
    signals: { compsInRadius: 6, avgCompPrice: 2080, demandVelocity: 5, vacancyRisk: 35, dataFreshness: 97 },
    behaviorInsight: 'High CTR, very low inquiry rate. Classic perception gap. The listing is pulling interest but destroying it before conversion. Price is at market.',
    actionRecommendation: 'Description uses 4 negation phrases ("not noisy," "not small"). Negative framing correlates with 41% lower inquiry rates in comparable urban units. Rewrite to affirmative framing. Hold price.'
  },
  {
    id: 'P008', address: '2201 Federal Blvd #7', city: 'Denver', zip: '80211',
    beds: 3, baths: 2, sqft: 1580, listedPrice: 3400, aiRecommendedPrice: 3550,
    daysOnMarket: 9, diagnosis: 'LATENT', confidence: 76,
    clickThroughRate: 67, inquiryRate: 52, tourConversionRate: 68, saveRate: 41,
    avgTimeOnListing: 204, priceDropCount: 0, leadPhoto: 'living_room',
    annualLeakage: 1800,
    signals: { compsInRadius: 4, avgCompPrice: 3520, demandVelocity: 34, vacancyRisk: 12, dataFreshness: 100 },
    behaviorInsight: 'Save rate 41% is top 3% in entire portfolio. Time on listing 204s. This is a high-intent renter pool studying this property in depth.',
    actionRecommendation: 'Raise to $3,550. Demand is latent and crystallizing. Comparable 3/2 units in this zip leased at $3,500-3,600 last 30 days. You\'re leaving $1,800/year on the floor.'
  },
  {
    id: 'P009', address: '1650 Glenarm Place #4A', city: 'Denver', zip: '80202',
    beds: 2, baths: 2, sqft: 1050, listedPrice: 3100, aiRecommendedPrice: 2850,
    daysOnMarket: 31, diagnosis: 'PRICE', confidence: 90,
    clickThroughRate: 35, inquiryRate: 22, tourConversionRate: 24, saveRate: 7,
    avgTimeOnListing: 51, priceDropCount: 2, leadPhoto: 'kitchen',
    annualLeakage: 3000,
    signals: { compsInRadius: 11, avgCompPrice: 2860, demandVelocity: -22, vacancyRisk: 72, dataFreshness: 92 },
    behaviorInsight: 'Comp saturation in this zip. 11 comparable units, all absorbing at sub-$2,900. Consistent low engagement across all behavioral dimensions.',
    actionRecommendation: 'Reduce to $2,850. Market ceiling in 80202 for 2/2 under 1,100sqft is $2,900. Each day of delay costs $83. Vacancy cost exceeds any price reduction risk.'
  },
  {
    id: 'P010', address: '4820 Pecos St #2', city: 'Denver', zip: '80221',
    beds: 2, baths: 1, sqft: 860, listedPrice: 1980, aiRecommendedPrice: 1980,
    daysOnMarket: 18, diagnosis: 'AUDIENCE', confidence: 81,
    clickThroughRate: 31, inquiryRate: 24, tourConversionRate: 42, saveRate: 12,
    avgTimeOnListing: 67, priceDropCount: 0, leadPhoto: 'exterior',
    annualLeakage: 960,
    signals: { compsInRadius: 6, avgCompPrice: 1970, demandVelocity: 3, vacancyRisk: 38, dataFreshness: 95 },
    behaviorInsight: 'Price accurate. Demand velocity flat-positive. Traffic analysis shows 68% of impressions from renters browsing 80211-80212 neighborhoods who are not filtering for 80221.',
    actionRecommendation: 'Geo-targeting mismatch. Listing appearing in wrong neighborhood clusters. Update location tags and cross-list in correct search radius. Price is fine — distribution is the problem.'
  },
  // More properties...
  {
    id: 'P011', address: '3720 Colfax Ave #8B', city: 'Denver', zip: '80206',
    beds: 1, baths: 1, sqft: 590, listedPrice: 1650, aiRecommendedPrice: 1720,
    daysOnMarket: 4, diagnosis: 'LATENT', confidence: 74,
    clickThroughRate: 55, inquiryRate: 41, tourConversionRate: 59, saveRate: 28,
    avgTimeOnListing: 131, priceDropCount: 0, leadPhoto: 'living_room',
    annualLeakage: 840,
    signals: { compsInRadius: 3, avgCompPrice: 1710, demandVelocity: 19, vacancyRisk: 14, dataFreshness: 100 },
    behaviorInsight: 'New listing with immediate strong engagement. Save rate 28% in 4 days exceeds 30-day averages for most portfolio units.',
    actionRecommendation: 'Raise to $1,720. Early adopter demand signal present. Do not anchor at lower price — comparable units at $1,710-1,730 absorbing in under 10 days.'
  },
  {
    id: 'P012', address: '612 Sherman St #1', city: 'Denver', zip: '80203',
    beds: 3, baths: 2, sqft: 1680, listedPrice: 3600, aiRecommendedPrice: 3300,
    daysOnMarket: 27, diagnosis: 'PRICE', confidence: 86,
    clickThroughRate: 29, inquiryRate: 18, tourConversionRate: 15, saveRate: 6,
    avgTimeOnListing: 44, priceDropCount: 1, leadPhoto: 'exterior',
    annualLeakage: 3600,
    signals: { compsInRadius: 8, avgCompPrice: 3320, demandVelocity: -18, vacancyRisk: 76, dataFreshness: 89 },
    behaviorInsight: 'Across-the-board low engagement. No behavioral anomalies suggesting perception or audience issues. Clean price resistance signal.',
    actionRecommendation: 'Reduce to $3,300. Market evidence is unambiguous. 8 comparable 3/2 units cleared at avg $3,320 in last 60 days.'
  },
  {
    id: 'P013', address: '1840 Market St #11C', city: 'Denver', zip: '80202',
    beds: 1, baths: 1, sqft: 640, listedPrice: 2300, aiRecommendedPrice: 2300,
    daysOnMarket: 16, diagnosis: 'PERCEPTION', confidence: 88,
    clickThroughRate: 79, inquiryRate: 5, tourConversionRate: 48, saveRate: 16,
    avgTimeOnListing: 83, priceDropCount: 1, leadPhoto: 'bathroom',
    annualLeakage: 1200,
    signals: { compsInRadius: 5, avgCompPrice: 2280, demandVelocity: 11, vacancyRisk: 29, dataFreshness: 96 },
    behaviorInsight: 'CTR 79% (top 7% portfolio) but inquiry rate 5% (bottom 6% portfolio). 74-percentile gap is the highest perception signal in current portfolio.',
    actionRecommendation: 'Lead photo: bathroom with visible mildew-adjacent grouting. This is the single most common trust-breaking image pattern in our dataset. Replace photo immediately. Price at market — do not drop.'
  },
  {
    id: 'P014', address: '527 Corona St #3D', city: 'Denver', zip: '80218',
    beds: 2, baths: 1, sqft: 920, listedPrice: 2450, aiRecommendedPrice: 2450,
    daysOnMarket: 11, diagnosis: 'LATENT', confidence: 83,
    clickThroughRate: 61, inquiryRate: 47, tourConversionRate: 64, saveRate: 34,
    avgTimeOnListing: 168, priceDropCount: 0, leadPhoto: 'living_room',
    annualLeakage: 600,
    signals: { compsInRadius: 4, avgCompPrice: 2440, demandVelocity: 16, vacancyRisk: 19, dataFreshness: 98 },
    behaviorInsight: 'Strong latent demand. High save rate and time on listing indicate serious renters in consideration phase.',
    actionRecommendation: 'Hold price. Demand will crystallize within 5-8 days based on comparable consideration cycle patterns. Do not create unnecessary urgency with price drops.'
  },
  {
    id: 'P015', address: '2100 Stout St #6A', city: 'Denver', zip: '80205',
    beds: 2, baths: 2, sqft: 1140, listedPrice: 2900, aiRecommendedPrice: 2700,
    daysOnMarket: 33, diagnosis: 'PRICE', confidence: 91,
    clickThroughRate: 33, inquiryRate: 25, tourConversionRate: 21, saveRate: 8,
    avgTimeOnListing: 53, priceDropCount: 2, leadPhoto: 'kitchen',
    annualLeakage: 2400,
    signals: { compsInRadius: 10, avgCompPrice: 2720, demandVelocity: -24, vacancyRisk: 79, dataFreshness: 93 },
    behaviorInsight: 'Classic price resistance. Comp density high. Demand velocity negative. No behavioral signals suggesting perception or audience issues.',
    actionRecommendation: 'Reduce to $2,700. Three months of vacancy at current trajectory costs $8,700. Market ceiling is $2,750 — price below it to accelerate.'
  },
];

export const PORTFOLIO_STATS = {
  totalProperties: 2714,
  totalAnnualLeakage: 4_280_000,
  perceptionProblems: 34,
  priceProblems: 41,
  audienceProblems: 18,
  latentDemand: 27,
  avgDaysOnMarket: 19.4,
  leakageRecoveredPotential: 3_840_000,
};

export const DIAGNOSIS_META: Record<DiagnosisType, {
  label: string; color: string; tagClass: string; dotClass: string;
  short: string; colorClass: string;
}> = {
  PERCEPTION: {
    label: 'Perception Problem',
    color: '#C8A098',
    tagClass: 't-blush',
    dotClass: 'd-blush',
    short: 'Perception',
    colorClass: 'cc-blush',
  },
  PRICE: {
    label: 'Price Resistance',
    color: '#7AAABE',
    tagClass: 't-blue',
    dotClass: 'd-blue',
    short: 'Price',
    colorClass: 'cc-blue',
  },
  AUDIENCE: {
    label: 'Audience Mismatch',
    color: '#7AAA88',
    tagClass: 't-sage',
    dotClass: 'd-sage',
    short: 'Audience',
    colorClass: 'cc-sage',
  },
  LATENT: {
    label: 'Latent Demand',
    color: '#9888B8',
    tagClass: 't-lav',
    dotClass: 'd-lav',
    short: 'Latent',
    colorClass: 'cc-lav',
  },
};
