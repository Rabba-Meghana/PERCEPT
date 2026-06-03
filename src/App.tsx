import React from 'react';
import './index.css';
import { Nav, Footer } from './components/NavFooter';
import Hero from './sections/Hero';
import Portfolio from './sections/Portfolio';
import DiagnosisEngine from './sections/DiagnosisEngine';
import RevenueRecovery from './sections/RevenueRecovery';
import SignalHealth from './sections/SignalHealth';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--neu-bg)' }}>
      <Nav />
      <main>
        <Hero />
        <section id="portfolio"><Portfolio /></section>
        <DiagnosisEngine />
        <section id="revenue"><RevenueRecovery /></section>
        <section id="signals"><SignalHealth /></section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
