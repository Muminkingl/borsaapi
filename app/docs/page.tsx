'use client';

import { NavBar } from '@/components/landing/NavBar';
import { CodeSection } from '@/components/landing/CodeSection';
import { Footer } from '@/components/landing/Footer';

export default function DocsPage() {
  return (
    <main style={{ background: '#0d0c09', minHeight: '100vh', color: '#f2ede4' }}>
      <NavBar />
      
      {/* Spacer for fixed nav */}
      <div style={{ height: '60px' }} />

      <CodeSection />

      <Footer />
    </main>
  );
}
