import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { SecurityBanner } from '@/components/ui/SecurityBanner';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showSecurityBanner?: boolean;
}

export function AppLayout({ children, showNav = true, showSecurityBanner = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {showSecurityBanner && <SecurityBanner />}
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
