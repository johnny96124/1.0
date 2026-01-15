import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { SecurityBanner } from '@/components/ui/SecurityBanner';
import { Button } from '@/components/ui/button';

export interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showSecurityBanner?: boolean;
  // Header props
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function AppLayout({ 
  children, 
  showNav = true, 
  showSecurityBanner = true,
  title,
  showBack = false,
  onBack,
  rightAction,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const showBanner = showNav && showSecurityBanner;
  const hasHeader = title || showBack || rightAction;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="h-full bg-background flex flex-col relative overflow-hidden">
      {showBanner && <SecurityBanner />}
      
      {/* Page Header */}
      {hasHeader && (
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border/30 sticky top-0 z-10"
        >
          <div className="w-10">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 -ml-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
          </div>
          
          {title && (
            <h1 className="text-lg font-semibold text-foreground">
              {title}
            </h1>
          )}
          
          <div className="w-10 flex justify-end">
            {rightAction}
          </div>
        </motion.header>
      )}
      
      <main className={`flex-1 flex flex-col overflow-auto ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
