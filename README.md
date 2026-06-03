# PERCEPT

**Revenue Diagnosis Engine for Property Portfolios**

PERCEPT is the pricing agent that knows what it doesn't know. While every other proptech tool outputs a price recommendation, PERCEPT tells you whether price is even the right variable to optimize — and which lever actually moves revenue.

## The Core Insight

Across 2,700+ properties, a 1% pricing gap compounds into millions in annual revenue leakage. But most of that leakage isn't a pricing problem. It's a perception problem, an audience mismatch, or latent demand being systematically underpriced.

PERCEPT classifies every underperforming unit into one of four failure modes:

| Diagnosis | Signal Pattern | Action |
|-----------|---------------|--------|
| **Perception Problem** | High CTR, low inquiry rate | Fix presentation — not price |
| **Price Resistance** | Low engagement across all metrics | Reduce price to market ceiling |
| **Audience Mismatch** | Moderate engagement, wrong renter profile | Fix distribution — not price |
| **Latent Demand** | High save rate, high time-on-listing | Hold or raise price — demand is crystallizing |

## Architecture

Built with a 3-node LangGraph pipeline:

```
IngestNode → BehavioralAnalysisNode → DiagnosisNode
```

Each node reasons over structured behavioral exhaust data — click-through rates, inquiry rates, save rates, time-on-listing, lead photo type — and produces a diagnosis with confidence score and provenance receipt.

## Stack

- **React + TypeScript** — frontend
- **LangGraph** — multi-node reasoning pipeline
- **Groq (llama3-70b-8192)** — fast inference, zero latency
- **Custom neumorphic UI** — soft 3D design system

## Setup

```bash
npm install
echo "REACT_APP_GROQ_API_KEY=your_key_here" > .env
npm start
```

Get a free Groq API key at [console.groq.com](https://console.groq.com)

## Built by

Meghana Rabba — AI Engineer  
LLM pipelines · Eval harnesses · LangGraph · TypeScript · Python
