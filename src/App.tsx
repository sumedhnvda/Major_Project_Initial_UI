import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import DemoSection from './components/DemoSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-cream-100">
      <Header />
      <main>
        <Hero />
        <DemoSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;