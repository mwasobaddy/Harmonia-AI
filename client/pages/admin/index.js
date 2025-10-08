import React, { useState, useEffect, useRef } from 'react';
import { Header, Hero, ServicesSection, BottomNav, Footer, Info, Layout } from '../../components';

// Main Demo Component
export default function ModernStreetLegalUI() {
  return (    
  <Layout
      title="Home - StreetLegal-AI"
      description="Learn about our mission to provide affordable legal mitigation services powered by AI"
    >
      <Hero />
      <ServicesSection />
      <Info />
      <Footer />
      <BottomNav />
    </Layout>
  );
}