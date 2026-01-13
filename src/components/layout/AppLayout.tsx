import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { SecurityBanner } from '@/components/ui/SecurityBanner';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showSecurityBanner?: boolean;
}

export function AppLayout({ children, showNav = true, showSecurityBanner = true }: AppLayoutProps) {
  const showBanner = showNav && showSecurityBanner;
  
  return (
    <div className="h-full bg-background flex flex-col relative overflow-hidden">
      {showBanner && <SecurityBanner />}
      <main className={`flex-1 flex flex-col overflow-auto ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
