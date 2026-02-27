'use client';

import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { InventorySection } from '@/components/InventorySection';
import { TransactionSection } from '@/components/TransactionSection';
import { DashboardSection } from '@/components/DashboardSection';
import { SettingsSection } from '@/components/SettingsSection';
import { useStore } from '@/lib/store';

export default function Home() {
  const _hasHydrated = useStore((state) => state._hasHydrated);
  const loadSampleData = useStore((state) => state.loadSampleData);

  useEffect(() => {
    // After hydration, load sample data if needed
    if (_hasHydrated) {
      loadSampleData();
    }
  }, [_hasHydrated, loadSampleData]);

  // Show nothing during SSR to prevent hydration mismatch
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <InventorySection />
        <TransactionSection />
        <DashboardSection />
        <SettingsSection />
      </main>
      <Footer />
    </div>
  );
}
