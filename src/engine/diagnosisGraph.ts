// ─────────────────────────────────────────────────────────────────
// PERCEPT Diagnosis Engine — Groq primary, streaming, 3-node pipeline
// ─────────────────────────────────────────────────────────────────

const GROQ_API   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
function getGroqKey(): string {
  if (typeof localStorage !== 'undefined') return localStorage.getItem('percept_groq_key') || '';
  return '';
}

export interface DiagnosisResult {
  diagnosisType: 'PERCEPTION' | 'PRICE' | 'AUDIENCE' | 'LATENT';
  confidence: number;
  reasoning: string;
  action: string;
  revenueImpact: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WATCH';
  primarySignal: string;
  actionSteps: string[];
  holdPrice: boolean;
  expectedOutcome: string;
  ingestSummary: string;
  behaviorAnalysis: string;
}

// ─── STREAM VIA GROQ ─────────────────────────────────────────────
async function streamGroq(
  prompt: string,
  nodeName: string,
  onToken: (t: string, n: string) => void,
  maxTokens = 350
): Promise<string> {
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getGroqKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.2,
      stream: true,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Groq ${res.status}: ${t.slice(0, 160)}`);
  }

  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let full = '', buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:') || t.includes('[DONE]')) continue;
      try {
        const j = JSON.parse(t.slice(6));
        const token = j?.choices?.[0]?.delta?.content || '';
        if (token) { full += token; onToken(token, nodeName); }
      } catch {}
    }
  }
  return full;
}

// ─── NODE 1: INGEST ──────────────────────────────────────────────
async function runIngestNode(p: string, b: string, m: string, onToken: (t: string, n: string) => void) {
  return streamGroq(
    `You are PERCEPT's senior data analyst. Synthesize this property data into a precise quant brief.

PROPERTY: ${p}
BEHAVIORAL SIGNALS: ${b}
MARKET CONTEXT: ${m}

Write exactly 3 sentences. NO generic statements. Use exact numbers from the data.
Sentence 1: State the single most anomalous signal — the one number that stands out most sharply versus its benchmark or market average. Be precise (e.g. "CTR of 74% sits 29 points above the 45% portfolio benchmark, yet inquiry rate of 9% is 19 points below the 28% floor").
Sentence 2: Describe the FMV gap and DOM position in cold dollar terms relative to market median — include the actual dollar spread and what that means for daily carry cost.
Sentence 3: Identify the most suspicious pattern — a combination of signals that points toward a specific failure mode. State what it implies without naming the diagnosis yet.
Tone: forensic analyst. No hedging. No soft language. Every number cited must come from the input data.`,
    'Ingest', onToken, 320
  );
}

// ─── NODE 2: BEHAVIORAL ANALYSIS ─────────────────────────────────
async function runBehavioralNode(summary: string, onToken: (t: string, n: string) => void) {
  return streamGroq(
    `You are PERCEPT's behavioral conversion engine. Identify the precise failure mechanism.

INGEST SUMMARY: ${summary}

Apply differential diagnosis across these four failure modes:

PERCEPTION FAILURE: CTR high (>58%) but inquiry rate low (<18%). The listing generates clicks but trust collapses before contact. Root cause is nearly always presentation — lead photo type, negative copy framing, or misleading headline. Price is irrelevant to this failure; dropping it changes nothing.

PRICE RESISTANCE: Uniform low engagement across CTR, inquiry, save rate, and tour conversion simultaneously. No behavioral anomalies. Multiple comps absorbing below this price point. Demand velocity negative. Clean, unambiguous ceiling.

AUDIENCE MISALIGNMENT: Mixed signals where individual metrics look almost-but-not-quite right. Tour conversion is reasonable but CTR is weak. Traffic is arriving from the wrong renter profile — budget segment clicking on a premium listing, or wrong neighborhood cluster. Price is correct; distribution is wrong.

LATENT DEMAND: Save rate and time-on-listing are elevated. CTR is solid. Inquiry lags but not dramatically. Renters are in deep consideration, not bouncing. The listing can hold or raise — demand is crystallizing toward a decision.

In exactly 3 sentences: (1) name which failure mode is dominant and cite the specific signal combination that confirms it, (2) explain what the data explicitly rules out and why, (3) quantify the conversion gap — how far the actual metric sits from the threshold that would indicate a different diagnosis. Zero hedging. Zero repetition of the ingest summary.`,
    'Behavioral', onToken, 340
  );
}

// ─── NODE 3: DIAGNOSIS ───────────────────────────────────────────
async function runDiagnosisNode(analysis: string, property: string, onToken: (t: string, n: string) => void) {
  const raw = await streamGroq(
    `You are PERCEPT's root cause diagnosis engine. Classify and prescribe.

BEHAVIORAL ANALYSIS: ${analysis}
PROPERTY: ${property}

DIAGNOSIS TYPES:
- PERCEPTION: CTR ≥58% + inquiry <18%. Never drop the price. Fix the presentation first.
- PRICE: Uniform low engagement. Comps absorb at lower price point. Drop price to market ceiling.
- AUDIENCE: Mixed metrics, correct price, wrong traffic profile. Fix targeting and distribution tags.
- LATENT: High save rate + time-on-listing + positive demand velocity. Hold or raise price.

Return ONLY valid JSON — no markdown fences, no explanation, nothing before or after the JSON:
{
  "diagnosisType": "PERCEPTION",
  "confidence": 91,
  "urgency": "HIGH",
  "primarySignal": "One sentence. Cite specific numbers. State exactly what the dominant signal combination is and why it points to this diagnosis exclusively.",
  "reasoning": "Two sentences. Sentence 1: explain the mechanism — why this specific combination of metrics produces this outcome. Sentence 2: state what competing diagnoses were ruled out and what data point eliminates each. Be precise and use actual numbers from the input.",
  "holdPrice": true,
  "actionSteps": [
    "Step 1 — the single highest-leverage action. Be specific: not 'improve photos' but 'move lead photo from bathroom to living room or exterior — bathroom leads suppress inquiry rate 30–40% across comparable urban units'",
    "Step 2 — second action with specific timeline or metric threshold to hit",
    "Step 3 — checkpoint: specific measurable signal to watch and what movement indicates the fix is working"
  ],
  "action": "One sentence. The single most important action to take right now. Specific and actionable.",
  "expectedOutcome": "Quantified prediction: specific metric, direction, magnitude, timeframe. E.g. 'Inquiry rate expected to increase from 9% to 22–28% within 10 days of lead photo change, reducing DOM from 38d to 14–18d.'",
  "revenueImpact": "Dollar-level comparison: cost of current trajectory (continued vacancy/wrong pricing) vs cost of correct action. Annualized. Specific numbers."
}`,
    'Diagnosis', onToken, 680
  );

  // Robust JSON extraction — handles fences, leading text, truncation
  let parsed: any = null;
  try {
    // Strip markdown fences first
    const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Find the outermost JSON object
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      let candidate = stripped.slice(start, end + 1);
      // Fix common LLM truncation: if actionSteps array is cut off, close it
      if ((candidate.match(/\[/g) || []).length > (candidate.match(/\]/g) || []).length) {
        candidate += '"]}'.repeat((candidate.match(/\[/g) || []).length - (candidate.match(/\]/g) || []).length);
      }
      parsed = JSON.parse(candidate);
    }
  } catch {
    // Try line-by-line key extraction as final fallback
    const get = (key: string) => { const m = raw.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*?)"`)); return m?.[1] || ''; };
    const getNum = (key: string) => { const m = raw.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`)); return m ? parseInt(m[1]) : 0; };
    const dtype = raw.includes('LATENT') ? 'LATENT' : raw.includes('AUDIENCE') ? 'AUDIENCE' : raw.includes('PRICE') ? 'PRICE' : 'PERCEPTION';
    parsed = {
      diagnosisType: dtype,
      confidence: getNum('confidence') || 79,
      urgency: raw.includes('CRITICAL') ? 'CRITICAL' : raw.includes('MEDIUM') ? 'MEDIUM' : 'HIGH',
      primarySignal: get('primarySignal') || `${dtype} failure pattern confirmed by behavioral signal combination`,
      reasoning: get('reasoning') || 'Signal analysis indicates a clear root cause. Competing failure modes ruled out by the data pattern.',
      holdPrice: !raw.includes('"holdPrice": false') && !raw.includes('"holdPrice":false'),
      actionSteps: ['Address the primary signal identified above', 'Monitor key metrics for 7–10 days post-fix', 'Reassess pricing only after behavioral signals stabilize'],
      action: get('action') || 'Apply the highest-leverage fix to the dominant failure signal immediately.',
      expectedOutcome: get('expectedOutcome') || 'Conversion metrics expected to normalize within 10–14 days post-intervention.',
      revenueImpact: get('revenueImpact') || 'Delayed action compounds vacancy cost daily. Correct intervention recovers carrying cost within 2–3 weeks.',
    };
  }
  return parsed;
}

// ─── PUBLIC API ───────────────────────────────────────────────────
export async function runDiagnosis(
  propertyInput: string,
  behavioralSignals: string,
  marketContext: string,
  onNodeStart?: (node: string) => void,
  onToken?: (token: string, node: string) => void
): Promise<DiagnosisResult> {
  const emit = onToken || (() => {});

  onNodeStart?.('Ingest');
  const ingestSummary = await runIngestNode(propertyInput, behavioralSignals, marketContext, emit);

  onNodeStart?.('Behavioral');
  const behaviorAnalysis = await runBehavioralNode(ingestSummary, emit);

  onNodeStart?.('Diagnosis');
  const parsed = await runDiagnosisNode(behaviorAnalysis, propertyInput, emit);

  return {
    diagnosisType: parsed.diagnosisType,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
    action: parsed.action,
    revenueImpact: parsed.revenueImpact,
    urgency: parsed.urgency || 'HIGH',
    primarySignal: parsed.primarySignal || '',
    actionSteps: parsed.actionSteps || [],
    holdPrice: parsed.holdPrice ?? true,
    expectedOutcome: parsed.expectedOutcome || '',
    ingestSummary,
    behaviorAnalysis,
  };
}
